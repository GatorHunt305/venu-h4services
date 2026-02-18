# Venu subdomain – venu.h4services.co

This folder is the **standalone site for https://venu.h4services.co**. It is meant to be deployed as a **separate GitHub repo** so GitHub Pages can use it as the custom domain for the subdomain (GitHub allows only one custom domain per repo).

## Deploy as venu.h4services.co

### 1. Create a new GitHub repo

- On GitHub: **New repository** (e.g. name: `venu-h4services` or `venu`).
- Do **not** add a README, .gitignore, or license (this folder already has content).

### 2. Push this folder to the new repo

From your machine, in this folder (`venu-subdomain`):

```powershell
cd "path\to\small-business-websites\venu-subdomain"
git init
git add .
git commit -m "Venu subdomain site for venu.h4services.co"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_VENU_REPO.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_VENU_REPO` with your GitHub username and the repo name you created.

### 3. Enable GitHub Pages and set custom domain

- In the **new repo** → **Settings** → **Pages**.
- **Source:** Deploy from branch.
- **Branch:** `main` (or `master`) → **/ (root)**.
- **Custom domain:** Enter **venu.h4services.co**.
- Click **Save**. Wait for DNS check; if GitHub asks for a CNAME record, add it in Cloudflare (step 4).

### 4. Cloudflare DNS (h4services.co)

- **Cloudflare** → **Websites** → **h4services.co** → **DNS** → **Records**.
- Add or edit:
  - **Type:** CNAME  
  - **Name:** `venu`  
  - **Target:** `YOUR_USERNAME.github.io` (same value you use for www, e.g. `gatorhunt305.github.io`)  
  - **Proxy:** Proxied (orange cloud) is fine.
- Save.

GitHub serves the correct repo based on the request host: `www.h4services.co` → main site repo; `venu.h4services.co` → this repo.

### 5. Optional: redirect old URL to subdomain

To redirect **www.h4services.co/venu.html** → **https://venu.h4services.co** (e.g. for bookmarks):

- **Cloudflare** → **Rules** → **Page Rules** → **Create Page Rule**.
- **URL:** `*www.h4services.co/venu.html`
- **Setting:** Forwarding URL → **301** → `https://venu.h4services.co`
- Save and deploy.

---

## Contents

- **index.html** – Venu landing (same content as main site’s venu.html, with links to www.h4services.co for Contact, Get started, Demos, H4 Services).
- **venu.css** – Main Venu styles.
- **venu-cinematic-demo.css** – Cinematic demo section styles.
- **venu-cinematic-demo.js** – Cinematic demo behaviour.
- **venu-favicon.svg** – Favicon.

Contact, Get started, and “View demos” link to **https://www.h4services.co/** so the subdomain stays minimal and the main site stays the single source for those pages.
