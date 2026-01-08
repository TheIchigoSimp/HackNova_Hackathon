from langgraph.graph import START, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition

from app.core.state import AgentState
from app.graph.nodes import mode_router, resume_analyzer_node, chat_node
from app.tools import tools
from app.memory.checkpointer import get_checkpointer


def build_resume_agent_graph():
    """
    Build and compile the LangGraph for the Resume Agent.
    
    Graph Structure:
        START → mode_router
            → resume_analyzer_node (if mode == 'resume_analysis')
            → chat_node (if mode == 'chat')
        chat_node ↔ tools (tool calls loop)
    """
    graph = StateGraph(AgentState)
    
    # Add nodes
    graph.add_node("resume_analyzer_node", resume_analyzer_node)
    graph.add_node("chat_node", chat_node)
    graph.add_node("tools", ToolNode(tools))
    
    # Add edges
    graph.add_conditional_edges(START, mode_router)
    graph.add_edge("resume_analyzer_node", "chat_node")
    graph.add_conditional_edges("chat_node", tools_condition)
    graph.add_edge("tools", "chat_node")
    
    # Compile with checkpointer for memory
    checkpointer = get_checkpointer()
    compiled_graph = graph.compile(checkpointer=checkpointer)
    
    return compiled_graph


# Singleton instance
resume_agent = build_resume_agent_graph()
