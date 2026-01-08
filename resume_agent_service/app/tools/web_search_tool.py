"""
Web Search Tool for Job Discovery

Provides web search capabilities for finding job opportunities,
company information, and career resources based on user's resume.
Uses DuckDuckGo for free, API-key-free searches.
"""

from langchain_core.tools import tool

try:
    from langchain_community.tools import DuckDuckGoSearchRun
    SEARCH_AVAILABLE = True
except ImportError:
    SEARCH_AVAILABLE = False


@tool
def job_search_tool(query: str, skills: str = "") -> str:
    """
    Search the web for job opportunities, companies, and career resources.
    
    Use this tool when the user asks about:
    - Job roles they can apply for
    - Where to find job postings
    - Companies hiring for specific skills
    - Remote work opportunities
    - Salary information
    - Career advice
    
    Args:
        query: The search query describing what the user is looking for.
               Examples: "remote python developer jobs", "companies hiring React developers"
        skills: Optional comma-separated skills from the resume to enhance the search.
               Will be appended to the query for more relevant results.
    
    Returns:
        str: Search results containing job listings, company info, or career resources.
    """
    if not SEARCH_AVAILABLE:
        return "Web search is currently unavailable. Please install 'duckduckgo-search' package."
    
    try:
        search = DuckDuckGoSearchRun()
        
        # Enhance query with skills if provided
        if skills:
            enhanced_query = f"{query} {skills}"
        else:
            enhanced_query = query
        
        # Run the search
        results = search.run(enhanced_query)
        
        if not results or results.strip() == "":
            return f"No results found for: {query}. Try a different search query."
        
        return results
        
    except Exception as e:
        return f"Search failed: {str(e)}. Please try again with a different query."


@tool  
def career_advice_search(topic: str, context: str = "") -> str:
    """
    Search for career advice, interview tips, and professional development resources.
    
    Use this tool when the user asks about:
    - Interview preparation
    - Resume writing tips
    - Career transitions
    - Skill development
    - Industry trends
    
    Args:
        topic: The career topic to search for (e.g., "software engineer interview tips")
        context: Optional context about the user's background to make search more relevant
    
    Returns:
        str: Career advice and resources related to the topic.
    """
    if not SEARCH_AVAILABLE:
        return "Web search is currently unavailable. Please install 'duckduckgo-search' package."
    
    try:
        search = DuckDuckGoSearchRun()
        
        search_query = f"{topic} career advice {context}".strip()
        results = search.run(search_query)
        
        if not results or results.strip() == "":
            return f"No career advice found for: {topic}. Try rephrasing your question."
        
        return results
        
    except Exception as e:
        return f"Search failed: {str(e)}. Please try again."
