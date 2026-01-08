
# Path Genie

Welcome to  **Path Genie** ! 🎉 Your ultimate companion for creating personalized learning journeys. Whether you're diving into "Learn Python Programming" or exploring "Quantum Physics," Path Genie transforms your topic of interest into a vibrant, interactive learning path. Using the magic of  **React Flow** , we visualize your learning milestones, and with the power of  **Groq's AI API** , we fetch top-notch resources like YouTube videos, blogs, and articles to supercharge your learning experience. Let's embark on this adventure together! 🚀

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Demo](#demo)
* [Prerequisites](#prerequisites)
* [Installation](#installation)
* [Configuration](#configuration)
* [Usage](#usage)
* [Project Structure](#project-structure)
* [Contributing](#contributing)
* [Acknowledgements](#acknowledgements)

## Features

* 🌟  **Dynamic Learning Paths** : Watch your topic transform into a structured, interactive journey with React Flow.
* 📚  **Resource Integration** : Get the best learning materials powered by Groq's AI API.
* 🖱️  **User-Friendly Interface** : Effortlessly enter topics and navigate your visual path.
* ✏️  **Customizable Paths** : Tweak nodes and connections to make the path truly yours.
* 📱  **Responsive Design** : Learn on the go, whether on desktop or mobile.
* 📄  **Resume Agent** : AI-powered resume analysis with ATS scoring and personalized suggestions.
* ⚡  **Streaming Chat** : Real-time AI responses with token streaming for smooth UX.
* 🔍  **Job Search** : Find job opportunities matching your resume skills via web search.
* 💾  **Session Persistence** : Resume analysis sessions saved across page refreshes.

## Tech Stack

* 🖥️  **Frontend** : React, React Flow (for those awesome visual paths)
* 🛠️  **Backend** : Node.js, Express
* 🗄️  **Database** : MongoDB (keeping your data safe)
* 🔌  **API** : Groq AI API (your intelligent resource genie)
* 🔐  **Authentication** : Better Auth (email/password & GitHub SSO)
* 🎨  **Styling** : Tailwind CSS (looking sharp!)
* 🤖  **Resume Agent** : Python, FastAPI, LangGraph, FAISS (standalone microservice)
* 🔍  **Web Search** : DuckDuckGo integration for job discovery
* ⚙️  **Others** : Vite, Mongoose, Axios (the behind-the-scenes heroes)

## Demo

Try out Path Genie live at [https://pathgenie.onrender.com/](https://pathgenie.onrender.com/). Use the following dummy credentials to explore:

* **Email** : testuser@gmail.com
* **Password** : Password@2025

Feel free to create your own account too! 😊

## Prerequisites

Before you start, make sure you have:

* 🟢 Node.js (v18 or later)
* 🟢 MongoDB (local or cloud, like MongoDB Atlas)
* 🟢 Git
* 🟢 A Groq API key (grab it from [Groq Console](https://console.groq.com/))
* 🟢 Python 3.10+ (for Resume Agent Service)
* 🟢 A GitHub OAuth app (for that smooth SSO login)

## Installation

1. **Clone the Repository** :

```bash
   git clone <your-private-repo-url>
   cd path-genie
```

2. **Install Dependencies** :

* For the backend:
  ```bash
  cd server
  npm install
  ```
* For the frontend:
  ```bash
  cd client
  npm install
  ```

* For the Resume Agent Service:
  ```bash
  cd resume_agent_service
  pip install -r requirements.txt
  ```

3. **Set Up MongoDB** :

* Make sure MongoDB is up and running (locally or on the cloud).
* Update the `MONGODB_URI` in the backend `.env` file (details in [Configuration](#configuration)).

## Configuration

Create a `.env` file in the `server` directory with:

```bash
PORT=8000
BETTER_AUTH_SECRET=your_secret_here  # Generate with `openssl rand -base64 32`
BETTER_AUTH_URL=http://localhost:8000
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
MONGODB_URI=your_mongodb_uri
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:8000
GROQ_API_KEY=your_groq_api_key
NODE_ENV=development
```

Create a `.env` file in the `client` directory with:

```bash
VITE_SERVER_URL=http://localhost:8000
VITE_CLIENT_URL=http://localhost:5173
VITE_MODE=development
VITE_RESUME_AGENT_URL=http://localhost:8001
```

Create a `.env` file in the `resume_agent_service` directory with:

```bash
GROQ_API_KEY=your_groq_api_key
```

> **Note** : For production, set `NODE_ENV=production` in the backend `.env` and `VITE_MODE=production` in the frontend `.env`.

## Usage

1. **Fire Up the Backend** 🔥:

```bash
   cd server
   npm run start
```

Your backend will be live at `http://localhost:8000`.

2. **Launch the Frontend** 🚀:

```bash
   cd client
   npm run dev
```

Head to `http://localhost:5173` to see the magic!

3. **Start the Resume Agent** 📄:

```bash
   cd resume_agent_service
   uvicorn app.main:app --reload --port 8001
```

Resume Agent API available at `http://localhost:8001`.

4. **Explore Path Genie** 🌟:

* Visit `http://localhost:5173` and log in (or sign up) with email/password or GitHub.
* Type in a topic like "Learn Python Programming" and hit enter.
* Watch as Path Genie crafts a beautiful learning path with React Flow.
* Click on nodes to discover curated resources from Groq's AI API.

5. **Use the Resume Agent** 📝:

* Navigate to the Resume Analyzer page
* Upload your PDF resume for instant ATS scoring
* Chat with the AI to get personalized improvement suggestions
* Ask about job opportunities matching your skills
* Enjoy streaming responses for a smooth experience

6. **Make It Yours** ✏️:

* Drag nodes around to customize your path.
* Dive into resources by clicking on nodes.
* Save your progress or export your path (coming soon!).

## Project Structure

```
path-genie/
├── client/                     # Frontend (React)
│   ├── src/
│   │   ├── api/                # API calls (resumeAgentApi, resumeSessionApi)
│   │   ├── assets/             # Static assets
│   │   ├── components/         # React components
│   │   │   └── ResumeAgent/    # Resume analysis UI components
│   │   ├── hooks/              # Custom hooks
│   │   ├── lib/                # Auth client setup (Better Auth)
│   │   ├── Pages/              # Page components (ResumeAnalyzer, etc.)
│   │   ├── utils/              # Utility functions
│   │   ├── App.jsx             # Main app component
│   │   ├── index.css           # Global styles
│   │   └── main.jsx            # Entry point
│   ├── public/                 # Public assets
│   ├── .env                    # Frontend environment variables
│   └── package.json
├── server/                     # Backend (Node.js/Express)
│   ├── config/                 # Configuration files
│   ├── controllers/            # Controller functions
│   │   └── resumeSessionController.js  # Session persistence
│   ├── db/                     # Database connection
│   ├── lib/                    # Auth setup (Better Auth)
│   ├── middlewares/            # Middleware functions
│   ├── models/                 # Mongoose models
│   │   └── ResumeSession.model.js  # Resume session schema
│   ├── routes/                 # API routes
│   │   └── resumeSessionRoutes.js  # Session CRUD endpoints
│   ├── services/               # Service functions
│   ├── utils/                  # Utility functions
│   ├── app.js                  # Express app setup
│   ├── index.js                # Server entry point
│   ├── .env                    # Backend environment variables
│   └── package.json
├── resume_agent_service/       # Resume Analysis Microservice (Python)
│   ├── app/
│   │   ├── main.py             # FastAPI endpoints + streaming
│   │   ├── core/               # Config and state schema
│   │   ├── graph/              # LangGraph nodes and builder
│   │   ├── tools/              # RAG, ATS scorer, web search
│   │   ├── memory/             # Thread checkpointing
│   │   └── services/           # Resume ingestion service
│   ├── rules/                  # Architecture documentation
│   └── requirements.txt
├── rules/                      # Project-wide architecture docs
├── README.md                   # You're here! 👋
└── package.json                # Project metadata and scripts
```

## Contributing

We welcome contributions to Path Genie! To contribute:

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a pull request with a detailed description of your changes.

Please follow our Code of Conduct and ensure your code adheres to the project's style guidelines (e.g., ESLint, Prettier).

## Acknowledgements

* [React Flow](https://reactflow.dev/) for the interactive flow-based UI.
* [Groq AI API](https://groq.com/) for providing intelligent learning resources.
* [Better Auth](https://www.better-auth.com/) for secure authentication.
* [Mongoose](https://mongoosejs.com/) for MongoDB integration.
* [LangGraph](https://langchain-ai.github.io/langgraph/) for AI agent orchestration.
* [DuckDuckGo](https://duckduckgo.com/) for free web search capabilities.
* The open-source community for their invaluable tools and resources.

---

**Path Genie** is built to empower learners by making education accessible and engaging. Start creating your learning path today!
