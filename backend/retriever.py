from ingest import get_model, get_collection


def retrieve(query: str, subject: str, top_k: int = 5) -> list[str]:
    """
    Fetches the top-k most relevant page-chunks from ChromaDB for the given
    query, filtered to the chosen subject. Returns raw document strings.
    """
    model = get_model()
    collection = get_collection()

    query_embedding = model.encode(query).tolist()

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"subject": subject},
    )

    documents = results.get("documents", [[]])[0]
    return documents
