from __future__ import annotations
import os
import tempfile
from typing import Any, Dict, Optional, List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_mongodb.vectorstores import MongoDBAtlasVectorSearch
from langchain_huggingface import HuggingFaceEmbeddings
from pymongo import MongoClient

from app.memory.thread_store import (
    save_thread_metadata,
    get_thread_metadata_from_db,
    thread_exists
)

# In-memory cache for retrievers (reconstructed from DB on cache miss)
_THREAD_RETRIEVERS: Dict[str, Any] = {}

# Embeddings model (loaded once)
_embeddings = None


def _get_embeddings():
    """Get or initialize the embeddings model."""
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return _embeddings


def _get_mongo_collection():
    """Get the MongoDB collection for vector storage."""
    client = MongoClient(os.getenv("MONGODB_URI"))
    db = client[os.getenv("DB_NAME", "test")]
    return db[os.getenv("COLLECTION_NAME", "vectorstore")]


def _reconstruct_retriever(thread_id: str) -> Optional[Any]:
    """
    Reconstruct a retriever from MongoDB vector store.
    Called when retriever not in cache but thread exists in DB.
    
    Args:
        thread_id: The thread ID to reconstruct retriever for
        
    Returns:
        Retriever instance or None if thread doesn't exist
    """
    if not thread_exists(thread_id):
        return None
    
    collection = _get_mongo_collection()
    embeddings = _get_embeddings()
    
    # Create vector store from existing collection
    # Note: embedding_key must match your Atlas Search index path ("embedding")
    vector_store = MongoDBAtlasVectorSearch(
        collection=collection,
        embedding=embeddings,
        index_name="vector_index",
        embedding_key="embedding",  # Match your Atlas index field name
    )
    
    # Create retriever with thread_id pre-filter
    # This ensures we only search documents belonging to this thread
    retriever = vector_store.as_retriever(
        search_type="similarity",
        search_kwargs={
            "k": 5,
            "pre_filter": {"thread_id": {"$eq": thread_id}}
        }
    )
    
    # Cache it for future use
    _THREAD_RETRIEVERS[str(thread_id)] = retriever
    return retriever


def get_retriever(thread_id: Optional[str]) -> Optional[Any]:
    """
    Fetch the retriever for a specific thread.
    Checks cache first, then attempts to reconstruct from MongoDB.
    
    Args:
        thread_id: The thread ID to get retriever for
        
    Returns:
        Retriever instance or None if no resume exists for thread
    """
    if not thread_id:
        return None
    
    # Check cache first
    if thread_id in _THREAD_RETRIEVERS:
        return _THREAD_RETRIEVERS[thread_id]
    
    # Try to reconstruct from MongoDB
    return _reconstruct_retriever(thread_id)


def get_thread_metadata(thread_id: str) -> dict:
    """
    Get metadata for a thread's resume from MongoDB.
    
    Args:
        thread_id: The thread ID to get metadata for
        
    Returns:
        dict with thread metadata or empty dict if not found
    """
    return get_thread_metadata_from_db(str(thread_id)) or {}


def ingest_resume_pdf(
    file_bytes: bytes, 
    thread_id: str, 
    user_id: str,
    filename: Optional[str] = None
) -> dict:
    """
    Parse a PDF resume, build a MongoDB vector store, and store metadata.
    
    Args:
        file_bytes: Raw PDF file bytes
        thread_id: Unique thread identifier
        user_id: User who owns this resume
        filename: Optional original filename
    
    Returns:
        dict: Ingestion summary with filename, pages, and chunks count.
    """
    if not file_bytes:
        raise ValueError("No file bytes provided for ingestion.")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(file_bytes)
        temp_path = temp_file.name
    
    try:
        # Load and parse PDF
        loader = PyPDFLoader(temp_path)
        docs = loader.load()
        
        # Split into chunks
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = splitter.split_documents(docs)
        
        # Add thread_id and user_id to each chunk's metadata for filtering
        for chunk in chunks:
            chunk.metadata["thread_id"] = thread_id
            chunk.metadata["user_id"] = user_id
        
        # Create vector store in MongoDB
        collection = _get_mongo_collection()
        embeddings = _get_embeddings()
        vector_store = MongoDBAtlasVectorSearch.from_documents(
            documents=chunks,
            embedding=embeddings,
            collection=collection,
            index_name="vector_index",
            embedding_key="embedding",  # Match your Atlas index field name
        )
        
        # Create and cache retriever with thread_id pre-filter
        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={
                "k": 5,
                "pre_filter": {"thread_id": {"$eq": thread_id}}
            }
        )
        _THREAD_RETRIEVERS[str(thread_id)] = retriever
        
        # Save metadata to MongoDB (persistent storage)
        final_filename = filename or os.path.basename(temp_path)
        save_thread_metadata(
            thread_id=thread_id,
            user_id=user_id,
            filename=final_filename,
            pages=len(docs),
            chunks=len(chunks)
        )
        
        # Return full text along with metadata for immediate ATS scoring
        # (MongoDB Atlas Vector Search is eventually consistent, so retriever may not work immediately)
        full_text = "\n".join([chunk.page_content for chunk in chunks])
        
        return {
            "filename": final_filename,
            "pages": len(docs),
            "chunks": len(chunks),
            "full_text": full_text,  # Include for immediate ATS scoring
        }
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass


def thread_has_resume(thread_id: str) -> bool:
    """
    Check if a thread has an ingested resume.
    Checks both in-memory cache and MongoDB.
    
    Args:
        thread_id: Thread ID to check
        
    Returns:
        True if thread has a resume, False otherwise
    """
    return str(thread_id) in _THREAD_RETRIEVERS or thread_exists(thread_id)
