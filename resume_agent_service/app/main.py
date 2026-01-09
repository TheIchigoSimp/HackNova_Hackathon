from uuid import uuid4
import json
import asyncio
import logging
import traceback
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from langchain_core.messages import HumanMessage, AIMessageChunk

from app.core.config import get_settings
from app.services.resume_service import (
    ingest_resume_pdf, 
    thread_has_resume, 
    get_thread_metadata,
    get_retriever
)
from app.tools.ats_scorer import calculate_ats_score
from app.graph import resume_agent
from app.memory.checkpointer import list_all_threads
from app.memory.thread_store import get_user_threads, update_thread_ats_score

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("resume_agent")

settings = get_settings()

# Track which threads have completed analysis
_THREAD_ANALYSIS_COMPLETE: Dict[str, bool] = {}

app = FastAPI(
    title="Resume Agent Service",
    description="Microservice for Resume Analysis and Agentic Chat powered by LangGraph",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Request/Response Models ---
class ChatRequest(BaseModel):
    thread_id: str
    message: str


class ChatResponse(BaseModel):
    thread_id: str
    response: str


class ATSBreakdown(BaseModel):
    technical_skills: int
    soft_skills: int
    action_verbs: int
    formatting: int


class ResumeAnalysisResponse(BaseModel):
    thread_id: str
    filename: str
    pages: int
    chunks: int
    ats_score: float
    ats_breakdown: ATSBreakdown
    skills_found: List[str]
    action_verbs_found: List[str]
    suggestions: List[str]
    message: str


# --- Endpoints ---
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    logger.info("Health check requested")
    return {
        "status": "healthy",
        "service": "resume_agent_service",
        "environment": settings.ENVIRONMENT
    }


@app.post("/resume/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(
    file: UploadFile = File(...),
    thread_id: Optional[str] = None,
    user_id: str = Query(..., description="User ID to associate this resume with")
):
    """
    Upload a PDF resume for analysis.
    """
    logger.info(f"Resume upload requested: filename={file.filename}, thread_id={thread_id}, user_id={user_id}")
    
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    if not thread_id:
        thread_id = str(uuid4())
        logger.info(f"Generated new thread_id: {thread_id}")
    
    file_bytes = await file.read()
    logger.info(f"Read {len(file_bytes)} bytes from file")
    
    try:
        # Step 1: Ingest PDF and build vector store
        logger.info(f"Ingesting PDF for thread {thread_id}, user {user_id}")
        ingest_result = ingest_resume_pdf(file_bytes, thread_id, user_id, file.filename)
        logger.info(f"Ingest result: pages={ingest_result['pages']}, chunks={ingest_result['chunks']}")
        
        # Step 2: Use full text directly from ingest (retriever may be empty due to eventual consistency)
        full_text = ingest_result.get("full_text", "")
        logger.info(f"Using {len(full_text)} chars for ATS analysis")
        
        # Step 3: Run ATS scoring
        logger.info("Calculating ATS score")
        ats_result = calculate_ats_score(full_text)
        logger.info(f"ATS score: {ats_result['total_score']}")
        
        # Update ATS score in MongoDB
        update_thread_ats_score(thread_id, ats_result["total_score"])
        _THREAD_ANALYSIS_COMPLETE[thread_id] = True
        
        return ResumeAnalysisResponse(
            thread_id=thread_id,
            filename=ingest_result["filename"],
            pages=ingest_result["pages"],
            chunks=ingest_result["chunks"],
            ats_score=ats_result["total_score"],
            ats_breakdown=ATSBreakdown(**ats_result["breakdown"]),
            skills_found=ats_result["found_skills"],
            action_verbs_found=ats_result["found_verbs"],
            suggestions=ats_result["suggestions"],
            message="Resume analyzed successfully! You can now chat about your resume."
        )
    except Exception as e:
        logger.error(f"Upload error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the Resume Agent (non-streaming).
    """
    thread_id = request.thread_id
    logger.info(f"Chat request: thread_id={thread_id}, message={request.message[:50]}...")
    
    if not thread_has_resume(thread_id):
        logger.warning(f"No resume found for thread {thread_id}")
        raise HTTPException(
            status_code=400,
            detail="No resume found for this thread. Please upload a resume first."
        )
    
    config = {"configurable": {"thread_id": thread_id}}
    input_state = {
        "messages": [HumanMessage(content=request.message)],
        "mode": "chat",
        "thread_id": thread_id,
        "resume_analysis": None,
        "analysis_complete": True
    }
    
    try:
        logger.info(f"Invoking agent for thread {thread_id}")
        result = resume_agent.invoke(input_state, config=config)
        
        messages = result.get("messages", [])
        last_message = messages[-1].content if messages else "No response generated."
        logger.info(f"Agent response: {last_message[:100]}...")
        
        return ChatResponse(
            thread_id=thread_id,
            response=last_message
        )
    except Exception as e:
        logger.error(f"Chat error: {str(e)}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):
    """
    Stream chat responses token by token using Server-Sent Events (SSE).
    """
    thread_id = request.thread_id
    logger.info(f"Stream chat request: thread_id={thread_id}, message={request.message[:50]}...")
    
    if not thread_has_resume(thread_id):
        logger.warning(f"No resume found for thread {thread_id}")
        raise HTTPException(
            status_code=400,
            detail="No resume found for this thread. Please upload a resume first."
        )
    
    config = {"configurable": {"thread_id": thread_id}}
    input_state = {
        "messages": [HumanMessage(content=request.message)],
        "mode": "chat",
        "thread_id": thread_id,
        "resume_analysis": None,
        "analysis_complete": True
    }
    
    async def event_generator():
        """Generate SSE events from the LangGraph stream."""
        full_response = ""
        
        try:
            logger.info(f"Starting stream for thread {thread_id}")
            
            # Use astream_events for token-level streaming
            async for event in resume_agent.astream_events(input_state, config=config, version="v2"):
                event_type = event.get("event", "")
                
                # Log all events for debugging
                if event_type not in ["on_chain_start", "on_chain_end", "on_parser_start", "on_parser_end"]:
                    logger.debug(f"Event: {event_type}")
                
                # Stream tokens from the chat model
                if event_type == "on_chat_model_stream":
                    chunk = event.get("data", {}).get("chunk")
                    if chunk and hasattr(chunk, "content") and chunk.content:
                        token = chunk.content
                        full_response += token
                        yield f"data: {json.dumps({'token': token})}\n\n"
                
                # Handle tool calls
                elif event_type == "on_tool_start":
                    tool_name = event.get("name", "tool")
                    logger.info(f"Tool started: {tool_name}")
                    yield f"data: {json.dumps({'status': f'Using {tool_name}...'})}\n\n"
                
                elif event_type == "on_tool_end":
                    tool_name = event.get("name", "tool")
                    logger.info(f"Tool ended: {tool_name}")
                    
            logger.info(f"Stream complete, total response: {len(full_response)} chars")
            yield f"data: {json.dumps({'done': True, 'full_response': full_response})}\n\n"
            yield "data: [DONE]\n\n"
            
        except Exception as e:
            error_msg = str(e)
            logger.error(f"Stream error: {error_msg}\n{traceback.format_exc()}")
            yield f"data: {json.dumps({'error': error_msg})}\n\n"
            yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@app.get("/threads")
async def get_threads():
    """List all available thread IDs."""
    logger.info("Listing threads")
    return {"threads": list_all_threads()}


@app.get("/threads/{thread_id}/metadata")
async def get_thread_info(thread_id: str):
    """Get metadata for a specific thread's resume."""
    logger.info(f"Getting metadata for thread {thread_id}")
    metadata = get_thread_metadata(thread_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Thread not found or no resume uploaded.")
    return metadata


@app.get("/users/{user_id}/threads")
async def get_user_conversation_history(user_id: str):
    """
    Get all conversation threads for a specific user.
    Returns list of threads with resume metadata, sorted by most recent.
    """
    logger.info(f"Getting thread history for user {user_id}")
    threads = get_user_threads(user_id)
    return {
        "user_id": user_id,
        "threads": threads,
        "count": len(threads)
    }


@app.get("/threads/{thread_id}/history")
async def get_thread_message_history(thread_id: str):
    """
    Get full conversation history for a thread.
    Retrieves messages from LangGraph checkpointer.
    """
    from app.memory.checkpointer import get_checkpointer
    
    logger.info(f"Getting message history for thread {thread_id}")
    
    checkpointer = get_checkpointer()
    config = {"configurable": {"thread_id": thread_id}}
    
    try:
        # Get the latest checkpoint for this thread
        checkpoint_tuple = checkpointer.get_tuple(config)
        if not checkpoint_tuple:
            raise HTTPException(status_code=404, detail="Thread not found or no conversation history.")
        
        checkpoint = checkpoint_tuple.checkpoint
        messages = checkpoint.get("channel_values", {}).get("messages", [])
        
        # Format messages for response
        formatted_messages = []
        for msg in messages:
            role = "human" if hasattr(msg, "type") and msg.type == "human" else "ai"
            content = msg.content if hasattr(msg, "content") else str(msg)
            formatted_messages.append({"role": role, "content": content})
        
        return {
            "thread_id": thread_id,
            "messages": formatted_messages,
            "message_count": len(formatted_messages)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting thread history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve history: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development")
    )

