# Brainyfy — Full Product Design Session Export
> Complete record of ideation, research, architecture, and strategy
> Session date: May 2026 | Hackathon: Build with MeDo (medo.devpost.com) | Deadline: May 20, 2026

---

## 1. Context — The Hackathon

- **Platform:** MeDo by Baidu — AI-powered no-code app builder
- **Prize pool:** $50,000+
- **Tracks:** Work & Productivity · Business & E-commerce · Lifestyle & Game · Learning & Education · Surprise Us!
- **Top prizes:** 1st $10K · 2nd $6K · 3rd $4K · per-track $4,500
- **Submission requires:** App URL · description · demo video (≤3 min) · social post with #BuiltWithMeDo
- **Bonus:** $500 Creative Content Award · Social Blitz Prize (first 50 submitters) · Community Choice $500 (Discord)

---

## 2. Product Decision Journey

### Initial idea: Second brain app for students
- Target: students
- Focus: AI-powered knowledge retrieval — ask your notes
- Differentiator: AI that connects ideas automatically
- Early name: **MindMesh**

### Evolution: Brainyfy — broader, two-track product
The concept expanded to a universal second brain with two tracks:
1. **Personal track** — individual knowledge graph, Redis for Notion
2. **Organisation track** — central memory layer for teams, company brain

### Final lock-in: Company Brain first (personal as stretch goal)
Decision based on:
- Higher willingness to pay (companies vs individuals)
- YC explicit validation
- Stronger moat (data network effects)
- Direct revenue model ($50–500/seat/month)

---

## 3. One-Line Product Definition

> **Brainyfy is the memory layer your brain never had — a unified second brain that makes your personal knowledge instantly retrievable and turns your organisation's scattered information into executable intelligence.**

### Hackathon pitch (one line):
> *"Brainyfy is your company's second brain — connect your Slack, docs, and emails, and your team can ask any question and get an answer from your own institutional knowledge, instantly."*

---

## 4. The Problem — Validated With Numbers

### The knowledge loss crisis

| Metric | Figure | Source |
|---|---|---|
| Lost per large company/year from poor knowledge sharing | $47M | Panopto |
| Hours/day per employee spent searching for info | 2.5h (30% of workday) | IDC |
| Total annual loss across US companies from poor knowledge sharing | $31.5B | IDC |
| Professionals spending 1–5h/day searching for specific info | 47% | Pryon |
| Team efficiency drop after a senior employee leaves | 48% | University of Pennsylvania |
| Annual productivity cost per senior departure (1,000-person org) | $750,000 | UPenn |
| Employees saying it's difficult/impossible to get info from colleagues | 60% | Rev/Iterators |
| Orgs using 5+ platforms just for documenting and sharing info | 54% | KMWorld Survey |
| Cost to replace a senior executive (% of annual salary) | 213% | Center for American Progress |
| Annual US turnover cost (all industries) | $1 trillion | Gallup |
| Enterprise waste from ineffective knowledge systems (per 1,000 workers) | $2.5–3.5M/year | IDC |
| Productivity loss for 1,000-employee firm from knowledge loss | $2.4M/year | Panopto |
| Productivity loss for 30,000-employee firm | $72M/year | Panopto |
| McKinsey: equivalent headcount lost to search | 1 in 5 employees | McKinsey |

### The human cost
- 1 in 6 employees want to quit because they can't find information (Coveo 2022)
- 31% feel burned out from inability to find information
- IT workers spend 4.2 hours/day just searching (Coveo)
- 9 out of 10 first searches fail; 81% interrupt colleagues for help (Slite 2025)
- 45.5% productivity hit across organisations from broken knowledge systems

### The departure problem
When a senior employee or advisor leaves:
- ~50–100 junior employees are connected to each advisor
- Team efficiency drops 48% immediately
- 6-month on-ramp period for replacement
- During that period, 50–100 people operate at 52% efficiency
- For a 1,000-person org = $750,000/year direct productivity loss
- Replacing an executive = up to 213% of their annual salary

---

## 5. Market Sizing

