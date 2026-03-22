# ShikshaAI — Intelligent Education Tutor for Rural India

> A cost-efficient AI tutoring system that ingests state-board textbooks and answers student questions with up to 87% reduction in API costs using context pruning.


## Overview

ShikshaAI is a personalized AI tutoring system built specifically for students in rural India. The project addresses a real and pressing problem — AI tutors are expensive to run, and in areas with low bandwidth and limited computing power, every API call matters.

The system lets teachers upload state-board textbook PDFs once. After that, students can ask questions from those textbooks in plain English (or using their voice), and get clear answers at three different difficulty levels — Easy, Medium, and Hard. There's also a built-in quiz mode that generates multiple choice questions from any topic in the textbook.

The biggest technical achievement here is the **context pruning** system, which reduces API token usage by 60–87% compared to a standard RAG setup. This directly translates to lower running costs, which makes the system viable in low-budget school environments.

---

## The Problem We're Solving

Personalized AI tutors are changing education globally, but they are expensive. Running queries through large language models like GPT-4 for every student question adds up fast — especially if you're serving hundreds of students in rural schools with tight budgets.

On top of that, rural India has two specific challenges:
- **Spotty internet** — large payloads time out or fail
- **Low-end devices** — browsers on old phones can't handle heavy web apps

ShikshaAI tackles both problems:
1. It processes textbooks **once** and stores them locally — no re-processing per query
2. It uses **context pruning** to strip out irrelevant text before sending anything to the LLM — drastically cutting the size of each API call
3. It has a **caching layer** — identical questions return the saved answer instantly, with zero API cost

---

## How It Works

The system has two main flows:

### Ingestion (runs once per textbook)

PDF Upload → PyMuPDF parses pages → Pages split into chunks
→ sentence-transformers encodes chunks → Embeddings stored in ChromaDB

This runs once. After ingestion, the PDF is never touched again.

### Query (runs per student question)

Student Question → Retrieve top-5 relevant pages from ChromaDB
→ Context Pruner scores every sentence by relevance
→ Only top 15 sentences sent to LLM (not all 5 pages)
→ LLM generates answer → Answer returned to student

The pruning step is what makes this efficient. Instead of dumping 4000 tokens into the LLM prompt, we send maybe 300–500 tokens of the most relevant sentences.

## Key Technique — Context Pruning

This is the core innovation of the project. Here's what happens step by step:

1. ChromaDB returns the top-5 most relevant pages for the question
2. Each page is split into individual sentences
3. Every sentence is encoded using `sentence-transformers`
4. Cosine similarity is calculated between the question and each sentence
5. Sentences scoring below 0.25 similarity are discarded
6. The top 15 sentences (by score) are kept
7. Only those sentences go into the LLM prompt

**Result:** A baseline RAG system would send ~4000 tokens. ShikshaAI typically sends 300–500 tokens — a reduction of 60–87%.

At Groq's pricing for Llama 3.3 70B, this means the cost per query drops from roughly ₹0.08 to ₹0.01. For a school running 500 questions per day, that's a meaningful saving.


## Features

**Home Tab**
- Upload any state-board textbook PDF
- Automatic text extraction from PDF pages
- Persistent vector storage using ChromaDB
- Subject management — upload multiple textbooks
- Ask questions in three difficulty levels (Easy / Medium / Hard)
- Voice input using browser Speech Recognition API
- Text-to-speech — read answers aloud on demand
- Download answers as text files
- Live cost savings report per query
- In-memory answer cache — same question = instant response, no API call

**Quiz Mode**
- Enter any topic from the uploaded textbook
- Choose 3, 5, 8, or 10 questions
- Multiple choice with A/B/C/D options
- Immediate feedback — correct/wrong highlighted after each answer
- Explanation shown after each question
- Final score with performance message
- Download full quiz results as text file

**History Tab**
- All previous questions and answers saved locally
- Expandable cards — click to see full answer
- Shows subject, difficulty level, tokens used, cost saved
- Cache indicator for repeated questions
- Clear all history option

**UI/UX**
- Dark mode / Light mode toggle — preference saved across sessions
- Animated loading state with book animation
- Fully responsive — works on mobile screens
- Tab-based navigation — Home, Quiz Mode, History

---

## Project Structure

