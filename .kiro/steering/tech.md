# Technology Stack
- **Frontend Framework:** Next.js (App Router), React, TypeScript.
- **Styling:** Tailwind CSS with shadcn/ui components (Dark mode prioritized, clean aviation aesthetic).
- **Backend & Database:** Supabase (PostgreSQL) and Supabase Auth.
- **AI Integration:** Vercel AI SDK using the Google Gemini provider (`@ai-sdk/google`).
- **Hosting:** Vercel.

## Development Rules
- Strict TypeScript enforcement.
- Keep components modular and the UI highly mobile-responsive.
- Use Kiro's "Supabase Power" if database schema adjustments are needed.
- Ensure secure handling of the `GEMINI_API_KEY` and Supabase keys in `.env.local`.
