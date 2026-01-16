# Resume Agent Service

A standalone Python microservice for AI-powered resume analysis and intelligent chat.

## ✨ Features

- **📄 Resume Upload**: Upload PDF resumes for instant analysis
- **📊 ATS Scoring**: Get an Applicant Tracking System compatibility score (0-100)
- **🤖 LLM-Powered Suggestions**: Receive personalized improvement recommendations from AI
- **💬 Agentic Chat**: Chat naturally about your resume using RAG (Retrieval-Augmented Generation)
- **⚡ Streaming Responses**: Real-time token streaming for smooth chat experience
- **🔍 Web Search**: Search for job opportunities and career advice using DuckDuckGo
- **🧵 Thread-Based Memory**: Each conversation maintains context via MemorySaver

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd resume_agent_service
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys (GOOGLE_API_KEY required)
```

### 3. Run the Service
```bash
uvicorn app.main:app --reload --port 8001
```

## 📡 API Endpoints

### Health Check
```
GET /health
```

### Upload Resume (with instant analysis)
```
POST /resume/upload?thread_id=<optional>
Content-Type: multipart/form-data
Body: file=<your_resume.pdf>
```

**Response:**
```json
{
  "thread_id": "abc-123",
  "filename": "resume.pdf",
  "pages": 2,
  "chunks": 12,
  "ats_score": 75,
  "ats_breakdown": {
    "technical_skills": 30,
    "soft_skills": 15,
    "action_verbs": 12,
    "formatting": 20
  },
  "skills_found": ["python", "javascript", "leadership"],
  "action_verbs_found": ["developed", "managed", "led"],
  "suggestions": [
    "Add AWS or cloud certifications to boost technical score",
    "Quantify your achievements with metrics"
  ],
  "message": "Resume analyzed successfully!"
}
```

### Chat with Resume Agent (Non-streaming)
```
POST /chat
Content-Type: application/json
Body: {"thread_id": "abc-123", "message": "What are my key strengths?"}
```

### Chat with Resume Agent (Streaming)
```
POST /chat/stream
Content-Type: application/json
Body: {"thread_id": "abc-123", "message": "Find me job opportunities"}

Response: Server-Sent Events (SSE)
data: {"token": "Based"}
data: {"token": " on"}
data: {"token": " your"}
data: {"status": "Using job_search_tool..."}
data: {"done": true, "full_response": "..."}
data: [DONE]
```

### List Threads
```
GET /threads
```

### Get Thread Metadata
```
GET /threads/{thread_id}/metadata
```

## 🛠️ Available Tools

The agent has access to these tools during chat:

| Tool | Description |
|------|-------------|
| `resume_rag_tool` | Retrieve relevant sections from the uploaded resume |
| `ats_score_tool` | Calculate or explain ATS scores |
| `job_search_tool` | Search for job opportunities on the web |
| `career_advice_search` | Find interview tips and career advice |

## 🏗️ Architecture

```
resume_agent_service/
├── app/
│   ├── main.py              # FastAPI endpoints + streaming
│   ├── core/
│   │   ├── config.py        # Environment settings
│   │   └── state.py         # LangGraph state schema
│   ├── graph/
│   │   ├── builder.py       # LangGraph compilation
│   │   └── nodes.py         # Graph node functions
│   ├── tools/
│   │   ├── rag_tool.py      # Resume RAG retrieval
│   │   ├── ats_scorer.py    # ATS scoring + LLM suggestions
│   │   └── web_search_tool.py  # DuckDuckGo search
│   ├── memory/
│   │   └── checkpointer.py  # MemorySaver for thread state
│   └── services/
│       └── resume_service.py
├── rules/                   # Architecture documentation
├── requirements.txt
└── .env.example
```

## 📚 Documentation

| File | Description |
|------|-------------|
| `rules/ARCHITECTURE.md` | System design and LangGraph flow |
| `rules/INVARIANTS.md` | Business rules and guarantees |
| `rules/MODE_POLICY.md` | State transition rules |
| `rules/SAFE_EXTENSION_GUIDE.md` | How to extend the service |

## 🔧 Tech Stack

- **Framework**: FastAPI
- **AI Orchestration**: LangGraph
- **LLM**: Google Gemini (gemini-3.0-experimental)
- **Embeddings**: HuggingFace (sentence-transformers/all-MiniLM-L6-v2)
- **Vector Store**: FAISS
- **Web Search**: DuckDuckGo (no API key required)
- **Memory**: MemorySaver (in-memory, for async streaming support)

## 📝 License

Part of the Path Genie project.
