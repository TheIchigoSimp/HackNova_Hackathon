from uuid import uuid4
import json
import asyncio
import logging
import traceback
import re
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


def clean_tool_output_from_response(text: str) -> str:
    """
    Remove raw JSON tool outputs from LLM response text.
    The LLM sometimes includes the tool output JSON before its actual response.
    """
    if not text:
        return text
    
    # Pattern to match JSON objects that look like tool output
    # e.g., {"found": true, "content": "...", "_internal_note": "..."}
    json_pattern = r'\{["\'](?:found|content|error|query|context)["\']:\s*(?:true|false|null|"[^"]*"|\'[^\']*\'|\[[^\]]*\]|\{[^}]*\})[^}]*\}'
    
    # Remove JSON blocks
    cleaned = re.sub(json_pattern, '', text, flags=re.DOTALL)
    
    # Clean up any remaining artifacts
    cleaned = cleaned.strip()
    
    # If cleaning removed everything, return original (edge case)
    if not cleaned and text:
        # Try simpler approach: find where actual text starts after JSON
        if text.strip().startswith('{'):
            # Find the last closing brace and take everything after
            last_brace = text.rfind('}')
            if last_brace != -1 and last_brace < len(text) - 1:
                cleaned = text[last_brace + 1:].strip()
        
        # Still nothing? Return original
        if not cleaned:
            return text
    
    return cleaned

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
    
    config = {
        "configurable": {"thread_id": thread_id},
        "recursion_limit": 10  # Prevent infinite tool call loops
    }
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
    
    config = {
        "configurable": {"thread_id": thread_id},
        "recursion_limit": 10  # Prevent infinite tool call loops
    }
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
        in_tool_call = False
        buffered_content = ""  # Buffer all content during/after tool calls
        has_tool_been_called = False
        final_answer_started = False
        
        try:
            logger.info(f"Starting stream for thread {thread_id}")
            
            # Use astream_events for token-level streaming
            async for event in resume_agent.astream_events(input_state, config=config, version="v2"):
                event_type = event.get("event", "")
                
                # Track tool call state
                if event_type == "on_tool_start":
                    in_tool_call = True
                    has_tool_been_called = True
                    tool_name = event.get("name", "tool")
                    logger.info(f"Tool started: {tool_name}")
                    yield f"data: {json.dumps({'status': 'Analyzing your resume...'})}\n\n"
                
                elif event_type == "on_tool_end":
                    in_tool_call = False
                    tool_name = event.get("name", "tool")
                    logger.info(f"Tool ended: {tool_name}")
                    # Reset buffer for fresh capture of LLM's synthesized response
                    buffered_content = ""
                
                # Stream tokens from the chat model
                elif event_type == "on_chat_model_stream" and not in_tool_call:
                    chunk = event.get("data", {}).get("chunk")
                    if chunk and hasattr(chunk, "content") and chunk.content:
                        token = chunk.content
                        
                        if has_tool_been_called:
                            # After a tool call, buffer content and look for answer patterns
                            buffered_content += token
                            
                            # Check if we've reached the actual answer portion
                            # Look for common answer patterns
                            buffer_lower = buffered_content.lower()
                            answer_indicators = [
                                "the resume belongs to",
                                "this resume is for",
                                "the owner of this resume",
                                "based on the resume",
                                "according to the resume",
                                "the resume shows",
                                "from the resume",
                                "i can see that",
                                "the name on the resume",
                                "your resume",
                            ]
                            
                            for indicator in answer_indicators:
                                if indicator in buffer_lower and not final_answer_started:
                                    # Found the answer! Stream from this point
                                    final_answer_started = True
                                    idx = buffer_lower.find(indicator)
                                    answer_text = buffered_content[idx:]
                                    full_response = answer_text
                                    yield f"data: {json.dumps({'token': answer_text})}\n\n"
                                    break
                            
                            if final_answer_started:
                                # Continue streaming subsequent tokens
                                full_response += token
                                yield f"data: {json.dumps({'token': token})}\n\n"
                        else:
                            # No tool call, stream directly
                            full_response += token
                            yield f"data: {json.dumps({'token': token})}\n\n"
            
            # If we buffered content but never found an answer pattern, send it all
            if has_tool_been_called and not final_answer_started and buffered_content:
                # Just send the last part (likely the answer)
                lines = buffered_content.strip().split('\n')
                # Take last few lines as the answer
                answer = '\n'.join(lines[-3:]) if len(lines) > 3 else buffered_content
                full_response = answer
                yield f"data: {json.dumps({'token': answer})}\n\n"
            
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


@app.get("/debug/vectorstore/{thread_id}")
async def debug_vectorstore(thread_id: str):
    """
    Debug endpoint to check vector store contents for a thread.
    """
    from pymongo import MongoClient
    import os
    
    client = MongoClient(os.getenv("MONGODB_URI"))
    db = client[os.getenv("DB_NAME", "test")]
    collection = db[os.getenv("COLLECTION_NAME", "vectorstore")]
    
    # Check how many documents exist for this thread
    docs = list(collection.find({"thread_id": thread_id}).limit(5))
    
    # Check field names in documents
    sample_fields = []
    for doc in docs:
        fields = list(doc.keys())
        has_embedding = "embedding" in fields
        has_embeddings = "embeddings" in fields
        sample_fields.append({
            "fields": fields,
            "has_embedding_singular": has_embedding,
            "has_embedding_plural": has_embeddings,
            "text_preview": doc.get("text", doc.get("page_content", ""))[:200] if doc else None
        })
    
    # Count total docs for thread
    total_count = collection.count_documents({"thread_id": thread_id})
    
    # Test retriever
    retriever = get_retriever(thread_id)
    retriever_result = []
    if retriever:
        try:
            results = retriever.invoke("skills experience education")
            retriever_result = [{"content": r.page_content[:200], "metadata": r.metadata} for r in results]
        except Exception as e:
            retriever_result = [{"error": str(e)}]
    
    return {
        "thread_id": thread_id,
        "total_documents": total_count,
        "sample_documents": sample_fields,
        "retriever_test": retriever_result,
        "has_resume": thread_has_resume(thread_id)
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development")
    )

