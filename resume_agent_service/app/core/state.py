from typing import Annotated, List, Optional, TypedDict, Literal
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage
from pydantic import BaseModel

class ResumeAnalysisResult(BaseModel):
    """Result of the resume analysis phase."""
    filename: str
    pages: int
    chunks: int
    ats_score: float
    skills_extracted: List[str]
    experience_years: Optional[float] = None
    education_summary: Optional[str] = None

class AgentState(TypedDict):
    """
    LangGraph state schema for the Resume Agent.
    
    Attributes:
        messages: Chat history (accumulated via add_messages reducer).
        mode: Current operational mode ('resume_analysis' or 'chat').
        thread_id: Unique identifier for this conversation thread.
        resume_analysis: Result of the resume analysis (populated once).
        analysis_complete: Flag indicating if analysis has finished.
    """
    messages: Annotated[List[BaseMessage], add_messages]
    mode: Literal["resume_analysis", "chat"]
    thread_id: str
    resume_analysis: Optional[ResumeAnalysisResult]
    analysis_complete: bool
