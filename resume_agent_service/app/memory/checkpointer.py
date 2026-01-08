import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver

# SQLite database for thread persistence
_conn = sqlite3.connect(database="resume_agent.db", check_same_thread=False)
checkpointer = SqliteSaver(conn=_conn)


def get_checkpointer() -> SqliteSaver:
    """Get the SQLite checkpointer instance for thread memory."""
    return checkpointer


def list_all_threads() -> list:
    """Retrieve all thread IDs from the checkpointer."""
    all_threads = set()
    for checkpoint in checkpointer.list(None):
        thread_id = checkpoint.config.get("configurable", {}).get("thread_id")
        if thread_id:
            all_threads.add(thread_id)
    return list(all_threads)
