# Deployment Guide

A static site: `index.html`, `styles.css`, `script.js`, `assets/profile.png`. No build step, no dependencies.

## Deploy on GitHub Pages

1. Create a new repo (e.g. `ageraustine/portfolio`, or `ageraustine.github.io` if you want it at the root of your GitHub domain).
2. Push these files to the repo root:
   ```
   git init
   git add .
   git commit -m "Portfolio site"
   git branch -M main
   git remote add origin https://github.com/ageraustine/<repo-name>.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Source**, select the `main` branch and `/ (root)`, then **Save**.
4. Your site goes live at `https://ageraustine.github.io/<repo-name>/` (or `https://ageraustine.github.io/` if you used the special `ageraustine.github.io` repo name). It can take a minute or two on first deploy.

## Editing content

- **Text/sections**: edit directly in `index.html` — experience is under `#log`, projects under `#projects`, skills under `#stack`.
- **Colors/type**: all design tokens are CSS variables at the top of `styles.css` (`:root { ... }`).
- **Photo**: swap `assets/profile.png` for a new image with the same filename, or update the `src` in the `.contact-photo` block in `index.html`.
- The `garageos` project card is intentionally minimal since I couldn't pull details from a live README for it — fill in the description in `index.html` once you're ready to add specifics.
