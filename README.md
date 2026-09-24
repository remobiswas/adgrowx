# Remo Biswas — Founder of AdgrowX

A modern, highly-animated scroll-based personal portfolio and digital marketing agency website for **Remo Biswas**, Founder of **AdgrowX** (7+ Years Experience).

---

## 🌟 Visual & Architectural Highlights

- **Full-Screen 240-Frame Interactive Canvas**:
  - The complete 1080p frame sequence (`frame_0001.png` to `frame_0240.png`) operates as the full-viewport visual stage (`100vw × 100vh`) with cinematic cover scaling.
  - Smooth 60fps linear interpolation (`lerp`) scrubbing with nearest-loaded-frame fallback.
- **Top-Drop Marketing HUD (Scenes 01–10)**:
  - Physics-based entry animation (`translateY(-60px)` → `translateY(0)`).
  - Floating 3D glassmorphic cards positioned on the flanks (`.hud-left` and `.hud-right`), keeping Remo's face 100% visible and uncropped.
  - Suites for **Meta Ads**, **Google Search Ads**, **YouTube Video Ads**, **SEO Dominance**, **Social Media**, **Conversion Web Funnels**, **Design & Video Timeline**, and **Customer Journey Flywheel**.
- **Agency Showcase & Conversion Sections**:
  - **Brand Marquee**: Continuous dual-row infinite track with vibrant creative showcase cards.
  - **About Remo Biswas & 7+ Years Experience Counter**: Playful floating 3D shapes, agency mission narrative, and animated statistics.
  - **Services Ecosystem (01–10)**: Numbered full-width interactive cards with category badges and keyword subtags.
  - **Selected Projects**: Sticky stacking cards featuring detailed case studies.
  - **Client Testimonials**: Authentic review cards with 5-star ratings from local businesses.
  - **High-Impact Conversion CTA & Mega Outlined Footer**: Direct WhatsApp booking trigger, huge outlined typography (`REMO BISWAS` / `ADGROWX`), and complete sitemap.

---

## 🚀 Running Locally

You can serve the project using Python's built-in HTTP server:

```bash
# Navigate to the project root and start the server
python -m http.server 8000
```

Open your browser and navigate to:
👉 **http://localhost:8000**

---

## 📁 File Structure

```text
├── index.html           # Semantic HTML5 structure, HUD scenes & agency sections
├── style.css            # Responsive CSS design system, glassmorphic tokens & keyframes
├── script.js            # 60fps lerp canvas coordinator, HUD transitions & event handlers
├── frames/              # 240 1080p PNG frames for the scroll-based visual stage
│   └── video_frames_png/
├── website screenshot/  # Reference visual UI mockups & components
└── .gitignore           # Ignores large archive files
```

---

## 👤 Author

**Remo Biswas**  
*Digital Marketer • Founder of AdgrowX*  
- Focus: Meta Ads • Google Ads • SEO • Conversion Funnels • Growth Architecture
