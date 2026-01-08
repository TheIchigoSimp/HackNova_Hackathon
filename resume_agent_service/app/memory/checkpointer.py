"""
Checkpointer for LangGraph thread persistence.

Uses MemorySaver for simplicity and full async support.
SQLite was causing issues with async streaming.
"""

from langgraph.checkpoint.memory import MemorySaver

# Use in-memory checkpointer which supports both sync and async
# This is simpler and works perfectly for streaming
checkpointer = MemorySaver()


def get_checkpointer() -> MemorySaver:
    """
    Get the memory checkpointer instance for thread memory.
    
    Uses MemorySaver which supports both sync and async operations,
    required for streaming with astream_events.
    
    Note: This is in-memory storage, so threads are lost on restart.
    For persistence across restarts, consider using a database-backed
    checkpointer like PostgresSaver.
    """
    return checkpointer


def list_all_threads() -> list:
    """Retrieve all thread IDs from the checkpointer."""
    # MemorySaver stores checkpoints in memory with thread_id as key
    all_threads = set()
    try:
        for checkpoint in checkpointer.list(None):
            thread_id = checkpoint.config.get("configurable", {}).get("thread_id")
            if thread_id:
                all_threads.add(thread_id)
    except Exception:
        # If listing fails, return empty list
        pass
    return list(all_threads)
