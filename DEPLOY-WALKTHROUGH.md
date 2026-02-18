# Deploy venu.h4services.co – Step-by-step walkthrough

Follow these steps in order. You’ll create a new GitHub repo, push the Venu subdomain site, turn on GitHub Pages with the custom domain, then point Cloudflare DNS at it.

---

## Part 1: Create the new GitHub repo

### Step 1.1 – Open GitHub

1. Go to **https://github.com** and sign in.
2. Click the **+** (plus) in the top-right → **New repository**.

### Step 1.2 – Repo settings

1. **Repository name:**  
   Use something like **venu-h4services** or **venu** (short and clear).
2. **Description (optional):** e.g. `Venu landing page for venu.h4services.co`.
3. **Public**.
4. **Do NOT** check “Add a README file”, “Add .gitignore”, or “Choose a license” – we’re pushing an existing folder.
5. Click **Create repository**.

### Step 1.3 – Copy the repo URL

On the next screen you’ll see “Quick setup” with a URL like:

- **HTTPS:** `https://github.com/YOUR_USERNAME/venu-h4services.git`  
- **SSH:** `git@github.com:YOUR_USERNAME/venu-h4services.git`

Copy the **HTTPS** URL (or SSH if you use SSH). You’ll need it in Part 2.  
Replace **YOUR_USERNAME** and **venu-h4services** with your actual username and repo name in the steps below.

---

## Part 2: Push the venu-subdomain folder to the new repo

You’ll run these in **PowerShell** (or Terminal), from the **venu-subdomain** folder.

### Step 2.1 – Open the folder

1. Open PowerShell (or Windows Terminal).
2. Go to the `venu-subdomain` folder. Example (adjust the path if yours is different):

```powershell
cd "c:\Users\liamh\Documents\New folder\OneDrive\Documents\Cursor Projects\small-business-websites\venu-subdomain"
```

### Step 2.2 – Initialize Git and make the first commit

Run these one at a time:

```powershell
git init
```

```powershell
git add .
```

```powershell
git status
```

You should see: `index.html`, `venu.css`, `venu-cinematic-demo.css`, `venu-cinematic-demo.js`, `venu-favicon.svg`, `README.md` (and this file if you want it). Then:

```powershell
git commit -m "Venu subdomain site for venu.h4services.co"
```

### Step 2.3 – Rename branch to main (if needed)

```powershell
git branch -M main
```

### Step 2.4 – Add the new repo as remote and push

Replace **YOUR_USERNAME** and **venu-h4services** with your real GitHub username and repo name:

```powershell
git remote add origin https://github.com/YOUR_USERNAME/venu-h4services.git
```

```powershell
git push -u origin main
```

If GitHub asks for login, use your username and a **Personal Access Token** (not your password).  
After this, the new repo on GitHub should contain all the files from `venu-subdomain`.

---

## Part 3: Turn on GitHub Pages and set the custom domain

### Step 3.1 – Open Pages settings

1. On GitHub, open the **venu-h4services** repo (your new repo).
2. Click **Settings**.
3. In the left sidebar, under “Code and automation”, click **Pages**.

### Step 3.2 – Choose source

1. Under **Build and deployment**:
   - **Source:** **Deploy from a branch**.
2. Under **Branch**:
   - Branch: **main** (or **master** if that’s what you have).
   - Folder: **/ (root)**.
3. Click **Save**.

### Step 3.3 – Set custom domain

1. Under **Custom domain**, type: **venu.h4services.co** (no `https://`, no `www`).
2. Click **Save**.
3. GitHub may show “DNS check is still in progress” or “Waiting for DNS” – that’s normal. We’ll fix DNS in Part 4.
4. If there’s a checkbox for **Enforce HTTPS**, leave it checked (you can enable it after DNS works).

---

## Part 4: Point Cloudflare DNS to GitHub

GitHub Pages is now serving your repo; we need the domain **venu.h4services.co** to point at GitHub.

### Step 4.1 – Open Cloudflare DNS

1. Go to **https://dash.cloudflare.com** and sign in.
2. Click the **h4services.co** site (your main site).
3. In the left sidebar, click **DNS** → **Records**.

### Step 4.2 – Add or edit the venu record

- If you **already have** a record whose **Name** is **venu** (or venu.h4services.co):
  - Click **Edit** on that row.
- If you **don’t** have a venu record:
  - Click **Add record**.

Then set:

| Field        | Value                          |
|-------------|---------------------------------|
| **Type**    | CNAME                           |
| **Name**    | venu                            |
| **Target**  | YOUR_USERNAME.github.io         |
| **Proxy status** | Proxied (orange cloud)   |

- **Target** must be your **GitHub Pages hostname**: replace **YOUR_USERNAME** with your GitHub username (e.g. **gatorhunt305.github.io**). No `https://`, no path, no `www`.
- **TTL:** Auto is fine.

Click **Save**.

### Step 4.4 – Wait and recheck GitHub

1. Wait **2–5 minutes**.
2. In GitHub → repo **Settings** → **Pages**, look at **Custom domain**. It should eventually show that the domain is verified (green check or “DNS check successful”).
3. If GitHub still shows a CNAME recommendation, it should match: **venu** → **YOUR_USERNAME.github.io**. That’s what we set in Cloudflare.

---

## Part 5: Test the subdomain

1. Open a new browser tab (or incognito).
2. Go to **https://venu.h4services.co**.
3. You should see the Venu landing page (hero, demo section, pricing, etc.).  
   If you see a GitHub 404 or “There isn’t a GitHub Pages site here”, wait a bit longer and try again; sometimes it takes 5–10 minutes.

---

## Optional: Redirect www.h4services.co/venu.html → venu.h4services.co

So anyone with an old link or bookmark still lands on the subdomain:

1. **Cloudflare** → **h4services.co** → **Rules** → **Page Rules**.
2. **Create Page Rule**.
3. **URL pattern:** `*www.h4services.co/venu.html`
4. **Add a Setting** → **Forwarding URL**:
   - Status code: **301 - Permanent Redirect**
   - Destination URL: **https://venu.h4services.co**
5. **Save and Deploy**.

After that, visiting **www.h4services.co/venu.html** will redirect to **https://venu.h4services.co**.

---

## Quick reference

| Step | Where | What |
|------|--------|------|
| 1   | GitHub | New repo, no README/.gitignore |
| 2   | PowerShell in `venu-subdomain` | `git init`, `add`, `commit`, `remote add`, `push` |
| 3   | GitHub → repo Settings → Pages | Deploy from branch **main** / root, custom domain **venu.h4services.co** |
| 4   | Cloudflare → h4services.co → DNS | CNAME **venu** → **YOUR_USERNAME.github.io** (proxied) |
| 5   | Browser | Open **https://venu.h4services.co** and confirm it loads |

If any step fails (e.g. push rejected, DNS error, or “domain already in use”), stop at that step and check the error message; you can use that to troubleshoot or ask for help with the exact message.
