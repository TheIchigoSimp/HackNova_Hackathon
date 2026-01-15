from __future__ import annotations
from typing import Optional, Dict, Any
import logging
import traceback

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv

from app.core.config import get_settings
from app.core.state import AgentState, ResumeAnalysisResult
from app.services.resume_service import get_retriever, get_thread_metadata, thread_has_resume
from app.tools import tools
from app.tools.ats_scorer import calculate_ats_score

load_dotenv()
settings = get_settings()

# Configure logging
logger = logging.getLogger("resume_agent.nodes")

# Initialize LLM with Google Gemini
llm = ChatGoogleGenerativeAI(model="gemini-3.0-experimental")
llm_with_tools = llm.bind_tools(tools)


def mode_router(state: AgentState, config: Optional[Dict] = None) -> str:
    """
    Route to the appropriate node based on current mode.
    
    Returns:
        str: Next node name ('resume_analyzer_node' or 'chat_node').
    """
    if state.get("analysis_complete"):
        return "chat_node"
    
    if state.get("mode") == "resume_analysis":
        return "resume_analyzer_node"
    
    return "chat_node"


def resume_analyzer_node(state: AgentState, config: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Analyze the uploaded resume. Runs exactly once per thread.
    
    - Retrieves resume chunks from the FAISS index.
    - Calculates ATS score.
    - Stores results in state.
    """
    thread_id = state.get("thread_id")
    
    if not thread_has_resume(thread_id):
        error_msg = AIMessage(content="No resume found. Please upload a resume first using the /resume/upload endpoint.")
        return {
            "messages": [error_msg],
            "mode": "resume_analysis",
            "analysis_complete": False
        }
    
    retriever = get_retriever(thread_id)
    metadata = get_thread_metadata(thread_id)
    
    # Get full resume text by retrieving many chunks
    all_chunks = retriever.invoke("skills experience education projects summary")
    full_text = "\n".join([doc.page_content for doc in all_chunks])
    
    # Calculate ATS score
    ats_result = calculate_ats_score(full_text)
    
    # Build analysis result
    analysis = ResumeAnalysisResult(
        filename=metadata.get("filename", "unknown"),
        pages=metadata.get("pages", 0),
        chunks=metadata.get("chunks", 0),
        ats_score=ats_result["total_score"],
        skills_extracted=ats_result["found_skills"]
    )
    
    # Generate summary message
    summary_msg = AIMessage(content=f"""
Resume Analysis Complete!

📄 **File**: {analysis.filename}
📊 **ATS Score**: {analysis.ats_score}/100

**Skills Found**: {', '.join(analysis.skills_extracted[:10])}

**Suggestions**:
{chr(10).join(['• ' + s for s in ats_result['suggestions'][:3]])}

You can now chat with me about your resume! Ask questions like:
- "What are my key strengths?"
- "How can I improve my resume for a software engineering role?"
- "Summarize my experience."
""")
    
    return {
        "messages": [summary_msg],
        "mode": "chat",
        "resume_analysis": analysis,
        "analysis_complete": True
    }


def chat_node(state: AgentState, config: Optional[Dict] = None) -> Dict[str, Any]:
    """
    Handle user chat messages using the LLM with tools.
    """
    thread_id = state.get("thread_id")
    logger.info(f"chat_node called for thread {thread_id}")
    
    # Log the incoming message
    last_msg = state["messages"][-1] if state["messages"] else None
    if last_msg:
        logger.info(f"User message: {last_msg.content[:100] if hasattr(last_msg, 'content') else str(last_msg)[:100]}...")
    
    system_prompt = f"""You are a helpful, concise resume assistant. You have analyzed the user's resume.

CRITICAL RULES:
1. NEVER show raw JSON, tool outputs, or query metadata to the user
2. Keep answers SHORT and DIRECT - 2-4 sentences for simple questions
3. Only give detailed responses when user explicitly asks for analysis or advice
4. Use bullet points sparingly, only when listing multiple items

AVAILABLE TOOLS (use internally, don't mention to user):
- `resume_rag_tool` with thread_id="{thread_id}" - for resume content questions
- `ats_score_tool` - for ATS score calculations
- `job_search_tool` - for job opportunities
- `career_advice_search` - for career advice

RESPONSE LENGTH GUIDE:
- "Whose resume is this?" → Just the name (1 sentence)
- "What are my skills?" → Brief list (2-3 sentences)
- "Why is my ATS score low?" → Quick summary + 2-3 key points
- "Give me detailed feedback" → Full analysis with bullets

Never expose raw data."""

    system_message = SystemMessage(content=system_prompt)
    messages = [system_message, *state["messages"]]
    
    try:
        logger.info(f"Invoking LLM with {len(messages)} messages")
        response = llm_with_tools.invoke(messages, config=config)
        logger.info(f"LLM response type: {type(response).__name__}")
        logger.info(f"LLM response content: {response.content[:100] if hasattr(response, 'content') and response.content else 'No content'}...")
        return {"messages": [response]}
    except Exception as e:
        logger.error(f"LLM invocation error: {str(e)}\n{traceback.format_exc()}")
        error_msg = AIMessage(content=f"I encountered an error while processing your request. Please try again.")
        return {"messages": [error_msg]}

