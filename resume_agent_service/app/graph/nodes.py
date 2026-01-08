from __future__ import annotations
from typing import Optional, Dict, Any

from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from langchain_groq import ChatGroq
from dotenv import load_dotenv

from app.core.config import get_settings
from app.core.state import AgentState, ResumeAnalysisResult
from app.services.resume_service import get_retriever, get_thread_metadata, thread_has_resume
from app.tools import tools
from app.tools.ats_scorer import calculate_ats_score

load_dotenv()
settings = get_settings()

# Initialize LLM
llm = ChatGroq(model="openai/gpt-oss-120b")
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
    
    system_prompt = f"""You are a helpful resume assistant. You have analyzed the user's resume and can answer questions about it.

For questions about the resume content, use the `resume_rag_tool` with thread_id="{thread_id}".
You can also use `ats_score_tool` to recalculate or explain ATS scores.

Be encouraging and provide actionable advice. Focus on:
- Highlighting strengths
- Suggesting improvements
- Helping tailor the resume for specific roles

If the user asks about something not in the resume, acknowledge it and suggest they add it."""

    system_message = SystemMessage(content=system_prompt)
    messages = [system_message, *state["messages"]]
    
    response = llm_with_tools.invoke(messages, config=config)
    
    return {"messages": [response]}