| Metric | Figure | Source |
|---|---|---|
| KM software market (2024) | $34.99B | SkyQuestT |
| KM software market (2025) | $38.98B | SkyQuestT |
| KM software market (2033) | $92.45B | SkyQuestT |
| CAGR (2026–2033) | 11.4% | SkyQuestT |
| Fastest growing segment: AI chatbots & virtual agents | 21.88% CAGR to 2031 | Mordor Intelligence |
| Large enterprise share of KM market (2024) | 66.6% | Grand View Research |
| SME growth rate (fastest growing buyer segment) | 19.02% CAGR | Mordor Intelligence |
| North America market share | 38% | Multiple sources |
| Asia-Pacific growth rate (fastest region) | 22.98% CAGR | Mordor Intelligence |

**Total addressable market context:** 1.25 billion knowledge workers globally

---

## 6. YC Validation — Direct Quote

From Y Combinator's live Requests for Startups (ycombinator.com/rfs):

> *"A system that pulls knowledge out of all these fragmented sources, structures it, keeps it current, and turns it into an executable skills file for AI. This isn't a company-wide search or a chatbot over documents."*

Additional analyst framing (TICE News, May 2026):
> *"The 'Company Brain' concept points toward a future where businesses build persistent intelligence layers that continuously ingest and operationalise institutional knowledge for AI systems. As AI agents become more capable, context may become the ultimate competitive advantage. The infrastructure opportunity here is enormous."*

---

## 7. Competitive Landscape

| Tool | Problem |
|---|---|
| Confluence / SharePoint | Manual filing. No AI linking. Teams hate using it. Knowledge goes in but rarely comes out usefully. Aged UX. |
| Notion / Guru | Good for storage. Weak AI. No auto-linking. No playbook generation. No executable output. |
| Obsidian / Roam | Personal only. No team layer. No integrations. Developer-centric. |
| **Brainyfy** | Ingests everything automatically. AI builds connections. Outputs executable playbooks AI agents can run. Zero manual filing required. |

**Key insight:** Existing tools are warehouses. Brainyfy is a brain. The difference is not storage — it's *thinking infrastructure*.

---

## 8. Product Architecture — Two Tracks

### Personal track (MBPS model — stretch goal)

**Core concept:** Upload anything → AI links everything → ask questions about your own life and knowledge

**Flow:**
1. Fast capture — text, voice, URLs, images, highlights
2. AI processing core — parse, chunk, embed, classify
3. Living knowledge graph — auto-links by topic, time, context, entity
4. Query interface — ask anything, get answers cited from your own uploads
5. Outputs — cited answers · connection map · related memories · daily digest

**Key differentiator:** Like Redis for Notion — ultra-fast retrieval with graph-linked context. Not a folder. A brain.

### Organisation track (primary build — Company Brain)

**Core concept:** Ingest all company knowledge → AI structures it → team queries it → AI agents can execute from it

**Flow:**
1. Knowledge ingestion — Slack, email, docs, wikis, SOPs, meeting transcripts
2. Team memory layer — versioned, role-gated, never lost
3. Ask the org brain — AI answers from company knowledge only
4. Executable playbooks — YC "skills file" — runnable from AI agents
5. Role-based access — per team, project, visibility scope

**Key differentiator:** Knowledge doesn't just get stored — it becomes *runnable*. Ask "how do we onboard a new engineer?" and get a step-by-step executable checklist synthesised from 3 years of Slack threads and docs.

### Shared AI core (both tracks)
- Semantic embeddings
- Auto-linking engine
- RAG-based retrieval
- Connection discovery
- Knowledge gap detection

### Storage architecture
| Store | Purpose | Technology |
|---|---|---|
| Vector DB | Semantic search | Pinecone / pgvector |
| Graph DB | Node relationships, connections | Neo4j |
| Relational DB | Users, orgs, roles, permissions | PostgreSQL |

---

## 9. Full Technical Architecture (6 Layers)

### Layer 1 — Data sources
- Slack (messages, threads)
- Email (Gmail, Outlook)
- Documents (PDF, Word, Markdown)
- Notion (pages, databases)
- Meeting transcripts
- Jira, Google Drive, and more

### Layer 2 — Ingestion pipeline
- **Connector layer:** OAuth + webhook sync per source
- **Parser + chunker:** LangChain text splitters, 512-token chunks
- **Auto-classifier:** Topic, owner, recency tagging

