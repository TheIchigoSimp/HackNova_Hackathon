from typing import Optional, List, Dict
from langchain_core.tools import tool
from app.services.resume_service import get_retriever, get_thread_metadata

@tool
def resume_rag_tool(query: str, thread_id: Optional[str] = None) -> dict:
    """
    Retrieve relevant information from the uploaded resume for this chat thread.
    Always include the thread_id when calling this tool.
    
    Args:
        query: The search query to find relevant resume sections.
        thread_id: The unique identifier for the current chat thread.
    
    Returns:
        dict: Contains context snippets, metadata, and source filename.
    """
    retriever = get_retriever(thread_id)
    if retriever is None:
        return {
            "error": "No resume indexed for this thread. Please upload a resume first.",
            "query": query,
        }
    
    results = retriever.invoke(query)
    context = [doc.page_content for doc in results]
    metadata = [doc.metadata for doc in results]
    
    return {
        "query": query,
        "context": context,
        "metadata": metadata,
        "source_file": get_thread_metadata(str(thread_id)).get("filename"),
    }
