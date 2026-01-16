# PathGenie Development Rules & Guidelines

> ⚠️ **MANDATORY**: Before implementing ANY feature or making ANY changes, read the relevant architecture documentation in `.agent/architecture/`.

---

## 📋 Pre-Implementation Checklist

Before writing any code, complete this checklist:

- [ ] Read [PROJECT_OVERVIEW.md](architecture/PROJECT_OVERVIEW.md)
- [ ] Read the relevant component doc ([CLIENT.md](architecture/CLIENT.md), [SERVER.md](architecture/SERVER.md), [RESUME_AGENT.md](architecture/RESUME_AGENT.md))
- [ ] Identify which services are affected
- [ ] Check existing patterns in similar features
- [ ] Plan the API contract if adding new endpoints
- [ ] Consider authentication requirements

---

## 🏗️ Architecture Rules

### General
1. **Microservice Boundaries**: Client, Server, and Resume Agent are separate services. Never mix responsibilities.
2. **Environment Variables**: All configuration goes in `.env` files, never hardcode secrets.
3. **Port Conventions**: Server=8000, Client=5173, Resume Agent=8001. Do not change.

### Client (React)
1. **File Location**:
   - Pages go in `src/Pages/`
   - Reusable components go in `src/components/`
   - API calls go in `src/api/`
   - Complex logic goes in `src/hooks/`

2. **Naming Conventions**:
   - Components: `PascalCase.jsx`
   - Hooks: `useCamelCase.js`
   - API modules: `camelCaseApi.js`

3. **State Management**:
   - Use React Query for server state
   - Use useState/useReducer for local state
   - Avoid prop drilling beyond 2 levels

4. **Styling**:
   - Use Tailwind CSS utilities
   - Complex styles in `.module.css` files
   - Maintain dark mode support

### Server (Express)
1. **MVC Pattern**: Always use Routes → Controllers → Services → Models flow.

2. **File Location**:
   - Models in `models/`
   - Controllers in `controllers/`
   - Routes in `routes/`
   - Business logic in `services/`

3. **Naming Conventions**:
   - Models: `EntityName.model.js`
   - Controllers: `entityNameController.js`
   - Routes: `entityNameRoutes.js`

4. **Error Handling**:
   - Use `asyncHandler` wrapper for async routes
   - Throw errors, let `errorHandler` middleware catch them
   - Always return consistent error format: `{ error: string, message: string }`

5. **Authentication**:
   - Use `authMiddleware` for protected routes
   - Better Auth handles `/api/auth/*` automatically

### Resume Agent (FastAPI/LangGraph)
1. **Tool Development**:
   - Each tool in its own file in `app/tools/`
   - Export all tools from `app/tools/__init__.py`
   - Bind tools to agent in `app/graph/builder.py`

2. **State Management**:
   - All state changes through LangGraph nodes
   - Never modify state outside of nodes
   - Use checkpointer for persistence

3. **Streaming**:
   - Always stream responses for chat endpoints
   - Use SSE (Server-Sent Events) format
   - Handle connection drops gracefully

---

## 📝 Code Style Rules

### JavaScript/React
```javascript
// ✅ Good: Destructure props
function UserCard({ name, email, avatar }) { ... }

// ❌ Bad: Access props object
function UserCard(props) { ... }

// ✅ Good: Use arrow functions for callbacks
onClick={() => handleClick(id)}

// ✅ Good: Early returns for conditionals
if (loading) return <Spinner />;
if (error) return <ErrorMessage />;
return <Content />;
```

### Python
```python
# ✅ Good: Type hints everywhere
def process_resume(text: str, thread_id: str) -> dict:
    ...

# ✅ Good: Async functions for I/O
async def fetch_jobs(query: str) -> list[dict]:
    ...

# ✅ Good: Docstrings for tools
def calculate_ats_score(resume_text: str) -> dict:
    """
    Calculate ATS compatibility score.
    
    Args:
        resume_text: The parsed resume content
        
    Returns:
        Dict with score, suggestions, and keyword analysis
    """
```

---

## 🔄 Git Workflow

### Branch Naming
```
feature/add-job-recommendations
fix/resume-upload-error
refactor/improve-streaming
docs/update-architecture
```

### Commit Messages
```
feat(client): add job recommendations panel
fix(server): handle empty resume upload
refactor(agent): improve streaming performance
docs: update resume agent architecture
```

### Pre-Commit Checklist
- [ ] Code compiles/runs without errors
- [ ] Tests pass (if applicable)
- [ ] No console.log/print statements left
- [ ] No hardcoded values
- [ ] Documentation updated if needed

---

## 🔌 API Design Rules

### Endpoints
1. Use RESTful conventions: `GET`, `POST`, `PUT`, `DELETE`
2. Use plural nouns: `/api/mindmaps`, not `/api/mindmap`
3. Nest resources logically: `/api/mindmaps/:id/nodes`

### Request/Response
```javascript
// Success response
{
  "success": true,
  "data": { ... }
}

// Error response
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Resume file is required"
}
```

### Streaming Responses
```javascript
// SSE format for streaming
data: {"type": "token", "content": "Hello"}
data: {"type": "done", "content": ""}
data: {"type": "error", "content": "Something went wrong"}
```

---

## 🧪 Testing Guidelines

### Frontend
- Test user interactions, not implementation
- Mock API calls with consistent responses
- Test error states and loading states

### Backend
- Unit test services independently
- Integration test API endpoints
- Mock external services (Groq, MongoDB)

### Resume Agent
- Test tools in isolation
- Test agent graph with mock LLM
- Test streaming with real connections

---

## 📚 Documentation Rules

1. **Update Docs with Code**: When adding features, update:
   - Relevant architecture doc in `.agent/architecture/`
   - README.md if user-facing
   - API documentation if adding endpoints

2. **Code Comments**:
   - Explain WHY, not WHAT
   - Comment complex algorithms
   - Document non-obvious decisions

3. **JSDoc/Docstrings**:
   - All public functions must have documentation
   - Include parameter types and return types
   - Provide usage examples for complex functions

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] All environment variables set in production
- [ ] CORS origins updated for production URLs
- [ ] Rate limiting configured appropriately
- [ ] Error logging enabled
- [ ] Health check endpoints working
- [ ] SSL/HTTPS configured
- [ ] Database indexes created
- [ ] Static assets built (`npm run build` for client)

---

## 📞 Getting Help

If you're stuck:
1. Check the architecture docs first
2. Look for similar implementations in the codebase
3. Search existing code for patterns
4. Ask the team (or AI assistant) with context

---

## 🔄 Updating This Document

When project patterns change:
1. Update the relevant architecture doc
2. Update this RULES.md file
3. Notify the team of changes
4. Update any affected workflows
