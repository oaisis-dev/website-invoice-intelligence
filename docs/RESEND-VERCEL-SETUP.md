# Resend + Vercel: Contact Form Email

The contact form POSTs to **`/api/contact`** and uses [Resend](https://resend.com) to send email from **noreply@invoiceoasis.com** to **agent@openoaisis.com** (CC **chris@openoaisis.com**).

---

## 1. Resend setup

1. **Sign up** at [resend.com](https://resend.com).
2. **Verify the domain** **invoiceoasis.com**:
   - Go to [Resend → Domains](https://resend.com/domains).
   - Add **invoiceoasis.com** and add the DNS records they show (in GoDaddy or your DNS provider).
   - Wait until the domain shows as verified.
3. **Create an API key**:
   - Go to [Resend → API Keys](https://resend.com/api-keys).
   - Create a key with “Sending access” and copy it (you won’t see it again).

You’ll use this key in Vercel as `RESEND_API_KEY`. The **From** address used by the API is **Invoice Intelligence &lt;noreply@invoiceoasis.com&gt;**; it must use your verified domain.

---

## 2. Vercel setup

1. **Import the repo** at [vercel.com](https://vercel.com): **Add New → Project**, select **oaisis-dev/website-invoice-intelligence** (or your fork).
2. **Project settings** (before or after first deploy):
   - **Framework Preset:** Other.
   - **Build Command:** leave empty (or `echo 'no build'`).
   - **Output Directory:** `build`.
   - **Install Command:** `npm install` (default).
3. **Environment variable:**
   - **Settings → Environment Variables**
   - Add **RESEND_API_KEY** = your Resend API key.
   - Apply to **Production** (and Preview if you want to test the form on preview URLs).
4. **Deploy** (or redeploy after adding the env var).

---

## 3. Contact form and domain

The form sends a **POST** request to **`/api/contact`** (same origin). For that to work:

- The site must be served from the **same Vercel deployment** that hosts the API (so **www.invoiceoasis.com** should point to **Vercel**, not only to GitHub Pages).

**Option A – Use Vercel for the whole site (recommended)**  
- In Vercel: **Settings → Domains** → add **www.invoiceoasis.com** (and optionally **invoiceoasis.com**).  
- In GoDaddy (or your DNS): point **www** (CNAME) and, if you use it, **@** (A records) to Vercel as per Vercel’s instructions.  
- Then the live site and **/api/contact** are on the same origin and the form works with no extra config.

**Option B – Keep the site on GitHub Pages**  
- The form would need to call an absolute API URL (e.g. your Vercel deployment URL). That would require changing the frontend to use that URL and configuring CORS; the API already allows **https://www.invoiceoasis.com** in CORS.

---

## 4. What the API does

- **POST /api/contact**  
  - Body (JSON): `name`, `businessName`, `email`, `message` (optional), `demoRequested` (boolean).  
  - Sends one email via Resend:  
    - **From:** Invoice Intelligence &lt;noreply@invoiceoasis.com&gt;  
    - **To:** agent@openoaisis.com  
    - **CC:** chris@openoaisis.com  
    - **Reply-To:** submitter’s email  
    - **Subject:** Invoice Intelligence contact  
    - **Body:** plain text with name, business, email, message, demo requested, and timestamp.  
  - Returns **200** with `{ "ok": true, "id": "…" }` on success, or **4xx/5xx** with `{ "error": "…" }` on failure.

---

## 5. Troubleshooting

- **Form shows “Something went wrong”**  
  - **404** – The site is likely still on **GitHub Pages**. There is no `/api/contact` there, so the form POST fails. Point **www.invoiceoasis.com** to **Vercel** (Option A above) so the same deployment serves the site and the API.  
  - **500** – Confirm **RESEND_API_KEY** is set in Vercel (Production and/or Preview) and the project was **redeployed** after adding it. Confirm **invoiceoasis.com** is **verified** in Resend and the From address is **noreply@invoiceoasis.com**. Check **Vercel → Project → Logs** (or Deployments → Function logs) for `[contact] Resend error:` to see Resend’s message.
- **Form shows “Thank you” but no email arrived and nothing in Resend**  
  - **Confirm where the 200 came from:** Open DevTools → **Network**, submit the form again, click the **POST** request to `api/contact` and open **Response**.  
    - If you see JSON like `{ "ok": true, "id": "...", "source": "contact-api" }` → the response is from this API and Resend reported success. Then the API key in Vercel is for a **different Resend account** than the one you’re checking. Use the same Resend account that owns the API key (in Vercel → Settings → Environment Variables → RESEND_API_KEY), or create the key from the account you use in the dashboard.  
    - If you see **404**, **HTML**, or **different JSON** → the request did **not** hit this Vercel API (e.g. the site is still served from GitHub Pages, or the form is posting to another URL). Point the site’s domain to Vercel and ensure you’re on the deployment that has the `api/` folder.  
  - In **Vercel → Project → Logs** (or the deployment’s Function logs): look for `[contact] POST received` and `[contact] Resend sent id:`. If those lines never appear, the request is not reaching this Vercel project.  
  - Check **spam/junk** and **Resend → Emails** (correct account) and the **To** address **agent@openoaisis.com**.
- **CORS errors**  
  - The API allows **https://www.invoiceoasis.com** and **https://invoiceoasis.com**. If you use another origin (e.g. a preview URL), add it to the `allowed` list in **api/contact.js**.
- **404 on /api/contact**  
  - The request must go to the Vercel deployment that contains the **api/** folder (same repo, deployed on Vercel). If the site is only on GitHub Pages, use Option B above or switch to Option A.
