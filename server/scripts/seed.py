"""Seed the database with demo data for Brainyfy demos.

Usage:
    cd server
    python -m scripts.seed
"""

import asyncio
import sys
from pathlib import Path

# Ensure server/ is on path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.db.session import async_session
from app.models import Org, User, KnowledgeItem, SourceType
from app.models.base import generate_cuid
from app.services.auth_service import hash_password
from app.services.ingestion import auto_tag, chunk_text
from app.services.embeddings import get_embedding
from app.services.vector_store import upsert_vector
from app.services.linker import link_new_item

DEMO_ORG_NAME = "Acme Corp"
DEMO_USER_EMAIL = "demo@acme.com"
DEMO_USER_PASSWORD = "demo1234"

KNOWLEDGE_ITEMS = [
    {
        "title": "Customer Refund Policy",
        "content": """Acme Corp Refund Policy:
1. All refund requests must be submitted within 30 days of purchase.
2. Refunds for digital products are only granted if the product is defective.
3. Physical products must be returned in original packaging.
4. Refund processing takes 5-7 business days.
5. Customers should contact support@acme.com with their order ID.
6. Partial refunds are available for partially used subscriptions.
7. No refunds for services already rendered.""",
    },
    {
        "title": "New Employee Onboarding Checklist",
        "content": """Onboarding a New Employee at Acme Corp:
- Day 1: HR orientation, office tour, IT equipment setup
- Day 1: Set up email, Slack, Jira, GitHub accounts
- Day 2: Meet the team, 1:1 with manager, review team OKRs
- Day 3: Read company handbook and engineering wiki
- Week 1: Shadow a senior engineer on a real project
- Week 2: First small PR, code review process walkthrough
- Week 3: Solo task assignment with mentor support
- Month 1: 30-day check-in with manager and HR""",
    },
    {
        "title": "Incident Response Runbook",
        "content": """On-Call Incident Response at Acme Corp:
1. Acknowledge the PagerDuty alert within 5 minutes.
2. Join the #incident-response Slack channel immediately.
3. Assess severity: P1 (full outage), P2 (degraded), P3 (minor).
4. For P1: page the engineering lead and notify VP of Engineering.
5. Start a shared Google Doc as the incident timeline.
6. Communicate status updates every 15 minutes in #incidents.
7. After resolution, write a blameless post-mortem within 48 hours.
8. Schedule a post-mortem review meeting with stakeholders.""",
    },
    {
        "title": "Deployment Guide",
        "content": """Deploying to Production at Acme Corp:
1. Ensure all tests pass on CI (GitHub Actions).
2. Get at least 2 code review approvals.
3. Merge PR to main branch.
4. CI/CD pipeline auto-deploys to staging.
5. Run smoke tests on staging environment.
6. Use the #deploy Slack channel to announce production deploy.
7. Click 'Promote to Production' in the deployment dashboard.
8. Monitor Datadog dashboards for 30 minutes post-deploy.
9. If errors spike above 1%, initiate rollback procedure.""",
    },
    {
        "title": "Engineering Team Meeting Notes - Sprint 42",
        "content": """Sprint 42 Retro Notes:
- Shipped: User dashboard v2, search improvements, billing page redesign
- Blocked: API rate limiting — waiting on infrastructure team
- Discussion: Should we migrate from REST to GraphQL for the mobile app?
- Action items:
  - Alex: Write RFC for GraphQL migration by Friday
  - Sarah: Fix flaky tests in CI pipeline
  - Dev: Set up Datadog APM tracing for payment service
- Next sprint focus: Performance optimization and mobile app launch prep""",
    },
    {
        "title": "Company Values and Culture",
        "content": """Acme Corp Core Values:
1. Customer First — Every decision starts with the customer impact.
2. Move Fast, Stay Safe — Ship quickly but never compromise on quality.
3. Radical Transparency — Share context openly, default to public channels.
4. Own Your Outcomes — Take responsibility for results, not just tasks.
5. Learn and Teach — Invest in growth, share knowledge with the team.
6. Diversity is Strength — Different perspectives lead to better products.
These values guide our hiring, promotions, and daily decisions.""",
    },
    {
        "title": "Sales Objection Handling Guide",
        "content": """Common Sales Objections and Responses:
- 'Too expensive': Show ROI calculator, mention 3x average payback period. Offer annual billing discount.
- 'We already have a solution': Ask about pain points with current tool. Highlight our unique AI features.
- 'Need to talk to my manager': Offer to join the call, prepare executive summary deck.
- 'Not the right time': Set a follow-up in 3 months, send relevant case study.
- 'Concerns about security': Share SOC 2 Type II report, GDPR compliance docs.
- 'Need more features': Show roadmap, discuss custom enterprise plan.""",
    },
]


async def seed():
    print("[SEED] Seeding Brainyfy demo data...")
    print()

    async with async_session() as db:
        # Check for existing org (idempotent re-runs)
        from sqlalchemy import select

        result = await db.execute(select(Org).where(Org.slug == "acme-corp"))
        org = result.scalar_one_or_none()
        if org:
            print(f"[OK] Org already exists: {DEMO_ORG_NAME} ({org.id})")
        else:
            org = Org(id=generate_cuid(), name=DEMO_ORG_NAME, slug="acme-corp")
            db.add(org)
            await db.flush()
            print(f"[OK] Created org: {DEMO_ORG_NAME} ({org.id})")

        # Check for existing user
        result = await db.execute(select(User).where(User.email == DEMO_USER_EMAIL))
        user = result.scalar_one_or_none()
        if user:
            print(f"[OK] User already exists: {DEMO_USER_EMAIL}")
        else:
            user = User(
                id=generate_cuid(),
                org_id=org.id,
                email=DEMO_USER_EMAIL,
                name="Demo User",
                password_hash=hash_password(DEMO_USER_PASSWORD),
                role="ADMIN",
            )
            db.add(user)
            await db.flush()
            print(f"[OK] Created user: {DEMO_USER_EMAIL} / {DEMO_USER_PASSWORD}")
        print()

        # Ingest knowledge items
        for i, item_data in enumerate(KNOWLEDGE_ITEMS, 1):
            title = item_data["title"]
            content = item_data["content"]

            try:
                tags = await auto_tag(content)
            except Exception:
                tags = ["general"]

            item = KnowledgeItem(
                id=generate_cuid(),
                org_id=org.id,
                title=title,
                content=content,
                source=SourceType.PASTE,
                tags=tags,
                created_by=user.id,
            )
            db.add(item)
            await db.flush()

            chunks = chunk_text(content)
            if not chunks:
                chunks = [content[:500]]

            primary_vid = f"{item.id}_0"
            embedding = await get_embedding(chunks[0])
            await upsert_vector(
                primary_vid,
                embedding,
                {"orgId": org.id, "itemId": item.id, "chunkIndex": 0},
            )

            for ci, chunk in enumerate(chunks[1:], 1):
                vid = f"{item.id}_{ci}"
                emb = await get_embedding(chunk)
                await upsert_vector(
                    vid, emb,
                    {"orgId": org.id, "itemId": item.id, "chunkIndex": ci},
                )

            item.pinecone_id = primary_vid
            await link_new_item(org.id, item.id, title, tags, embedding)

            print(f"  [{i}/{len(KNOWLEDGE_ITEMS)}] {title}  (tags: {tags})")

        await db.commit()

    print()
    print("[DONE] Seed complete!")
    print(f"   Login: {DEMO_USER_EMAIL} / {DEMO_USER_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(seed())
