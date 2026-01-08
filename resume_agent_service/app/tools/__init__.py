from app.tools.rag_tool import resume_rag_tool
from app.tools.ats_scorer import ats_score_tool

# All registered tools for the Resume Agent
tools = [
    resume_rag_tool,
    ats_score_tool,
]

__all__ = ["tools", "resume_rag_tool", "ats_score_tool"]
