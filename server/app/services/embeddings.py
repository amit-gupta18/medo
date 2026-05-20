import httpx

from app.config import settings

EMBED_MODEL = "openai/text-embedding-3-small"


async def get_embedding(text: str) -> list[float]:
    if not settings.OPENROUTER_API_KEY:
        # Deterministic pseudo-embedding for local dev without API key
        import hashlib

        h = hashlib.sha256(text.encode()).digest()
        return [((b / 255.0) * 2 - 1) for b in h] * 48  # 384 dims

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{settings.OPENROUTER_BASE}/embeddings",
            headers={"Authorization": f"Bearer {settings.OPENROUTER_API_KEY}"},
            json={
                "model": EMBED_MODEL,
                "input": text[:8000],
                "dimensions": 768,
            },
            timeout=60.0,
        )
        res.raise_for_status()
        return res.json()["data"][0]["embedding"]


async def call_llm(prompt: str, system: str, model: str = "anthropic/claude-3.5-sonnet") -> str:
    if not settings.OPENROUTER_API_KEY:
        return prompt[:500] if len(prompt) > 100 else "Configure OPENROUTER_API_KEY for AI features."

    async with httpx.AsyncClient() as client:
        res = await client.post(
            f"{settings.OPENROUTER_BASE}/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "HTTP-Referer": settings.FRONTEND_URL,
                "X-Title": "Brainyfy",
            },
            json={
                "model": model,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt},
                ],
            },
            timeout=60.0,
        )
        res.raise_for_status()
        return res.json()["choices"][0]["message"]["content"]
