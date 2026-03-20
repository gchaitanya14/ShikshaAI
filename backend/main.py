import os
import sys
import shutil

sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from ingest import ingest_pdf, list_subjects
from tutor import answer_question, generate_mcq

app = FastAPI(title="ShikshaAI Education Tutor API")

# Allow requests from Vite dev server (port 5173) and any production origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "textbooks")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/api/subjects")
def get_subjects():
    return {"subjects": list_subjects()}


@app.post("/api/ingest")
async def ingest_textbook(file: UploadFile = File(...), subject: str = Form(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")
    if not subject.strip():
        raise HTTPException(status_code=400, detail="Subject name cannot be empty.")

    safe_subject = subject.strip().replace(" ", "_").lower()
    save_path = os.path.join(UPLOAD_DIR, f"{safe_subject}.pdf")

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    result = ingest_pdf(save_path, safe_subject)
    if result["status"] == "error":
        raise HTTPException(status_code=422, detail=result["message"])

    return result


class QuestionRequest(BaseModel):
    question: str
    subject: str
    difficulty: str = "medium"


@app.post("/api/ask")
def ask_question(req: QuestionRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    if not req.subject.strip():
        raise HTTPException(status_code=400, detail="Please select a subject.")
    return answer_question(req.question, req.subject, req.difficulty)


class MCQRequest(BaseModel):
    topic: str
    subject: str
    num_questions: int = 5


@app.post("/api/mcq")
def get_mcq(req: MCQRequest):
    if not req.topic.strip():
        raise HTTPException(status_code=400, detail="Topic cannot be empty.")
    if not req.subject.strip():
        raise HTTPException(status_code=400, detail="Please select a subject.")
    if req.num_questions < 3 or req.num_questions > 10:
        raise HTTPException(status_code=400, detail="Questions must be between 3 and 10.")

    result = generate_mcq(req.topic, req.subject, req.num_questions)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])

    return result
