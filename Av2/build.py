#!/usr/bin/env python3
"""
Generates the static Allanese Medical Aesthetics prototype pages.
Run:  python3 build.py     (re-run after editing the content below)
Output: plain .html files next to this script — no build step needed to deploy.
Placeholders the clinic must confirm are marked with  TODO(clinic)  comments
and visible [To confirm] chips. See README.md / CONTENT-TO-CONFIRM.md.
"""
from pathlib import Path
OUT = Path(__file__).parent

# ---------------------------------------------------------------- icons (inline SVG, no external requests)
def icon(paths, size=22):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
            f'stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{paths}</svg>')
I = {
 "check":  icon('<path d="M20 6 9 17l-5-5"/>', 16),
 "chev":   icon('<path d="m6 9 6 6 6-6"/>', 20),
 "shield": icon('<path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z"/><path d="m9 11.5 2 2 4-4.5"/>'),
 "chat":   icon('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
 "plan":   icon('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>'),
 "lock":   icon('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
 "phone":  icon('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.13.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.25a2 2 0 0 1 2.1-.45c.9.34 1.84.57 2.8.7A2 2 0 0 1 22 16.9z"/>', 20),
 "mail":   icon('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>', 20),
 "pin":    icon('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>', 20),
 "clock":  icon('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>', 20),
 "cal":    icon('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>', 20),
 "ig":     icon('<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>', 19),
 "fb":     icon('<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>', 19),
}

# ---------------------------------------------------------------- content data
# TODO(clinic): replace this placeholder service list with the clinic's CONFIRMED
# services, descriptions and (if displayed) prices — Brief §9, §11.
SERVICES = [
 dict(slug="consultation", name="Skin Consultation & Assessment", img="skin-assessment.jpg",
      alt="Doctor reviewing a skin assessment with a patient holding a mirror",
      short="Every treatment begins with a private consultation — your skin, goals and medical suitability are assessed before anything is recommended.",
      desc="A one-to-one appointment to understand your concerns, examine your skin, and talk honestly about which options may or may not be suitable for you. You will receive a personalised plan, including costs and alternatives, with no obligation to proceed.",
      suitable=["New patients unsure where to start", "Anyone considering a clinic treatment for the first time", "Patients wanting a review of their current skin routine"],
      prep=["Arrive with a list of products and medications you currently use", "Note any allergies or past reactions to treatments", "Photos are only taken with your consent"],
      risks=["No treatment is performed at a consultation unless agreed and clinically appropriate", "Recommendations depend on your individual assessment — outcomes can never be guaranteed"]),
 dict(slug="facials", name="Signature Facial Treatments", img="treatment-facial.jpg",
      alt="Esthetician performing a facial treatment in a calm clinic room",
      short="Clinic-grade facials tailored to your skin on the day — cleansing, exfoliation and hydration delivered with medical oversight.",
      desc="Facial treatments are adapted at each visit based on how your skin presents. Your practitioner will explain each step, the products used, and what to expect afterwards, including any temporary redness.",
      suitable=["Dull, congested or dehydrated-feeling skin", "Maintenance between other treatments", "Patients preferring a gentle, non-invasive option"],
      prep=["Avoid strong exfoliating products for 48 hours before", "Tell us about any recent treatments or sunburn", "Arrive makeup-free if possible"],
      risks=["Temporary redness or sensitivity can occur", "Rarely, breakouts or irritation — aftercare advice is provided at your visit"]),
 dict(slug="rejuvenation", name="Skin Rejuvenation", img="skincare-detail.jpg",
      alt="Elegant unlabelled skincare bottles with gold caps on a marble tray",
      short="A personalised programme — which may include clinic peels or resurfacing-style treatments — planned around your skin and schedule.",
      desc="Rejuvenation plans are built gradually. After assessment, your practitioner explains the proposed treatment type, expected downtime, number of sessions typically involved, and the realistic range of outcomes before you decide.",
      suitable=["Uneven tone or texture concerns", "Fine lines and tired-looking skin", "Patients able to follow a structured aftercare routine"],
      prep=["Sun protection and product-use instructions are given in advance", "Some treatments require pausing active skincare — you will be advised", "Plan around important events where downtime may apply"],
      risks=["Redness, peeling or sensitivity depending on treatment depth", "Pigment changes are possible, particularly with sun exposure — strict SPF aftercare matters"]),
 dict(slug="injectables", name="Injectables Consultation", img="consultation.jpg",
      alt="Doctor in consultation with a patient at an elegant clinic desk",
      short="A consultation to discuss injectable options, suitability, risks and alternatives. Treatment is only offered where clinically appropriate.",
      desc="Some injectable treatments involve prescription-only medicines and are discussed and provided only after a full medical assessment, in line with applicable regulations. Your consultation covers expected effects, longevity, risks, costs and non-injectable alternatives, so you can decide without pressure.",
      suitable=["Adults who have completed a medical assessment", "Patients seeking a natural, measured approach", "Those wanting risks and alternatives explained first"],
      prep=["Bring details of medications, allergies and previous treatments", "Avoid booking immediately before major events", "You will be asked about pregnancy, breastfeeding and relevant medical history"],
      risks=["Bruising, swelling, asymmetry or tenderness can occur", "Less common risks — including vascular events with fillers — are explained in full during consultation"]),
 dict(slug="laser", name="Laser & Light Treatments", img="treatment-laser.jpg",
      alt="Patient wearing protective eyewear during a laser skin treatment",
      short="Device-based treatments for concerns assessed at consultation. A patch test and treatment plan are arranged where required.",
      desc="Laser and light technologies differ by concern and skin type. Your practitioner will confirm whether a device treatment is appropriate for you, arrange a patch test where required, and explain session spacing, sensations during treatment and aftercare.",
      suitable=["Concerns confirmed suitable for device treatment at assessment", "Patients who can avoid tanning before and after sessions", "Those able to attend a course of spaced appointments"],
      prep=["Avoid sun exposure and fake tan as advised before treatment", "Tell us about recent medications that increase light sensitivity", "A patch test may be required before a full session"],
      risks=["Temporary redness, warmth or swelling after treatment", "Pigment changes or blistering are uncommon but possible — aftercare reduces risk"]),
 dict(slug="body", name="Body Contouring Consultation", img="treatment-room.jpg",
      alt="Premium treatment room with treatment bed and modern aesthetic device",
      short="A consultation about non-surgical body treatment options, realistic expectations, and whether treatment is right for you at all.",
      desc="Non-surgical body treatments are not weight-loss treatments and are not suitable for everyone. Your consultation covers how the technology works, the areas it can address, the number of sessions typically involved, and lifestyle factors that influence results.",
      suitable=["Adults at a stable weight seeking targeted treatment areas", "Patients with realistic, gradual expectations", "Those assessed as suitable after medical screening"],
      prep=["You will be asked about relevant medical history and implants", "Wear comfortable clothing for assessment", "Measurements or photos only with your consent"],
      risks=["Temporary numbness, redness, bruising or swelling can occur", "Results vary between individuals and cannot be guaranteed"]),
]

FAQS = [
 ("How do I book an appointment?",
  "Use the appointment request form, or contact the clinic by phone or email. Your appointment is only confirmed once the clinic team replies to confirm a date and time — submitting the form alone does not guarantee a slot."),
 ("What happens at my first visit?",
  "Your first visit is a consultation. We discuss your concerns, assess your skin, review relevant medical history, and explain suitable options — including risks, costs and alternatives. There is no obligation to proceed with treatment."),
 ("Do I need a consultation before treatment?",
  "Yes. Suitability, risks and expected outcomes vary from person to person, so treatments are only recommended after an individual assessment. Some treatments also require a patch test first."),
 ("Will I be told the price before treatment?",
  "Yes. Costs — and how many sessions may be involved — are discussed at your consultation before you decide. Prices on this prototype website are not shown until the clinic confirms them."),
 ("What should I do before my appointment?",
  "Bring a list of medications and products you use, and note any allergies or previous treatments. Specific preparation (for example, pausing certain skincare or avoiding sun exposure) depends on the treatment and will be explained when you book."),
 ("Are results guaranteed?",
  "No aesthetic treatment can guarantee a particular result. Your practitioner will explain the realistic range of outcomes, how many sessions are typically involved, and what aftercare is needed, so you can make an informed decision."),
 ("What are the risks?",
  "Risks depend on the treatment and can include temporary redness, swelling, bruising, sensitivity or pigment changes, among others. All relevant risks — including uncommon ones — are explained during your consultation, and you will have the opportunity to ask questions before consenting."),
 ("How is my personal information handled?",
  "The appointment form only asks for the details needed to respond to your request. Please do not send medical histories, diagnoses or photos through the form. See our Privacy Policy for what is collected, why, and who can access it."),
 ("Where is the clinic, and when is it open?",
  "The clinic's confirmed address and opening hours will be published here. [To confirm — see the Contact page.]"),
]

NAV = [("Home","index.html"),("Services","services.html"),("About","about.html"),
       ("Team","team.html"),("Gallery","gallery.html"),("FAQs","faqs.html"),("Contact","contact.html")]

def header(current):
    links = "".join(
        f'<li><a href="{href}"{chr(32) + "aria-current=" + chr(34) + "page" + chr(34) if href == current else ""}>{label}</a></li>'
        for label, href in NAV)
    return f"""
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="index.html" aria-label="Allanese Medical Aesthetics — home">
      <img class="brand-logo" src="assets/images/logo.png" alt="" width="512" height="512">
    </a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="main-nav">☰ Menu</button>
    <nav class="main-nav" id="main-nav" aria-label="Main navigation"><ul>{links}</ul></nav>
    <a class="btn btn-dark header-cta" href="book.html">Book Now</a>
  </div>
</header>"""

def footer():
    svc = "".join(f'<li><a href="services.html#{s["slug"]}">{s["name"]}</a></li>' for s in SERVICES)
    return f"""
<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <span class="footer-brand"><img class="footer-logo" src="assets/images/logo.png" alt="" width="512" height="512"><span><span class="brand-name" style="font-family:var(--font-display);font-size:1.25rem;letter-spacing:.14em">ALLANESE</span>
      <span class="brand-sub" style="display:block">Medical Aesthetics</span></span></span>
      <!-- TODO(clinic): confirm clinic city/location wording (Brief §9) -->
      <a class="location-pill" href="contact.html">{I['pin']} Philippines — clinic location to confirm</a>
    </div>
    <div class="footer-grid">
      <div><h3>About Us</h3><ul>
        <li><a href="about.html">Our Clinic</a></li>
        <li><a href="team.html">Our Team</a></li>
        <li><a href="gallery.html">Gallery</a></li>
        <li><a href="services.html">Treatments</a></li>
      </ul></div>
      <div><h3>Need Help?</h3><ul>
        <li><a href="faqs.html">FAQs</a></li>
        <li><a href="contact.html">Contact Us</a></li>
        <li><a href="book.html">Book an Appointment</a></li>
      </ul></div>
      <div><h3>Services</h3><ul>{svc}</ul></div>
      <div><h3>Contact</h3><ul>
        <!-- TODO(clinic): confirm address, phone, email, hours (Brief §9) -->
        <li>Clinic street address, City <span class="to-confirm">To confirm</span></li>
        <li><a href="tel:+000000000000">(000) 0000 0000</a> <span class="to-confirm">To confirm</span></li>
        <li><a href="mailto:bookings@example.com">bookings@example.com</a> <span class="to-confirm">To confirm</span></li>
        <li>Opening hours <span class="to-confirm">To confirm</span></li>
      </ul>
        <!-- TODO(clinic): replace # with official social profile URLs (Brief §9) -->
        <div class="socials">
          <a href="#" aria-label="Allanese on Facebook (link to confirm)">{I['fb']}</a>
          <a href="#" aria-label="Allanese on Instagram (link to confirm)">{I['ig']}</a>
        </div>
      </div>
    </div>
    <div class="footer-bar">
      <p class="footer-disclaimer"><strong>General information only.</strong> Content on this website does not replace medical advice. Suitability, risks, expected outcomes and costs are discussed during an individual consultation; individual results vary and cannot be guaranteed.</p>
      <p><a href="privacy.html">Privacy Policy</a> · Prototype website concept — services and details subject to clinic confirmation.</p>
      <p class="footer-copy">© <span data-year>2026</span> Allanese Medical Aesthetics. All rights reserved.</p>
    </div>
  </div>
</footer>
<script src="assets/js/main.js" defer></script>
</body></html>"""

def page(fname, title, desc, body):
    full = f"Allanese Medical Aesthetics — Consultation-First Aesthetic Care" if fname == "index.html" else f"{title} | Allanese Medical Aesthetics"
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{full}</title>
<meta name="description" content="{desc}">
<!-- TODO(clinic): add canonical URL + social preview image at launch (Brief §10) -->
<meta property="og:title" content="{full}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:image" content="assets/images/hero-clinic.jpg">
<meta name="theme-color" content="#d3c0f0">
<link rel="icon" type="image/png" sizes="512x512" href="assets/favicon.png">
<link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="assets/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/styles.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
{header(fname)}
<main id="main">{body}</main>
{footer()}"""
    (OUT / fname).write_text(html, encoding="utf-8")
    print("built", fname)

def page_hero(eyebrow, title, lead):
    return f"""
<section class="page-hero"><div class="container"><div class="page-hero-card">
  <p class="breadcrumb"><a href="index.html">Home</a> &nbsp;/&nbsp; {title}</p>
  <span class="eyebrow">{eyebrow}</span><h1 class="ui-title">{title}</h1><p class="lead">{lead}</p>
</div></div></section>"""

def service_card(s):
    return f"""
<article class="service-card reveal">
  <div class="service-media"><img src="assets/images/{s['img']}" alt="{s['alt']}" loading="lazy"></div>
  <div class="service-body"><h3>{s['name']}</h3><p>{s['short']}</p>
  <a class="text-link" href="services.html#{s['slug']}">Learn more <span aria-hidden="true">→</span></a></div>
</article>"""

def appointment_form(p):
    opts = '<option value="" disabled selected>Select a service…</option>' + "".join(
        f'<option value="{s["slug"]}">{s["name"]}</option>' for s in SERVICES) + \
        '<option value="not-sure">Not sure — I would like advice at a consultation</option>'
    return f"""
<form class="appointment-form" novalidate>
  <p class="demo-notice"><strong>Demo form:</strong> this prototype does not send or store your request yet. Before launch it will be connected to the clinic's booking system. Please do not enter medical histories, diagnoses or photos here.</p>
  <div class="form-grid">
    <div class="field"><label for="{p}-name">Full name *</label>
      <input id="{p}-name" name="full_name" type="text" autocomplete="name" required>
      <span class="field-error" data-error-for="{p}-name" role="alert"></span></div>
    <div class="field"><label for="{p}-phone">Contact number *</label>
      <input id="{p}-phone" name="phone" type="tel" autocomplete="tel" required placeholder="e.g. 09XX XXX XXXX">
      <span class="field-error" data-error-for="{p}-phone" role="alert"></span></div>
    <div class="field full"><label for="{p}-email">Email <span class="hint">(optional)</span></label>
      <input id="{p}-email" name="email" type="email" autocomplete="email">
      <span class="field-error" data-error-for="{p}-email" role="alert"></span></div>
    <div class="field full"><label for="{p}-service">Service of interest *</label>
      <select id="{p}-service" name="service" required>{opts}</select>
      <span class="field-error" data-error-for="{p}-service" role="alert"></span></div>
    <div class="field"><label for="{p}-date">Preferred date *</label>
      <input id="{p}-date" name="preferred_date" type="date" required>
      <span class="field-error" data-error-for="{p}-date" role="alert"></span></div>
    <div class="field"><label for="{p}-time">Preferred time *</label>
      <select id="{p}-time" name="preferred_time" required>
        <option value="" disabled selected>Select…</option>
        <option>Morning</option><option>Midday</option><option>Afternoon</option><option>Evening</option>
      </select>
      <span class="field-error" data-error-for="{p}-time" role="alert"></span></div>
    <div class="field full"><label for="{p}-msg">Message <span class="hint">(optional — please keep it non-sensitive; do not include medical details)</span></label>
      <textarea id="{p}-msg" name="message" rows="4" maxlength="500" placeholder="Anything that helps us prepare for your call?"></textarea></div>
    <div class="field full">
      <label class="checkbox"><input id="{p}-consent" name="consent" type="checkbox" required>
      <span>I agree to be contacted about this appointment request, as described in the <a href="privacy.html">Privacy Policy</a>. *</span></label>
      <span class="field-error" data-error-for="{p}-consent" role="alert"></span></div>
  </div>
  <p style="margin-top:1.3rem"><button class="btn btn-purple" type="submit">Request Appointment</button></p>
  <p class="hint">Submitting a request does not confirm an appointment — the clinic team will contact you to confirm.</p>
  <div class="form-status" role="status" aria-live="polite"></div>
</form>"""

def contact_info_cards():
    return f"""
<div class="info-card"><h3>Visit or contact us</h3>
  <!-- TODO(clinic): confirm all contact details and map pin (Brief §9) -->
  <ul class="info-list">
    <li>{I['pin']}<span><strong>Address</strong>Clinic street address, City <span class="to-confirm">To confirm</span></span></li>
    <li>{I['phone']}<span><strong>Phone</strong><a href="tel:+000000000000">(000) 0000 0000</a> <span class="to-confirm">To confirm</span></span></li>
    <li>{I['mail']}<span><strong>Email</strong><a href="mailto:bookings@example.com">bookings@example.com</a> <span class="to-confirm">To confirm</span></span></li>
    <li>{I['clock']}<span><strong>Opening hours</strong>Mon–Sat, by appointment <span class="to-confirm">To confirm</span></span></li>
  </ul></div>
<div class="info-card"><h3>How booking works</h3>
  <ol style="margin:.4rem 0 0;padding-left:1.2rem;color:var(--muted)">
    <li>Send an appointment request (form, phone or email).</li>
    <li>The clinic team contacts you to confirm a date and time.</li>
    <li>Your first visit is a consultation — assessment, options, risks and costs, with no obligation to proceed.</li>
  </ol></div>"""

# ---------------------------------------------------------------- HOME (Brief §6 order)
trust = [
 ("chat", "Consultation-first", "Every plan starts with a private assessment of your skin, goals and suitability — before any treatment is recommended."),
 ("plan", "Personalised plans", "Recommendations, session counts and costs are tailored to you and explained in writing at your consultation."),
 ("shield", "Risks, honestly explained", "Benefits, limitations, downtime and risks — including uncommon ones — are discussed before you consent to anything."),
 ("lock", "Privacy respected", "We collect only the details needed to respond to your request. No medical details are asked for through this website's form."),
]
home = f"""
<!-- Hero carousel: wide rounded banner cards, neighbours peeking (UI refresh) -->
<section class="carousel" aria-roledescription="carousel" aria-label="Featured">
  <div class="carousel-viewport">
    <div class="carousel-track">
      <article class="slide" role="group" aria-roledescription="slide" aria-label="1 of 3">
        <div class="slide-text">
          <span class="eyebrow hero-anim">Allanese Medical Aesthetics</span>
          <h1 class="slide-title ui-title hero-anim d1">Refined aesthetic care, tailored to your skin</h1>
          <p class="hero-anim d2">A consultation-first clinic experience — considered assessment, a personalised plan, and honest guidance on what each treatment can and cannot do.</p>
          <p class="hero-anim d2"><a class="btn btn-dark btn-wide" href="book.html">Book an Appointment</a></p>
        </div>
        <div class="slide-media">
          <!-- TODO(clinic): replace with approved clinic photography (Brief §10, §11) -->
          <img src="assets/images/hero-clinic.jpg" alt="Elegant clinic reception with pastel lavender walls, gold trim and a marble desk" fetchpriority="high">
        </div>
      </article>
      <article class="slide" role="group" aria-roledescription="slide" aria-label="2 of 3">
        <div class="slide-text">
          <span class="eyebrow">Treatments</span>
          <h2 class="slide-title ui-title">Signature facials, tailored on the day</h2>
          <p>Clinic-grade facial treatments adapted to how your skin presents at every visit — explained step by step, with aftercare included.</p>
          <p><a class="btn btn-outline btn-wide" href="services.html#facials">Explore Treatments</a></p>
        </div>
        <div class="slide-media"><img src="assets/images/treatment-facial.jpg" alt="Esthetician in a pastel lavender uniform performing a facial treatment" loading="lazy"></div>
      </article>
      <article class="slide" role="group" aria-roledescription="slide" aria-label="3 of 3">
        <div class="slide-text">
          <span class="eyebrow">Consultation-first</span>
          <h2 class="slide-title ui-title">Start with a conversation, not a treatment</h2>
          <p>Risks, downtime, session counts and costs — discussed honestly at your consultation, with no obligation to proceed.</p>
          <p><a class="btn btn-dark btn-wide" href="book.html">Book a Consultation</a></p>
        </div>
        <div class="slide-media"><img src="assets/images/consultation.jpg" alt="Doctor in a warm one-to-one consultation with a patient" loading="lazy"></div>
      </article>
    </div>
  </div>
  <div class="carousel-controls">
    <button class="carousel-arrow" type="button" data-carousel-prev aria-label="Previous slide">&lsaquo;</button>
    <div class="carousel-dots">
      <button class="carousel-dot" type="button" data-carousel-dot="0" aria-label="Go to slide 1" aria-current="true"></button>
      <button class="carousel-dot" type="button" data-carousel-dot="1" aria-label="Go to slide 2"></button>
      <button class="carousel-dot" type="button" data-carousel-dot="2" aria-label="Go to slide 3"></button>
    </div>
    <button class="carousel-arrow" type="button" data-carousel-next aria-label="Next slide">&rsaquo;</button>
  </div>
</section>

<!-- 4. Trust highlights (approach commitments only — no unverified claims, Brief §6) -->
<section class="section" style="padding-top:2.6rem"><div class="container">
  <div class="section-head reveal"><h2 class="ui-title">Care You Can Trust</h2></div>
  <div class="trust-grid" data-stagger>
    {''.join(f'<div class="trust-item reveal"><div class="icon">{I[i]}</div><h3>{t}</h3><p>{d}</p></div>' for i,t,d in trust)}
  </div>
</div></section>

<!-- 5. Services -->
<section class="section section--white"><div class="container">
  <div class="section-head reveal">
    <h2 class="ui-title">Explore Our Treatments</h2>
    <p class="lead">Suitability is always confirmed at consultation — if a treatment isn't right for you, we'll say so.</p></div>
  <div class="card-grid" data-stagger>{''.join(service_card(s) for s in SERVICES)}</div>
  <p style="text-align:center;margin-top:2.2rem" class="reveal"><a class="btn btn-outline btn-wide" href="services.html">View All</a></p>
</div></section>

<!-- 6. About / care approach — split feature (rounded image card + text + wide outline pill) -->
<section class="section"><div class="container">
  <div class="section-head reveal"><h2 class="ui-title">The Allanese Approach</h2></div>
  <div class="split">
  <img class="reveal feature-img" src="assets/images/skin-assessment.jpg" alt="Doctor reviewing a skin assessment with a patient holding a mirror" loading="lazy">
  <div class="reveal">
    <h3 class="feature-title">Considered care, from first consultation to aftercare</h3>
    <p class="lead">Good aesthetic outcomes start long before treatment — with listening, assessment and a plan you understand.</p>
    <ol class="steps">
      <li><span><strong>Consult</strong><p>Tell us your concerns in a private, unhurried appointment.</p></span></li>
      <li><span><strong>Assess</strong><p>Your skin, medical history and suitability are carefully reviewed.</p></span></li>
      <li><span><strong>Plan</strong><p>Options, risks, downtime, session counts and costs — explained before you decide.</p></span></li>
      <li><span><strong>Review</strong><p>Aftercare guidance and follow-up, so you know what to expect at every stage.</p></span></li>
    </ol>
    <p style="margin-top:1.6rem"><a class="btn btn-outline btn-wide" href="about.html">Learn More</a></p>
  </div>
  </div>
</div></section>

<!-- 7. Facilities / team teaser -->
<section class="section section--purple"><div class="container split">
  <div class="reveal"><span class="eyebrow">The clinic</span>
    <h2>A calm, private space designed around your comfort</h2>
    <p style="color:var(--purple-900)">From reception to treatment room, every detail is considered — unhurried appointments, private consultations, and a team who will always explain before they recommend.</p>
    <p style="display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.4rem">
      <a class="btn btn-gold" href="gallery.html">View the Gallery</a>
      <a class="btn btn-light" href="team.html">Meet the Team</a></p></div>
  <img class="reveal" src="assets/images/treatment-room.jpg" alt="Serene treatment room with cream bed and pastel lavender and gold wall panels" loading="lazy">
</div></section>

<!-- 8. Appointment request -->
<section class="section section--white"><div class="container">
  <div class="section-head reveal"><span class="eyebrow">Appointments</span>
    <h2 class="ui-title">Request an Appointment</h2>
    <p class="lead">Tell us what you're interested in and when suits you — the clinic team will contact you to confirm.</p></div>
  <div class="booking-grid">
    <div class="reveal">{contact_info_cards()}</div>
    <div class="form-card reveal">{appointment_form('home')}</div>
  </div>
</div></section>"""
page("index.html", "Home",
     "Allanese Medical Aesthetics — consultation-first aesthetic care. Explore treatments, meet the clinic, and request an appointment.", home)

# ---------------------------------------------------------------- SERVICES
def service_detail(s):
    lis = lambda items: "".join(f"<li>{x}</li>" for x in items)
    return f"""
<article class="service-detail reveal" id="{s['slug']}">
  <div class="service-media"><img src="assets/images/{s['img']}" alt="{s['alt']}" loading="lazy"></div>
  <div><h2>{s['name']}</h2><p>{s['desc']}</p>
    <div class="detail-cols">
      <div class="detail-box"><h4>May be suitable if…</h4><ul>{lis(s['suitable'])}</ul></div>
      <div class="detail-box"><h4>Before your visit</h4><ul>{lis(s['prep'])}</ul></div>
    </div>
    <div class="detail-box" style="margin-bottom:1.3rem"><h4>Risks &amp; important information</h4><ul>{lis(s['risks'])}<li>Full risks, expected outcomes, alternatives and costs are discussed at your consultation. Individual results vary.</li></ul></div>
    <a class="btn btn-purple" href="book.html?service={s['slug']}">Request a Consultation</a>
  </div>
</article>"""

services_body = page_hero("Treatments", "Services & Treatments",
    "Each treatment area below explains what it involves, who it may suit, how to prepare, and the risks to consider. Suitability is only confirmed after an individual consultation.") + f"""
<section class="section" style="padding-top:1rem"><div class="container">
  <!-- TODO(clinic): confirm final service list, wording and any prices before launch (Brief §9, §10) -->
  {''.join(service_detail(s) for s in SERVICES)}
</div></section>
<section class="section section--purple"><div class="container cta-band reveal">
  <h2>Not sure which treatment you need?</h2>
  <p class="lead">Most patients aren't — that's what the consultation is for. Book one, and we'll talk it through together.</p>
  <p style="margin-top:1.4rem"><a class="btn btn-gold" href="book.html">Book a Consultation</a></p>
</div></section>"""
page("services.html", "Services & Treatments",
     "Allanese Medical Aesthetics services — consultations, facials, rejuvenation, injectables consultation, laser and body treatments, with suitability, preparation and risks explained.", services_body)

# ---------------------------------------------------------------- ABOUT
about = page_hero("About", "About the Clinic",
    "Allanese Medical Aesthetics was created around a simple belief: aesthetic care should begin with listening — and every recommendation should be explainable.") + f"""
<section class="section"><div class="container split">
  <div class="reveal"><span class="eyebrow">Our story</span><h2>A calmer, more considered clinic experience</h2>
    <!-- TODO(clinic): replace with the clinic's approved background/story (Brief §9) -->
    <p>Our approach pairs clinical care with a serene, private setting. Appointments are unhurried, questions are welcome, and "not yet" — or "not suitable" — is always an acceptable answer from us.</p>
    <p>We build plans gradually and review them with you, rather than promising dramatic change. If a treatment isn't right for your skin, your health, or your goals, we will explain why and discuss alternatives — including doing nothing at all.</p>
    <p style="margin-top:1.4rem"><a class="btn btn-purple" href="book.html">Request an Appointment</a></p></div>
  <img class="reveal" src="assets/images/skin-assessment.jpg" alt="Doctor reviewing a skin assessment on a tablet with a patient" loading="lazy">
</div></section>
<section class="section section--white"><div class="container">
  <div class="section-head reveal"><span class="eyebrow">What guides us</span><h2>Our care principles</h2></div>
  <div class="trust-grid" data-stagger>
    {''.join(f'<div class="trust-item reveal"><div class="icon">{I[i]}</div><h3>{t}</h3><p>{d}</p></div>' for i,t,d in trust)}
  </div>
</div></section>
<section class="section"><div class="container split">
  <img class="reveal" src="assets/images/hero-clinic.jpg" alt="Clinic reception with purple feature wall and marble desk" loading="lazy">
  <div class="reveal"><span class="eyebrow">Facilities</span><h2>Designed for privacy and comfort</h2>
    <p>Private consultation and treatment rooms, considered lighting, and space to take your time. Browse the gallery for a look inside — and meet the people who will look after you.</p>
    <p style="display:flex;gap:.8rem;flex-wrap:wrap;margin-top:1.3rem">
      <a class="btn btn-gold" href="gallery.html">View the Gallery</a>
      <a class="btn btn-outline" href="team.html">Meet the Team</a></p></div>
</div></section>"""
page("about.html", "About the Clinic",
     "About Allanese Medical Aesthetics — a consultation-first clinic built on listening, honest assessment and personalised care.", about)

# ---------------------------------------------------------------- TEAM
team_card = lambda init, role: f"""
<article class="team-card reveal">
  <!-- TODO(clinic): replace with approved photo, name and VERIFIED credentials before launch (Brief §4, §9, §10) -->
  <div class="avatar" aria-hidden="true">{init}</div>
  <h3>{role}</h3>
  <p><span class="to-confirm">Name &amp; photo to confirm</span></p>
  <p>Verified qualifications and credentials will be published here once confirmed by the clinic. No credentials are claimed on this page until then.</p>
</article>"""
team = page_hero("Doctors & Team", "Meet the Team",
    "The people behind your care. Profiles below are placeholders — names, photos and verified qualifications will be added once confirmed by the clinic.") + f"""
<section class="section"><div class="container">
  <div class="card-grid" data-stagger>
    {team_card('Dr', 'Medical Director / Doctor')}
    {team_card('A', 'Aesthetic Practitioner')}
    {team_card('C', 'Clinic Coordinator')}
  </div>
  <div class="section-head reveal" style="margin-top:3.5rem"><span class="eyebrow">Standards</span>
    <h2>How we work</h2>
    <p class="lead">Treatments are recommended only after assessment, delivered only by appropriately qualified practitioners, and reviewed with you at follow-up. If we can't help, we'll tell you — and where possible, point you in the right direction.</p>
    <p style="margin-top:1.2rem"><a class="btn btn-purple" href="book.html">Book a Consultation</a></p></div>
</div></section>"""
page("team.html", "Doctors & Team",
     "Meet the Allanese Medical Aesthetics team — practitioner profiles and verified credentials to be confirmed by the clinic.", team)

# ---------------------------------------------------------------- GALLERY
GALLERY = [
 ("hero-clinic.jpg", "Clinic reception with purple feature wall and marble desk", "Reception — a calm welcome from the moment you arrive."),
 ("treatment-room.jpg", "Private treatment room with treatment bed and aesthetic device", "Private treatment rooms, designed for comfort."),
 ("consultation.jpg", "Doctor consulting with a patient at an elegant desk", "Consultations are private and unhurried."),
 ("treatment-facial.jpg", "Esthetician performing a facial treatment", "Signature facial treatments, tailored on the day."),
 ("treatment-laser.jpg", "Laser treatment being performed with protective eyewear", "Device-based treatments, assessed and patch-tested where required."),
 ("skin-assessment.jpg", "Skin assessment reviewed on a tablet", "Assessment first — every plan starts with your skin."),
 ("skincare-detail.jpg", "Unlabelled skincare bottles with gold caps beside an orchid", "Home care guidance is part of every treatment plan."),
]
gallery = page_hero("Gallery", "Inside the Clinic",
    "A look at our spaces and treatments. Before-and-after photographs are only ever shared with a patient's informed permission, so none are shown on this prototype.") + f"""
<section class="section"><div class="container">
  <!-- TODO(clinic): replace all images with approved clinic photography; before/afters only with consent + safeguards (Brief §4, §10) -->
  <div class="gallery-grid" data-stagger>
    {''.join(f'<button class="gallery-item reveal" type="button" aria-label="Enlarge photo: {c}"><span class="service-media" style="display:block"><img src="assets/images/{f}" alt="{a}" loading="lazy"></span><figcaption style="display:block">{c}</figcaption></button>' for f,a,c in GALLERY)}
  </div>
  <p class="reveal" style="text-align:center;margin-top:2.4rem"><a class="btn btn-purple" href="book.html">Visit Us — Book a Consultation</a></p>
</div></section>
<dialog class="lightbox" aria-label="Enlarged gallery photo">
  <button class="lightbox-close" aria-label="Close photo">✕</button>
  <figure><img src="" alt=""><figcaption></figcaption></figure>
</dialog>"""
page("gallery.html", "Gallery",
     "Inside Allanese Medical Aesthetics — reception, consultation and treatment rooms. Prototype imagery to be replaced with approved clinic photography.", gallery)

# ---------------------------------------------------------------- BOOK
book = page_hero("Appointments", "Request an Appointment",
    "Send a request and the clinic team will contact you to confirm. Your first appointment is a consultation — assessment and advice, with no obligation to proceed.") + f"""
<section class="section"><div class="container booking-grid">
  <div class="reveal">{contact_info_cards()}
    <div class="info-card"><h3>Before you request</h3>
      <p style="color:var(--muted);font-size:.95rem;margin:0">Please don't include medical histories, diagnoses, prescriptions or photos in the form — those are discussed privately at your consultation, if relevant. Appointments are confirmed by the clinic team; submitting the form doesn't reserve a slot.</p></div></div>
  <div class="form-card reveal">{appointment_form('book')}</div>
</div></section>"""
page("book.html", "Book an Appointment",
     "Request an appointment at Allanese Medical Aesthetics. The clinic team will contact you to confirm your consultation.", book)

# ---------------------------------------------------------------- FAQS
def faq_items(items):
    out = []
    for n, (q, a) in enumerate(items, 1):
        out.append(f"""
<div class="faq-item reveal">
  <h3 style="margin:0"><button class="faq-q" id="faq-q{n}" aria-expanded="false" aria-controls="faq-a{n}">{q}<span class="chev">{I['chev']}</span></button></h3>
  <div class="faq-a" id="faq-a{n}" role="region" aria-labelledby="faq-q{n}" hidden><p>{a}</p></div>
</div>""")
    return "".join(out)

faqs = page_hero("Help", "Frequently Asked Questions",
    "Bookings, first visits, preparation, risks and privacy — the questions patients ask us most.") + f"""
<section class="section"><div class="container">
  <div class="faq-list" data-stagger>{faq_items(FAQS)}</div>
  <div class="section-head reveal" style="margin-top:3rem"><span class="eyebrow">Still unsure?</span>
    <h2>Ask us at a consultation</h2>
    <p class="lead">A consultation is the best place for advice about your own skin. Request one — there's no obligation to proceed with treatment.</p>
    <p style="margin-top:1.2rem"><a class="btn btn-purple" href="book.html">Request an Appointment</a></p></div>
</div></section>"""
page("faqs.html", "FAQs",
     "Frequently asked questions about booking, consultations, preparation, risks and privacy at Allanese Medical Aesthetics.", faqs)

# ---------------------------------------------------------------- CONTACT
contact = page_hero("Contact", "Contact & Location",
    "Reach the clinic by phone, email or the appointment form — or visit us in person once your appointment is confirmed.") + f"""
<section class="section"><div class="container booking-grid">
  <div class="reveal">{contact_info_cards()}</div>
  <div class="reveal">
    <!-- TODO(clinic): embed Google Maps once the official map pin is confirmed (Brief §4, §9) -->
    <div class="info-card" style="text-align:center;padding:3rem 2rem">
      <div style="color:var(--gold-600);display:flex;justify-content:center;margin-bottom:1rem">{I['pin']}</div>
      <h3>Map &amp; directions</h3>
      <p style="color:var(--muted)">A Google Maps embed and directions will appear here once the clinic's confirmed address and map pin are added. <span class="to-confirm">To confirm</span></p>
      <p style="margin-top:1.2rem"><a class="btn btn-purple" href="book.html">Request an Appointment</a></p>
    </div>
  </div>
</div></section>"""
page("contact.html", "Contact & Location",
     "Contact Allanese Medical Aesthetics — phone, email, opening hours and location (details to be confirmed by the clinic).", contact)

# ---------------------------------------------------------------- PRIVACY
privacy = page_hero("Legal", "Privacy Policy",
    "What personal information this website collects, why, who can access it, and how to contact us about it.") + """
<section class="section"><div class="container" style="max-width:52rem">
  <!-- TODO(clinic): this template must be reviewed and approved with the clinic's final
       wording, privacy contact and applicable law before launch (Brief §4, §9, §10). -->
  <p class="demo-notice reveal"><strong>Template notice:</strong> this policy is a starting template for the prototype and must be replaced with clinic-approved wording before launch. The prototype appointment form currently does not transmit or store any information.</p>
  <div class="reveal">
  <h2>1. Who we are</h2>
  <p>Allanese Medical Aesthetics ("the clinic", "we", "us"). Official clinic name, address and privacy contact: <span class="to-confirm">To confirm</span></p>
  <h2>2. What we collect through this website</h2>
  <p>When the booking workflow is live, the appointment request form will collect only: your name, contact number, optional email, the service you're interested in, your preferred date/time, and an optional short message. The form is not for medical information — please never send diagnoses, medical histories, prescriptions or photos through it.</p>
  <h2>3. Why we collect it</h2>
  <p>Solely to respond to your appointment request, contact you to confirm or rearrange an appointment, and keep the minimal records needed to manage bookings. We do not sell personal information.</p>
  <h2>4. Who can access it</h2>
  <p>Only authorised clinic staff who need it to manage your booking. If a third-party booking or email provider is used, it will be named here, together with how it processes data on our behalf. <span class="to-confirm">Provider to confirm</span></p>
  <h2>5. How long we keep it</h2>
  <p>Appointment enquiries are kept only as long as needed to respond and manage bookings, then deleted or anonymised. Clinical records, if you become a patient, are held separately under the clinic's clinical record-keeping and retention policies — not through this website. <span class="to-confirm">Retention periods to confirm</span></p>
  <h2>6. Your choices and rights</h2>
  <p>You may ask what personal information we hold about you, request corrections, or ask for deletion where applicable law allows. Contact the clinic's privacy contact to make a request. <span class="to-confirm">Privacy contact to confirm</span></p>
  <h2>7. Cookies and analytics</h2>
  <p>This prototype does not use tracking cookies. If analytics or embedded maps/social feeds are added at launch, the cookies they set will be listed here, with consent controls where required.</p>
  <h2>8. Changes to this policy</h2>
  <p>If this policy changes, the updated version will be published on this page with its effective date. Effective date: <span class="to-confirm">To confirm</span></p>
  </div>
</div></section>"""
page("privacy.html", "Privacy Policy",
     "Allanese Medical Aesthetics privacy policy (template) — what the website collects, why, who can access it, retention, and privacy requests.", privacy)

# ---------------------------------------------------------------- logo & favicons
# Official circular seal supplied by the client (Oct 2026). The uploaded PNG had a baked-in
# checkerboard, so the seal was cut out with a circular alpha mask. Pre-built assets:
#   assets/images/logo.png (512), assets/favicon.png (512), assets/favicon-32.png (32),
#   assets/apple-touch-icon.png (180, flattened on white). build.py does not regenerate them.
print('logo/favicon: using pre-built official seal assets')
