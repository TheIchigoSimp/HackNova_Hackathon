"""
MongoDB-backed thread metadata storage.
Replaces in-memory _THREAD_METADATA with persistent storage.
"""
import os
from typing import Dict, Optional, List
from datetime import datetime
from dotenv import load_dotenv
from pymongo import MongoClient

# Load .env to ensure env vars are available
load_dotenv()


def _get_threads_collection():
    """Get the MongoDB threads collection."""
    client = MongoClient(os.getenv("MONGODB_URI"))
    db = client[os.getenv("DB_NAME", "test")]
    return db["threads"]


def save_thread_metadata(
    thread_id: str,
    user_id: str,
    filename: str,
    pages: int,
    chunks: int,
    ats_score: float = None
) -> None:
    """
    Save or update thread metadata in MongoDB.
    
    Args:
        thread_id: Unique thread identifier
        user_id: User who owns this thread
        filename: Original resume filename
        pages: Number of pages in PDF
        chunks: Number of text chunks created
        ats_score: Optional ATS score
    """
    collection = _get_threads_collection()
    collection.update_one(
        {"thread_id": thread_id},
        {
            "$set": {
                "thread_id": thread_id,
                "user_id": user_id,
                "filename": filename,
                "pages": pages,
                "chunks": chunks,
                "ats_score": ats_score,
                "updated_at": datetime.utcnow(),
            },
            "$setOnInsert": {
                "created_at": datetime.utcnow(),
            }
        },
        upsert=True
    )


def get_thread_metadata_from_db(thread_id: str) -> Optional[Dict]:
    """
    Retrieve thread metadata from MongoDB.
    
    Args:
        thread_id: Thread ID to lookup
        
    Returns:
        dict with thread metadata or None if not found
    """
    collection = _get_threads_collection()
    doc = collection.find_one({"thread_id": thread_id})
    if doc:
        doc.pop("_id", None)  # Remove MongoDB ObjectId
        return doc
    return None


def get_user_threads(user_id: str) -> List[Dict]:
    """
    Get all threads for a specific user, sorted by most recent.
    
    Args:
        user_id: User ID to get threads for
        
    Returns:
        List of thread metadata dictionaries
    """
    collection = _get_threads_collection()
    cursor = collection.find(
        {"user_id": user_id}
    ).sort("updated_at", -1)
    
    threads = []
    for doc in cursor:
        doc.pop("_id", None)
        threads.append(doc)
    return threads


def thread_exists(thread_id: str) -> bool:
    """
    Check if a thread exists in the database.
    
    Args:
        thread_id: Thread ID to check
        
    Returns:
        True if thread exists, False otherwise
    """
    collection = _get_threads_collection()
    return collection.find_one({"thread_id": thread_id}) is not None


def update_thread_ats_score(thread_id: str, ats_score: float) -> None:
    """
    Update the ATS score for a thread.
    
    Args:
        thread_id: Thread ID to update
        ats_score: New ATS score
    """
    collection = _get_threads_collection()
    collection.update_one(
        {"thread_id": thread_id},
        {"$set": {"ats_score": ats_score, "updated_at": datetime.utcnow()}}
    )
