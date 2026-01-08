from app.tools.rag_tool import resume_rag_tool
from app.tools.ats_scorer import ats_score_tool
from app.tools.web_search_tool import job_search_tool, career_advice_search

# All registered tools for the Resume Agent
tools = [
    resume_rag_tool,
    ats_score_tool,
    job_search_tool,
    career_advice_search,
]

__all__ = [
    "tools", 
    "resume_rag_tool", 
    "ats_score_tool",
    "job_search_tool",
    "career_advice_search",
]
