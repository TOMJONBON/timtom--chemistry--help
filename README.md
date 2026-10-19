# Timtom Chemistry Help

Personal AP Chemistry study tool. Not affiliated with or endorsed by College Board.

## Setup
- `npm install`
- `npm run dev`
- Build: `npm run build`
- Validate content: `npm run validate` (checks each subunit has 10 MCQs + 10 FRQs, 2 per difficulty level)
- Deploy the `dist` folder on Vercel or Netlify.

## Content
- Content lives in `src/content/unitN.json` — new files are picked up automatically.
- Each subunit with content must have 10 MCQs and 10 FRQs, split 2 per difficulty level.
- Run `npm run validate` before shipping.
- Subunit titles still need to be verified against the current AP Chemistry CED.

## What's done
- Units 3.1 and 4.1–4.9 have full content (10 MCQs + 10 FRQs each).
- Periodic table has all 118 elements with oxidation states; trend shading for radius/EN/IE is approximate.
- Quiz filters by unit, subunit, and difficulty; feedback can be after each question or only at the end.
- FRQ practice filters by unit, subunit, difficulty; auto-checks numeric and multiple-choice parts; rubric self-check for explanations.
- Content browser at /browse.
- About page at /about. Login stub at /login (no accounts yet).
- Validation script at scripts/validate.mjs.

## What's not done
- Unit 3 subunits 3.2–3.13 still need full content.
- Cloud sync, accounts, timed full exam, AI grading are Phase 2.
## Deploy to GitHub Pages
1. Create a new GitHub repository and push this folder to the `main` branch:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. On GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.
3. Each push to `main` validates the content, builds the site and deploys it. Watch progress in the **Actions** tab.
4. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

The site works under any repo name because it uses relative asset paths (`base: './'`) and hash-based routing.

If the site displays a deployment message instead of the app, GitHub Pages is serving the source files directly. Set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**, then rerun the **Deploy to GitHub Pages** workflow.
