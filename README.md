# website-invoice-intelligence
One-page website for Invoice Intelligence

Here is the production-ready file structure:

invoice-intelligence/
├── index.html                              (611 lines — markup + Tailwind config)
├── assets/
│   ├── css/
│   │   └── styles.css                      (263 lines — all custom styles)
│   ├── js/
│   │   └── main.js                         (157 lines — all application logic)
│   └── images/
│       └── ii-lockup-color.svg             (logo)

styles.css — All custom CSS (glass panels, modals, animations, form fields, scrollbar, etc.) pulled out of the inline <style> block.

main.js — All application JavaScript (navbar scroll, mobile menu, FAQ accordion, pricing toggle, modal system, contact form validation/submission) pulled out of the inline <script> block. Loaded with defer so the DOM is ready when it executes.

Logo — Both navbar and footer <img> tags now reference assets/images/ii-lockup-color.svg.

Secure protocols — All external resources (Google Fonts, Tailwind CDN) verified as https://. Added preconnect to fonts.gstatic.com with crossorigin for faster font delivery.

Production meta — Added meta description and an SVG favicon.

Tailwind config stays inline in <head> — this is required since the Tailwind CDN JIT compiler needs the config available before it processes utility classes.
