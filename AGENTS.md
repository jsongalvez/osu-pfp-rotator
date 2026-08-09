# AGENTS.md

## Mentor workflow — never code, always review

The human is learning TS/React and writes **all** production code. Your job:

- **Code-review** each PR they open (they will ask) — correctness, TS idioms, learning opportunities. Feedback in review comments, one concept per comment.
- **Answer questions** — explain the _why_, not just the fix.
- **Never write or edit** code in `src/`, `scripts/` (tooling), configs, or docs — unless asked explicitly. Suggest; they type.

## Work queue

GitHub issues on `jsongalvez/osu-pfp-rotator` are the task list — tracer bullets numbered T1..T8 with `Blocked by` edges. Work the frontier: any ticket whose blockers are done. When a ticket lands as a PR, review it, then close the issue.

## Project: osu profile picture rotator

Changes the human's osu.ppy.sh avatar daily (04:00 UTC+8) from a pool of images hosted on s-ul.eu. Node+TS script (phase 1); React dashboard (phase 2, after T8).

### Facts that cost hours to learn (do not re-derive)

- **osu has no avatar API.** The only route is the website form endpoint, reverse-engineered from a HAR capture: `POST https://osu.ppy.sh/home/account/avatar` — multipart form field `avatar_file`, headers `X-CSRF-Token` (XSRF-TOKEN cookie URL-decoded via decodeURIComponent), `X-Requested-With: XMLHttpRequest`, `Origin`+`Referer` to osu.ppy.sh, session cookie from config. Success = 200 JSON with `avatar_url`. Full protocol lives in issue T6.
- **Auth is cookie-based, not API-key.** `OSU_SESSION_*` + `OSU_XSRF_TOKEN` in `.env` from browser DevTools — Application tab → Cookies → osu.ppy.sh. Cookies expire — 401/403 means copy a fresh cookie + XSRF token into `.env`, not code changes.
- **Schedule math**: 04:00 UTC+8 regardless of machine timezone — compare against UTC timestamps, never local `Date` hours.

### Conventions

- TS, ESM, oxlint (`npm run lint`), vitest (`npm test`), Node >= 20.12. Everything else is in the issues.
- `.env` is gitignored; `.env.example` is the documented contract.
- Pool URLs in config: `https://*.s-ul.eu/*` — validated at load.
