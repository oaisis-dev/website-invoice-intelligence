# Deploy to GitHub Pages and Custom Domain (invoiceoasis.com)

This repo deploys the **contents of `build/`** as the site root to GitHub Pages. The live site can be served at **https://www.invoiceoasis.com** (and optionally **https://invoiceoasis.com**) once GitHub Pages and DNS are configured.

---

## 1. One-time: GitHub repo Settings

1. Open the repo on GitHub: **Settings → Pages**.
2. Under **Build and deployment**:
   - **Source:** choose **GitHub Actions** (not “Deploy from a branch”).
3. Under **Custom domain**:
   - Enter: **www.invoiceoasis.com**
   - Click **Save**.
4. (Optional) To also serve the apex domain **invoiceoasis.com**:
   - After adding the DNS records below, you can add **invoiceoasis.com** as well in the same Custom domain section and use a redirect, or rely on the A records so that both apex and www work once DNS is set.

No `CNAME` file is required in the repo when using GitHub Actions as the source.

---

## 2. DNS records at GoDaddy (invoiceoasis.com)

Add these records in **GoDaddy → My Products → invoiceoasis.com → DNS** (or “Manage DNS”). Remove any conflicting records for the same name/type.

### Option A: Use both www and apex (recommended)

| Type  | Name | Value / Points to        | TTL   |
|-------|------|---------------------------|-------|
| **CNAME** | **www** | **oaisis-dev.github.io** | 600 (10 min) or 1 Hour |
| **A**     | **@**   | **185.199.108.153**      | 600 or 1 Hour |
| **A**     | **@**   | **185.199.109.153**      | 600 or 1 Hour |
| **A**     | **@**   | **185.199.110.153**      | 600 or 1 Hour |
| **A**     | **@**   | **185.199.111.153**      | 600 or 1 Hour |

- **www** → CNAME **www** → **oaisis-dev.github.io**  
  So **https://www.invoiceoasis.com** is served by GitHub Pages.
- **@** (apex) → Four **A** records to the IPs above  
  So **https://invoiceoasis.com** is served by GitHub Pages.

Important: For the apex (**@**), do **not** add a CNAME at the same time as the A records. Use only these four A records for **@**.

### Option B: Use only www

If you only want **https://www.invoiceoasis.com** and will redirect apex elsewhere (or leave it unused):

| Type    | Name | Value / Points to        | TTL   |
|---------|------|---------------------------|-------|
| **CNAME** | **www** | **oaisis-dev.github.io** | 600 or 1 Hour |

No A records needed for **@** unless you want the apex to resolve.

---

## 3. HTTPS (SSL)

- GitHub Pages provisions a certificate for your custom domain after DNS is correct.
- In **Settings → Pages → Custom domain**, wait until the domain shows as **verified** and **HTTPS** is enabled (can take a few minutes to an hour after DNS propagates).
- Use **https://www.invoiceoasis.com** (and **https://invoiceoasis.com** if you added the A records) so the site is always loaded over HTTPS.

---

## 4. Deployments

- Every push to **main** runs the workflow in **.github/workflows/deploy-pages.yml** and publishes the **contents of `build/`** as the site root.
- To deploy manually: **Actions → Deploy to GitHub Pages → Run workflow** (branch: main).

---

## 5. GoDaddy steps (summary)

1. Go to [GoDaddy](https://www.godaddy.com) → **My Products** → **invoiceoasis.com** → **DNS** or **Manage DNS**.
2. Add the **CNAME** for **www** → **oaisis-dev.github.io**.
3. Add the four **A** records for **@** with the IPs above (if you want apex to point to GitHub Pages).
4. Save and wait for DNS propagation (often &lt; 1 hour).
5. In the repo, **Settings → Pages**: set Source to **GitHub Actions** and Custom domain to **www.invoiceoasis.com**, then save.

After that, **https://www.invoiceoasis.com** (and **https://invoiceoasis.com** if you added the A records) will serve the site over HTTPS.
