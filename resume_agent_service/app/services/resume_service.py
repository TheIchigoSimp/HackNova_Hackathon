from __future__ import annotations
import os
import tempfile
from typing import Any, Dict, Optional, List

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

# Thread-local storage for vector stores and metadata
_THREAD_RETRIEVERS: Dict[str, Any] = {}
_THREAD_METADATA: Dict[str, dict] = {}

# Embeddings model (loaded once)
_embeddings = None

def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    return _embeddings


def get_retriever(thread_id: Optional[str]) -> Optional[Any]:
    """Fetch the FAISS retriever for a specific thread."""
    if thread_id and thread_id in _THREAD_RETRIEVERS:
        return _THREAD_RETRIEVERS[thread_id]
    return None


def get_thread_metadata(thread_id: str) -> dict:
    """Get metadata for a thread's resume."""
    return _THREAD_METADATA.get(str(thread_id), {})


def ingest_resume_pdf(file_bytes: bytes, thread_id: str, filename: Optional[str] = None) -> dict:
    """
    Parse a PDF resume, build a FAISS vector store, and store the retriever for this thread.
    
    Returns:
        dict: Ingestion summary with filename, pages, and chunks count.
    """
    if not file_bytes:
        raise ValueError("No file bytes provided for ingestion.")
    
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
        temp_file.write(file_bytes)
        temp_path = temp_file.name
    
    try:
        loader = PyPDFLoader(temp_path)
        docs = loader.load()
        
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=150,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = splitter.split_documents(docs)
        
        embeddings = _get_embeddings()
        vector_store = FAISS.from_documents(chunks, embeddings)
        retriever = vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 5}
        )
        
        _THREAD_RETRIEVERS[str(thread_id)] = retriever
        _THREAD_METADATA[str(thread_id)] = {
            "filename": filename or os.path.basename(temp_path),
            "pages": len(docs),
            "chunks": len(chunks),
        }
        
        return {
            "filename": filename or os.path.basename(temp_path),
            "pages": len(docs),
            "chunks": len(chunks),
        }
    finally:
        try:
            os.remove(temp_path)
        except OSError:
            pass


def thread_has_resume(thread_id: str) -> bool:
    """Check if a thread has an ingested resume."""
    return str(thread_id) in _THREAD_RETRIEVERS
