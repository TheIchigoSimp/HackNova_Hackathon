"""
Checkpointer for LangGraph thread persistence.

Uses MongoDB for persistent checkpoint storage across server restarts.
"""
import os
from dotenv import load_dotenv
from langgraph.checkpoint.mongodb import MongoDBSaver
from pymongo import MongoClient

# Load .env BEFORE accessing environment variables
load_dotenv()

checkpointer = MongoDBSaver(
    client=MongoClient(os.getenv("MONGODB_URI")),
    db_name=os.getenv("DB_NAME", "test"),
    collection_name="checkpoints",
)


def get_checkpointer() -> MongoDBSaver:
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
    # MongoDBSaver stores checkpoints in memory with thread_id as key
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
