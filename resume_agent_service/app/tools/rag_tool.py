from typing import Optional, List, Dict
from langchain_core.tools import tool
from app.services.resume_service import get_retriever, get_thread_metadata

@tool
def resume_rag_tool(query: str, thread_id: Optional[str] = None) -> str:
    """
    Retrieve relevant information from the uploaded resume for this chat thread.
    Always include the thread_id when calling this tool.
    
    Args:
        query: The search query to find relevant resume sections.
        thread_id: The unique identifier for the current chat thread.
    
    Returns:
        str: Resume content relevant to the query, or an error message.
    """
    retriever = get_retriever(thread_id)
    if retriever is None:
        return "No resume has been uploaded for this session. Please upload a resume first."
    
    results = retriever.invoke(query)
    
    # Handle empty results
    if not results:
        return "I couldn't find specific information about that in your resume. Could you rephrase your question?"
    
    # Return only the text content as a simple string
    resume_text = "\n\n".join([doc.page_content for doc in results])
    return resume_text

