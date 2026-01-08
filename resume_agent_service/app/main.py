from uuid import uuid4
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from langchain_core.messages import HumanMessage

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
    return {
        "status": "healthy",
        "service": "resume_agent_service",
        "environment": settings.ENVIRONMENT
    }


@app.post("/resume/upload", response_model=ResumeAnalysisResponse)
async def upload_resume(
    file: UploadFile = File(...),
    thread_id: Optional[str] = None
):
    """
    Upload a PDF resume for analysis.
    
    - Creates a new thread if none provided.
    - Ingests the PDF, builds vector index.
    - IMMEDIATELY runs ATS analysis and returns full results.
    - Thread becomes ready for normal chat after this.
    """
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    
    # Generate thread ID if not provided
    if not thread_id:
        thread_id = str(uuid4())
    
    file_bytes = await file.read()
    
    try:
        # Step 1: Ingest PDF and build vector store
        ingest_result = ingest_resume_pdf(file_bytes, thread_id, file.filename)
        
        # Step 2: Retrieve full resume text for ATS analysis
        retriever = get_retriever(thread_id)
        if retriever is None:
            raise HTTPException(status_code=500, detail="Failed to create retriever.")
        
        # Get comprehensive resume content
        all_chunks = retriever.invoke("skills experience education projects summary contact")
        full_text = "\n".join([doc.page_content for doc in all_chunks])
        
        # Step 3: Run ATS scoring immediately
        ats_result = calculate_ats_score(full_text)
        
        # Mark thread as analysis complete (for chat routing)
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
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message to the Resume Agent.
    
    - Requires a valid thread_id with an uploaded resume.
    - Works as a normal chatbot after resume upload.
    """
    thread_id = request.thread_id
    
    if not thread_has_resume(thread_id):
        raise HTTPException(
            status_code=400,
            detail="No resume found for this thread. Please upload a resume first."
        )
    
    # Prepare state - always in chat mode after upload
    config = {"configurable": {"thread_id": thread_id}}
    input_state = {
        "messages": [HumanMessage(content=request.message)],
        "mode": "chat",  # Always chat mode after upload
        "thread_id": thread_id,
        "resume_analysis": None,
        "analysis_complete": True  # Analysis already done on upload
    }
    
    try:
        # Invoke the graph
        result = resume_agent.invoke(input_state, config=config)
        
        # Extract the last AI message
        messages = result.get("messages", [])
        last_message = messages[-1].content if messages else "No response generated."
        
        return ChatResponse(
            thread_id=thread_id,
            response=last_message
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@app.get("/threads")
async def get_threads():
    """List all available thread IDs."""
    return {"threads": list_all_threads()}


@app.get("/threads/{thread_id}/metadata")
async def get_thread_info(thread_id: str):
    """Get metadata for a specific thread's resume."""
    metadata = get_thread_metadata(thread_id)
    if not metadata:
        raise HTTPException(status_code=404, detail="Thread not found or no resume uploaded.")
    return metadata


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=(settings.ENVIRONMENT == "development")
    )
