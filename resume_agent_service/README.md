# Resume Agent Service

A standalone Python microservice for AI-powered resume analysis and intelligent chat.

## ✨ Features

- **📄 Resume Upload**: Upload PDF resumes for instant analysis
- **📊 ATS Scoring**: Get an Applicant Tracking System compatibility score (0-100)
- **🤖 LLM-Powered Suggestions**: Receive personalized improvement recommendations from AI
- **💬 Agentic Chat**: Chat naturally about your resume using RAG (Retrieval-Augmented Generation)
- **🧵 Thread-Based Memory**: Each conversation maintains context via SQLite checkpointing

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd resume_agent_service
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your API keys (GROQ_API_KEY required)
```

### 3. Run the Service
```bash
uvicorn app.main:app --reload --port 8005
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
    "Quantify your achievements with metrics",
    "..."
  ],
  "message": "Resume analyzed successfully!"
}
```

### Chat with Resume Agent
```
POST /chat
Content-Type: application/json
Body: {"thread_id": "abc-123", "message": "What are my key strengths?"}
```

### List Threads
```
GET /threads
```

### Get Thread Metadata
```
GET /threads/{thread_id}/metadata
```

## 🏗️ Architecture

```
resume_agent_service/
├── app/
│   ├── main.py           # FastAPI endpoints
│   ├── core/
│   │   ├── config.py     # Environment settings
│   │   └── state.py      # LangGraph state schema
│   ├── graph/
│   │   ├── builder.py    # LangGraph compilation
│   │   └── nodes.py      # Graph node functions
│   ├── tools/
│   │   ├── rag_tool.py   # Resume RAG retrieval
│   │   └── ats_scorer.py # ATS scoring + LLM suggestions
│   ├── memory/
│   │   └── checkpointer.py
│   └── services/
│       └── resume_service.py
├── rules/                # Architecture documentation
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
- **LLM**: Groq (openai/gpt-oss-120b)
- **Embeddings**: HuggingFace (sentence-transformers/all-MiniLM-L6-v2)
- **Vector Store**: FAISS
- **Memory**: SQLite (LangGraph Checkpointer)

## 📝 License

Part of the Path Genie project.