```
SHIKSHAAI/
│
├── backend/
│   ├── __pycache__/
│   ├── chroma_db/              # Vector database storage
│   ├── .env                    # Environment variables
│   ├── ingest.py               # Data ingestion script
│   ├── main.py                 # Entry point (API server)
│   ├── prune.py                # Data pruning / cleanup
│   ├── requirements.txt        # Python dependencies
│   ├── retriever.py            # Retrieval logic (RAG)
│   ├── tutor.py                # Core tutoring logic
│
├── data/                       # Raw / processed datasets
│
├── frontend/
│   ├── node_modules/
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.js       # API client
│   │   │   ├── index.js        # API endpoints
│   │   │
│   │   ├── components/
│   │   │   ├── AnswerPanel.jsx
│   │   │   ├── AskCard.jsx
│   │   │   ├── BookLoader.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── IngestPanel.jsx
│   │   │   ├── SubjectPills.jsx
│   │   │   ├── Tabs.jsx
│   │   │   ├── UploadCard.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useHistory.js
│   │   │   ├── useTheme.js
│   │   │   ├── useVoice.js
│   │   │
│   │   ├── pages/
│   │   │   ├── HistoryPage.jsx
│   │   │   ├── Homepage.jsx
│   │   │   ├── QuizPage.jsx
│   │   │
│   │   ├── styles/
│   │   │   ├── global.css
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│
├── .gitignore
├── LICENSE
├── README.md

## Tech Stack

| Layer | Technology | Why |

| Backend framework | FastAPI | Fast, async, automatic docs at /docs |
| Vector database | ChromaDB | Runs locally, no external service needed |
| PDF parsing | PyMuPDF (fitz) | Fast and reliable text extraction |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) | Lightweight, runs on CPU, good quality |
| LLM | Groq — Llama 3.3 70B | Free tier, fast inference |
| Frontend | React 18 + Vite | Fast dev, component-based, easy to extend |




##Prerequisites

Make sure you have these installed before starting:

- **Python 3.11** — 3.14 has compatibility issues with chromadb and numpy
- **Node.js 18+** — for the React frontend
- **Git** — to clone the repo
- **A Groq API key** — free at `console.groq.com`
- **4GB RAM minimum** — the embedding model needs some memory

To check your versions:

python --version    # should say 3.11.x
node --version      # should say 18.x or higher
npm --version       # should say 9.x or higher


## Installation & Setup

### 1. Clone the repository


git clone https://github.com/yourusername/shikshaai.git
cd shikshaai


### 2. Set up the backend

# create and activate a virtual environment (recommended)
python -m venv venv

# on Windows
venv\Scripts\activate

# on Mac/Linux
source venv/bin/activate

# install dependencies
pip install fastapi uvicorn chromadb sentence-transformers pymupdf \
            python-dotenv python-multipart groq scikit-learn numpy


### 3. Create your .env file

Create a file called `.env` in the root folder:

GROQ_API_KEY=gsk_your_actual_key_here


Get your free Groq key at `console.groq.com` — sign up with Google, go to API Keys, create one.

### 4. Set up the frontend


cd frontend
npm install


This installs React, Vite, and all frontend dependencies.



## Running the Project

You need **two terminals** running at the same time — one for the backend, one for the frontend.

### Terminal 1 — Start the FastAPI backend


# make sure you're in the root shikshaai/ backend folder
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload


You should see:

INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

### Terminal 2 — Start the React frontend


cd frontend
npm run dev


You should see:

  VITE v5.x.x  ready in 300ms
  ➜  Local:   http://localhost:5173/


### Open the app

Go to `http://localhost:5173` in your browser.

The Vite dev server automatically proxies all `/api/*` requests to `http://localhost:8000` — this is configured in `vite.config.js` and is why there are no CORS errors.

---

## API Endpoints

The FastAPI backend exposes these endpoints. You can also explore them at `http://localhost:8000/docs` (auto-generated Swagger UI).

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/subjects` | List all ingested subjects |
| POST | `/api/ingest` | Upload and ingest a PDF textbook |
| POST | `/api/ask` | Ask a question and get an answer |
| POST | `/api/mcq` | Generate MCQ quiz questions |


## Cost Savings Report

Every answer includes a cost savings breakdown:

- **Baseline Tokens** — estimated tokens if we sent all retrieved chunks to the LLM
- **Pruned Tokens** — actual tokens sent after context pruning
- **Cost Saved %** — the reduction percentage

In testing with a 850-page software engineering textbook, we consistently saw 75–87% cost reduction per query. The savings increase with longer textbooks because there's more irrelevant content to prune away.

The answer cache adds another layer — if a student asks the same question again (which happens a lot in classroom settings), the saved answer is returned instantly with zero API cost.

---

## Quiz Mode

To use quiz mode:

1. Go to the **Quiz Mode** tab
2. Select the subject you want to test
3. Type a topic (e.g. "photosynthesis", "waterfall model", "French Revolution")
4. Choose how many questions — 3, 5, 8, or 10
5. Click **Generate Quiz**
6. Answer each question — click an option to see if you're right
7. Explanation shown after each question
8. View your final score and all correct answers at the end
9. Download the results as a text file

The questions are generated purely from the uploaded textbook content — they won't go off-topic or make things up.

---

## Voice Features

**Voice Input (Speech to Text)**
- Works in Chrome only (uses the Web Speech API)
- Click the 🎙 Speak button, ask your question out loud, click again to stop
- The transcript appears in the question box — you can edit it before submitting
- Language set to `en-IN` for better Indian English recognition

**Read Aloud (Text to Speech)**
- After an answer appears, click **🔊 Read Aloud**
- The answer is read in an Indian English voice at a comfortable pace
- Click **⏹ Stop Reading** to cancel at any time
- Only plays when you click — never auto-plays


## Future Improvements

Things we'd like to add if we had more time:

- **Hindi and regional language support** — translate questions and answers using IndicTrans2
- **Offline mode** — cache the embedding model locally so the system works without internet
- **Multi-user support** — right now all users share the same subjects and cache
- **Student progress tracking** — store quiz scores per student over time
- **Teacher dashboard** — upload textbooks, see which topics students struggle with
- **Better PDF handling** — handle scanned PDFs using OCR (Tesseract)
- **Persistent cache** — replace the in-memory dict with SQLite so cache survives restarts
- **Rate limiting** — prevent abuse if deployed publicly

## Contributing

Pull requests are welcome. If you find a bug or want to suggest a feature, open an issue first so we can discuss it.

For major changes, please open an issue before submitting a PR.

Basic guidelines:
- Keep code readable and commented
- Don't change the pruner logic without testing cost savings
- Test on a real PDF before submitting

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.


Built for the HPE GenAI for GenZ Challenge — Education Tutor track.

*ShikshaAI — making quality education accessible, one question at a time.*

