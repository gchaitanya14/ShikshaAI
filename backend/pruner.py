from sentence_transformers import util
from ingest import get_model


def prune_context(
    query: str,
    retrieved_chunks: list[str],
    top_sentences: int = 15,
    similarity_threshold: float = 0.25,
) -> dict:
    """
    Strips irrelevant sentences from retrieved chunks before passing to the LLM.
    Returns a pruned context string along with stats for cost comparison.

    The idea is simple: instead of dumping entire page-chunks into the prompt,
    we rank individual sentences by their cosine similarity to the query and
    keep only the top-N most relevant ones. This usually cuts token usage by
    40-70% while keeping the answer quality the same (often better, because
    there's less noise for the model to wade through).
    """
    model = get_model()

    # Break every chunk into individual sentences
    all_sentences = []
    for chunk in retrieved_chunks:
        sentences = [
            s.strip()
            for s in chunk.replace("\n", " ").split(".")
            if len(s.strip()) > 20
        ]
        all_sentences.extend(sentences)

    # Edge-case: nothing usable came back from the retriever
    if not all_sentences:
        joined = " ".join(retrieved_chunks)
        word_count = len(joined.split())
        return {
            "pruned_context": joined,
            "original_sentences": 0,
            "kept_sentences": 0,
            "original_tokens_est": int(word_count * 1.3),
            "pruned_tokens_est": int(word_count * 1.3),
        }

    # Encode query and all sentences, then score by cosine similarity
    query_embedding = model.encode(query, convert_to_tensor=True)
    sentence_embeddings = model.encode(all_sentences, convert_to_tensor=True)
    scores = util.cos_sim(query_embedding, sentence_embeddings)[0].tolist()

    # Filter out low-relevance sentences, sort by score descending
    scored = [
        (score, sent)
        for score, sent in zip(scores, all_sentences)
        if score >= similarity_threshold
    ]
    scored.sort(reverse=True)

    top = [sent for _, sent in scored[:top_sentences]]
    pruned_context = ". ".join(top).strip()

    original_words = sum(len(c.split()) for c in retrieved_chunks)
    pruned_words = len(pruned_context.split())

    return {
        "pruned_context": pruned_context,
        "original_sentences": len(all_sentences),
        "kept_sentences": len(top),
        "original_tokens_est": int(original_words * 1.3),
        "pruned_tokens_est": int(pruned_words * 1.3),
    }
