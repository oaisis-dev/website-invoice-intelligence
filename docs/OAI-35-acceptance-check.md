# OAI-35 Acceptance Check: Invoice Intelligence Landing Page with Conversion

**Linear issue:** [OAI-35 – feat(marketing): Build Invoice Intelligence landing page with conversion](https://linear.app/oaisis/issue/OAI-35/featmarketing-build-invoice-intelligence-landing-page-with-conversion)  
**Checked:** Current `build/` (served at `http://localhost:8765/`).  
**Note:** The Linear issue body was not accessible (login required). This checklist is based on the issue title and standard “landing page with conversion” criteria.

---

## Summary

| Category        | Status | Notes |
|----------------|--------|--------|
| Hero & value prop | ✅ Pass | Headline, subtext, dual CTAs, trust badges |
| Conversion (CTA + form) | ✅ Pass | “Book a Demo” opens modal; form validates and submits via mailto |
| Features | ✅ Pass | 6 feature cards, clear copy |
| Social proof | ✅ Pass | “800+ restaurants”, logos, testimonials, stats |
| Pricing | ✅ Pass | 3 tiers, monthly/annual toggle, “Book a Demo” / “Contact Sales” |
| FAQ | ✅ Pass | 5 accordion items |
| Legal & trust | ✅ Pass | Privacy, Terms, Accessibility modals |
| Nav & footer | ✅ Pass | Anchor links, mobile menu, footer links |
| Responsive / UX | ✅ Pass | Mobile menu, viewport meta, Tailwind breakpoints |
| Accessibility | ✅ Pass | Modals: focus trap, Escape, aria; form labels; role/aria on dialogs |

---

## 1. Hero & value proposition

- [x] **Clear headline** — “Every invoice. Instantly understood.” with gradient emphasis.
- [x] **Subhead** — AI capture, categorize, COGS, real-time (restaurant-focused).
- [x] **Primary CTA** — “Book a Demo” (hero and elsewhere).
- [x] **Secondary CTA** — “See How It Works” → `#how-it-works`.
- [x] **Trust / friction reducers** — “No credit card”, “Setup in 5 min”, “Cancel anytime”.
- [x] **Product preview** — Dashboard mock (COGS, invoices, alerts, trend, recent invoices).
- [x] **Audience badge** — “Built Exclusively for Restaurants”.

**Verdict:** ✅ Pass.

---

## 2. Conversion (CTAs + lead capture)

- [x] **Primary CTA** — “Book a Demo” in nav, hero, CTA section, pricing (Starter/Pro); CTA section button opens contact modal.
- [x] **Contact / demo modal** — `#contactModal` with form and success state.
- [x] **Form fields** — Name*, Business name*, Business email*, Message (optional), “Book a demo” confirmation checkbox.
- [x] **Validation** — Required fields and email format in `main.js`; errors shown; focus on first error.
- [x] **Submission** — `mailto:` to `agent@openoaisis.com` with CC `chris@openoaisis.com`, subject/body and timestamp; success view shown after submit.
- [x] **Footer Contact** — “Contact” opens same contact modal.

**Verdict:** ✅ Pass.

---

## 3. Features section

- [x] **Section id** — `#features` for nav.
- [x] **Headline** — “Everything you need, nothing you don’t”.
- [x] **Six features** — Instant Capture, Auto-Categorization, Live COGS Tracking, Price Alerts, Supplier Management, Accounting Sync; each with icon and short copy.

**Verdict:** ✅ Pass.

---

## 4. Social proof

- [x] **Logos / “Trusted by”** — “Trusted by 800+ restaurants” with Sweetgreen, Nobu, Dig Inn, Shake Shack, Blue Apron.
- [x] **Stats** — 2.4M+ invoices, $180M spend, 99.6% accuracy, &lt;30s processing.
- [x] **Testimonials** — Three quotes (Marco Rossi, Jessica Chen, David Williams) with names and roles.
- [x] **CTA social proof** — “Joined by 47 restaurants this week” with avatar stack.

**Verdict:** ✅ Pass.

---

## 5. How it works

- [x] **Section id** — `#how-it-works`.
- [x] **Three steps** — Upload → AI Extracts → See Your COGS; numbered (01–03), icons, short copy.

**Verdict:** ✅ Pass.

---

## 6. Pricing

- [x] **Section id** — `#pricing`.
- [x] **Tiers** — Starter ($49/mo or $39/mo annual), Pro ($129/$99, “Most Popular”), Enterprise (Custom).
- [x] **Billing toggle** — Monthly vs Annual with “Save 20%” on annual; `main.js` updates displayed prices.
- [x] **CTAs** — “Book a Demo” (Starter, Pro), “Contact Sales” (Enterprise).

**Verdict:** ✅ Pass.

---

## 7. FAQ

- [x] **Section id** — `#faq`.
- [x] **Accordion** — 5 questions; `toggleFaq()` in `main.js`; one open at a time.
- [x] **Topics** — Setup time, invoice formats, security, accounting integrations, cancellation.

**Verdict:** ✅ Pass.

---

## 8. Legal & trust

- [x] **Privacy Policy** — Modal, dated Feb 28, 2026; sections on collection, use, security, retention, third parties, rights, changes.
- [x] **Terms of Service** — Modal, same date; acceptance, service, responsibilities, billing, IP, liability, termination, governing law.
- [x] **Accessibility** — Modal; WCAG 2.2 AA, measures, assistive tech, limitations, feedback.
- [x] **Footer links** — Privacy, Terms, Accessibility open correct modals.

**Verdict:** ✅ Pass.

---

## 9. Nav & footer

- [x] **Nav** — Logo, Features, How It Works, Pricing, FAQ, “Get Started” (→ `#cta`).
- [x] **Mobile menu** — Hamburger; same links + “Get Started”; closes on link click.
- [x] **Footer** — Logo + tagline; Product (Features, How It Works, Pricing, FAQ); Company (About, Contact); Legal (Privacy, Terms, Accessibility); © 2026; Twitter, LinkedIn.

**Verdict:** ✅ Pass.

---

## 10. Responsive & technical

- [x] **Viewport** — `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
- [x] **Breakpoints** — `md:` / `lg:` used for layout (nav, grids, spacing).
- [x] **Assets** — With `build/assets/` symlinks (css, js, images), all references resolve when serving from `build/`.

**Verdict:** ✅ Pass.

---

## 11. Accessibility (modals & form)

- [x] **Modals** — `role="dialog"`, `aria-modal="true"`, `aria-labelledby`; focus moved to close button on open; focus trap on Tab; Escape closes; click-outside closes.
- [x] **Form** — `<label for="...">`; `aria-hidden="true"` on decorative `*`; error messages with `role="alert"`; required/email validation.
- [x] **Focus** — `previousFocus` restored on modal close.

**Verdict:** ✅ Pass.

---

## Build setup note

To run the build locally with correct assets, either:

1. **Use the symlinks** (already created): from repo root,  
   `cd build && mkdir -p assets/css assets/js assets/images && ln -sf ../../styles.css assets/css/styles.css && ln -sf ../../main.js assets/js/main.js && ln -sf ../../ii-lockup-color.svg assets/images/ii-lockup-color.svg`  
   Then serve `build/` (e.g. `python3 -m http.server 8765` from `build/`).

2. **Or** change `index.html` to reference `styles.css`, `main.js`, and `ii-lockup-color.svg` without the `assets/` path so serving from `build/` works without symlinks.

---

## Conclusion

The current build meets the expected acceptance criteria for a **landing page with conversion**: hero, features, social proof, pricing, FAQ, legal, and a working “Book a Demo” flow (modal + validated form → mailto). To confirm against the exact criteria in Linear, open [OAI-35](https://linear.app/oaisis/issue/OAI-35/featmarketing-build-invoice-intelligence-landing-page-with-conversion) while logged in and compare this checklist to the issue description and any sub-issues.
