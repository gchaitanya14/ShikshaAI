import fitz  
import chromadb
from sentence_transformers import SentenceTransformer
import os

_model = None
_client = None
_collection = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def get_collection():
    global _client, _collection
    if _collection is None:
        _client = chromadb.PersistentClient(path="./chroma_db")
        _collection = _client.get_or_create_collection("textbook_chunks")
    return _collection


def ingest_pdf(pdf_path: str, subject: str) -> dict:
    doc = fitz.open(pdf_path)
    chunks = []

    for page_num, page in enumerate(doc):
        text = page.get_text().strip()
        if len(text) < 50:
            continue
        chunks.append({
            "text": text,
            "page": page_num + 1,
            "subject": subject,
            "id": f"{subject}_page_{page_num + 1}",
        })

    if not chunks:
        return {"status": "error", "message": "No readable text found in PDF."}

    model = get_model()
    collection = get_collection()

    texts = [c["text"] for c in chunks]
    embeddings = model.encode(texts, batch_size=32, show_progress_bar=False).tolist()

    collection.upsert(
        ids=[c["id"] for c in chunks],
        embeddings=embeddings,
        documents=texts,
        metadatas=[{"page": c["page"], "subject": c["subject"]} for c in chunks],
    )

    return {
        "status": "success",
        "pages_ingested": len(chunks),
        "subject": subject,
    }


def list_subjects() -> list[str]:
    collection = get_collection()
    results = collection.get(include=["metadatas"])
    subjects = list({m["subject"] for m in results["metadatas"]}) if results["metadatas"] else []
    return sorted(subjects)