### Layer 3 — AI processing
- **Embedding engine:** OpenAI text-embedding-3 (or Cohere)
- **Graph auto-linker:** Cosine similarity + entity extraction → builds node connections
- **Playbook distiller:** LLM extracts SOPs and runnable procedures from raw threads/docs

### Layer 4 — Storage
- **Pinecone** (or pgvector) — vector storage for semantic search
- **Neo4j** — graph database for knowledge node relationships
- **PostgreSQL** — users, organisations, roles, permissions, audit logs

### Layer 5 — Intelligence layer
- **RAG pipeline:** Retrieve → augment → generate (with citations)
- **Access control:** RBAC — team, project, visibility scope
- **Agent API:** REST endpoint — AI agents can call playbooks and retrieve context

### Layer 6 — Output layer
- **Chat interface** — Q&A with source citations
- **Graph map** — visual node explorer showing knowledge connections
- **Playbooks** — runnable SOP steps generated from team knowledge
- **Org analytics** — knowledge gaps, usage heatmaps, coverage scores

### Tech stack
| Layer | Technology |
|---|---|
| Frontend | Next.js + React |
| Backend | FastAPI (Python) |
| AI / LLM | OpenAI GPT-4o + LangChain |
| Vector DB | Pinecone (or pgvector on Postgres) |
| Graph DB | Neo4j |
| Relational DB | PostgreSQL |
| Auth | Clerk / Auth0 (RBAC) |
| Infra | Vercel (frontend) + Railway/Render (backend) |
| Ingestion queue | Celery + Redis |

---

## 10. Why Company Brain Wins Over Personal Brain

| Dimension | Personal brain | Company brain |
|---|---|---|
| Willingness to pay | Low — individuals resist paying | High — companies have KM budgets |
| Pain intensity | "Nice to have" | "We're losing money without this" |
| YC interest | Not mentioned | Explicitly called out |
| Market | ~$13B personal productivity | ~$92B KM software by 2033 |
| Stickiness | Medium — people switch note apps | Extreme — once org data is in, it never leaves |
| Revenue model | Freemium, hard to convert | B2B SaaS, $50–500/seat/month |
| Competition | Notion, Obsidian (strong) | Confluence (old, hated), Guru (weak AI) |
| Moat | Low | High — data network effects per org |

### GTM strategy: personal is the trojan horse
One individual at a company starts using Brainyfy personally → connects work notes → invites team → becomes the org brain. This mirrors Slack, Notion, and Figma's growth paths. Personal adoption → enterprise contract.

---

## 11. Hackathon Build Strategy

### What NOT to build (overengineering)
- Both tracks simultaneously
- Full connector suite for all sources
- Complex RBAC from day 1
- Mobile app
- Agent API

### What TO build (3-day MVP)
**One sharp demo moment that makes judges go "wow."**

**Day 1:** Org workspace setup + upload anything (docs, paste text) + AI processes and stores it

**Day 2:** Knowledge graph auto-links uploads (visual) + "Ask the org brain" chat returns cited answers

**Day 3:** Playbooks auto-generated from uploaded content + deploy + record demo video + submit

### The demo flow (3 minutes)
1. Show messy company inputs — paste a Slack thread, upload a PDF SOP, paste meeting notes
2. Show the knowledge graph — AI has auto-linked them by topic and entity
3. Ask "How do we onboard a new engineer?" — get a synthesised answer with citations
4. Show the auto-generated playbook — step-by-step, runnable
5. Close: "This is what YC wants built. We built it in 3 days."

---

## 12. MeDo Build Prompts (Hackathon)

### Prompt 1 — App shell
> "Build a web app called Brainyfy — a company knowledge brain. Dark theme, teal accents. Home screen has two areas: a left sidebar listing all uploaded knowledge items with tags, and a main area with a chat interface where team members can ask questions. There is also an 'Upload' button at the top to add new documents or paste text."

### Prompt 2 — Upload and ingestion
> "Add an upload modal that accepts text paste, document upload, or a URL. When submitted, the item appears in the sidebar with an AI-generated title, 3 auto-generated tags, and a timestamp. Show a brief loading state while 'AI is processing'."

### Prompt 3 — Ask the brain (RAG chat)
> "Make the chat interface functional. When a user types a question and hits enter, the AI searches through all uploaded knowledge items and returns an answer that cites which document or item the answer came from. Show the source as a clickable link below the answer."

