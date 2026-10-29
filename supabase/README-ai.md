# AI features (optional)
Edge function `qaf-ai` is deployed. To switch AI on: Supabase → Edge Functions → Secrets → add `ANTHROPIC_API_KEY` (from console.anthropic.com, with a monthly spend limit).
Until then the chat uses the free rule-based answers and the "Write my bio with AI" button hides itself.
Limits: 25 chat / 6 bio requests per visitor per hour, 400 AI calls per day (QAF_DAILY_CAP).