### Prompt 4 — Knowledge graph
> "Add a 'Connections' tab in the sidebar. It shows a visual graph where each uploaded item is a node, and nodes are connected by lines when they share topics, keywords, or entities. Nodes are teal circles, lines are thin gray. Clicking a node highlights it and shows its connections."

### Prompt 5 — Playbooks
> "Add a 'Playbooks' tab. When a user clicks 'Generate Playbook' on any topic (e.g. 'onboarding'), the AI reads all relevant uploaded items and generates a step-by-step numbered checklist that teams can follow. Each step has a checkbox. Show which source document each step came from."

---

## 13. Submission Strategy

### Track to enter
**Work & Productivity** — most aligned, $4,500 prize + eligible for overall prizes

### Submission description (draft)
> Brainyfy is a Company Brain — an AI-powered knowledge layer that ingests your team's Slack threads, emails, docs, and meeting notes, then makes all of it queryable and executable. Ask any question and get an answer cited from your own company's institutional knowledge. Auto-generate runnable playbooks from years of scattered conversations. Stop losing knowledge when people leave. This is what YC explicitly asked founders to build — and we built it on MeDo.

### Judging criteria alignment
- **Innovation:** First no-code Company Brain — YC-validated concept
- **Technical depth:** Multi-source ingestion + AI linking + RAG retrieval + playbook generation
- **Real-world value:** Solves $31.5B annual problem with a direct enterprise buyer

### Bonus prizes to target
- Post on X/Twitter with #BuiltWithMeDo → Social Blitz Prize (first 50 submitters, $500)
- Post in MeDo Discord showcase → Community Choice ($500)

---

## 14. Long-term Vision (Post-Hackathon)

### Phase 1 (0–3 months): MVP
- Company Brain core: ingest → link → query → playbooks
- 3–5 beta companies (startups, dev teams)
- Manual onboarding, white-glove setup

### Phase 2 (3–9 months): Product-led growth
- Self-serve signup
- Native Slack app + Notion integration
- Playbook sharing across teams
- Basic analytics dashboard

### Phase 3 (9–18 months): Platform
- Agent API — external AI agents call Brainyfy as a knowledge tool
- Multiple org "brains" (sales brain, engineering brain, HR brain)
- Enterprise RBAC, SSO, audit logs
- SOC2 compliance

### Revenue model
- Free tier: up to 3 users, 50 documents
- Team: $20/seat/month — unlimited docs, full integrations
- Enterprise: $50–100/seat/month — SSO, compliance, agent API, dedicated support

### Moat
Once an org's institutional knowledge is in Brainyfy, switching cost is extremely high. Every new document, thread, and meeting transcript makes the graph denser and more valuable. Data flywheel: more knowledge → better connections → better answers → more usage → more knowledge.

---

## 15. Key Framings for Any LLM or Pitch Deck

### Problem framing
"Companies are hemorrhaging institutional knowledge. Employees spend 2.5 hours a day just searching for information that already exists. When people leave, their knowledge walks out the door permanently. The tools meant to solve this — Confluence, Notion, SharePoint — are warehouses, not brains. They store things. They don't think."

### Solution framing
"Brainyfy is the Company Brain. Connect your Slack, email, docs, and meetings. AI automatically links everything, so your team can ask any question and get an answer from your own institutional knowledge — with citations. When someone leaves, their knowledge stays. When a new hire joins, they can ask 'why did we make this decision?' and get the answer from a thread written 2 years ago."

### Market framing
"We're entering a $92B knowledge management market that has never had an AI-native challenger. Every incumbent was built before LLMs existed. We're not improving Confluence — we're making it obsolete."

### YC framing
"Y Combinator explicitly listed this on their Requests for Startups: 'a system that pulls knowledge out of fragmented sources and turns it into an executable skills file for AI.' That is Brainyfy. Word for word."

### Traction angle (for future pitches)
"Every company with more than 10 employees has this problem. Every company with more than 50 employees is actively losing money from it. Our ICP is any tech-forward team that communicates on Slack and documents in Notion or Confluence — that's 3 million+ companies globally."

---

*End of export — Brainyfy full product design session*
*Generated: May 2026*