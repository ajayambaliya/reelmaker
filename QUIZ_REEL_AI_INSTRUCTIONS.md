# 🎬 AI MASTER INSTRUCTIONS: Gujarati MCQ Quiz Reel Generator
# Ultra-Modern Instagram Reel via Python + Pillow + FFmpeg
# Version: 3.0 | Format: 1080×1920 (9:16) | Multi-Question Reel | FPS: 30

---

## 🧠 ROLE & PERSONA

You are an **Expert Motion Graphics Designer + Python Engineer** who specializes in:
- Viral short-form video content (Instagram Reels, YouTube Shorts, TikTok)
- Modern UI/UX aesthetics (glassmorphism, neomorphism, aurora gradients)
- Python-based programmatic video generation
- Gujarati/Indic typography and cultural design

Your goal is to generate **production-ready Python code** that creates
Instagram Reels from MCQ quiz data that look **indistinguishable from
professionally designed content** — modern, viral-worthy, stunning.

---

## 📦 INPUT FORMAT

### Full File Structure
The input is a single JSON file (`data.json`) with this top-level structure:

```json
{
  "meta": {
    "source_url": "https://pendulumedu.com/quiz/current-affairs/...",
    "quiz_slug": "25-february-2026-current-affairs-quiz",
    "live_quiz_link": "https://currentadda.vercel.app/quiz/...",
    "date_english": "25 February 2026",
    "date_gujarati": "25 ફેબ્રુઆરી 2026",
    "date_filename": "20260225",
    "total_questions": 10,
    "reel_count": 2,
    "exported_at": "2026-03-01T09:49:55.457533"
  },
  "reel_config": {
    "max_questions_per_reel": 5,
    "frame_sizes": "1080x1920 (9:16)",
    "frame_timings_sec": {
      "intro": 3.0,
      "question_think": 5.0,
      "answer_reveal": 3.0,
      "outro": 4.0
    },
    "total_duration_5q_sec": 47.0
  },
  "questions": [ ...array of question objects... ]
}
```

### Single Question Object Structure
```json
{
  "question_number": 1,
  "question_text": "27 ફેબ્રુઆરી 2026ના રોજ અંજદીપને કઇ નૌકા કમાન્ડમાં સોંપવામાં આવશે?",
  "options": {
    "A": "ઉત્તરીય નેવલ કમાન્ડ",
    "B": "ઈસ્ટર્ન નેવલ કમાન્ડ",
    "C": "સધર્ન નેવલ કમાન્ડ",
    "D": "પશ્ચિમી નેવલ કમાન્ડ"
  },
  "correct_answer": "B",
  "explanation": "• ભારતીય નૌકાદળ ઔપચારિક રીતે અંજદીપને 27 ફેબ્રુઆરી...",
  "reel_index": 0,
  "position_in_reel": 1,
  "frame_ids": {
    "think": "reel0_q1_think",
    "answer": "reel0_q1_answer"
  }
}
```

### ⚠️ KEY DATA FORMAT RULES — READ CAREFULLY

```
1. options        → DICT with keys "A","B","C","D"  (NOT a list!)
                    Access as: question["options"]["A"], ["B"], ["C"], ["D"]

2. correct_answer → LETTER string: "A", "B", "C", or "D"
                    NOT the answer text itself!
                    To get answer text: question["options"][question["correct_answer"]]

3. explanation    → Bullet string starting with "•"
                    Split on "•" and show first 2 bullets in reveal frame
                    Trim each bullet to max 60 chars for display

4. reel_index     → Which reel this question belongs to (0-based)
                    Group questions by reel_index before rendering

5. position_in_reel → 1-based position within reel (1 to 5)
                    Use for progress indicator ("Q 2/5")

6. question_number → Global number across all reels (1–10)
                    Show as "Q.01", "Q.02" etc.

7. date_gujarati  → From meta. Show in header: "25 ફેબ્રુઆરી 2026"

8. frame_timings_sec → From reel_config. Use these exact timings:
                    intro:          3.0s  → 90  frames
                    question_think: 5.0s  → 150 frames
                    answer_reveal:  3.0s  → 90  frames
                    outro:          4.0s  → 120 frames
                    Per question total:   → 450 frames (15s)
                    Full reel (5 Qs):     → 47s (but render per-question)
```

### Data Parsing Helper (always include this)
```python
def parse_question(q: dict) -> dict:
    """Normalize question data into flat, easy-to-use format"""
    opts = q["options"]                          # {"A":..,"B":..,"C":..,"D":..}
    correct_letter = q["correct_answer"]         # "B"
    correct_text   = opts[correct_letter]        # "ઈસ્ટર્ન નેવલ કમાન્ડ"
    correct_idx    = list(opts.keys()).index(correct_letter)  # 1

    # Parse explanation bullets (take first 2)
    raw_bullets = [b.strip() for b in q["explanation"].split("•") if b.strip()]
    bullets = raw_bullets[:2]

    return {
        "number":         q["question_number"],
        "position":       q["position_in_reel"],       # 1–5
        "reel_index":     q["reel_index"],
        "text":           q["question_text"],
        "options_list":   list(opts.values()),          # ["ઉત્..","ઈસ્..","સધ..","પશ.."]
        "options_dict":   opts,                         # {"A":..,"B":..}
        "correct_letter": correct_letter,               # "B"
        "correct_text":   correct_text,                 # "ઈસ્ટર્ન..."
        "correct_idx":    correct_idx,                  # 1 (0-based)
        "bullets":        bullets,                      # ["ભારતીય...", "અંજ..."]
        "frame_think":    q["frame_ids"]["think"],
        "frame_answer":   q["frame_ids"]["answer"],
    }

def load_reel_data(json_path: str, reel_index: int) -> dict:
    """Load and filter questions for a specific reel"""
    with open(json_path) as f:
        data = json.load(f)
    
    meta   = data["meta"]
    config = data["reel_config"]
    
    # Filter questions for this reel, sorted by position
    questions = [
        parse_question(q) for q in data["questions"]
        if q["reel_index"] == reel_index
    ]
    questions.sort(key=lambda q: q["position"])
    
    return {
        "meta":      meta,
        "config":    config,
        "questions": questions,
        "reel_idx":  reel_index,
        "date_gu":   meta["date_gujarati"],    # "25 ફેબ્રુઆરી 2026"
        "date_en":   meta["date_english"],     # "25 February 2026"
        "total_reels": meta["reel_count"],     # 2
    }
```

---

## 🎨 DESIGN SYSTEM — ALWAYS FOLLOW THIS

### Canvas
```
Width:   1080px
Height:  1920px
FPS:     30

── Per-question segment (450 frames = 15s) ──────────────
  Intro screen:      90 frames  (3.0s)   ← from reel_config.frame_timings_sec.intro
  Question / Think: 150 frames  (5.0s)   ← from reel_config.frame_timings_sec.question_think
  Answer Reveal:     90 frames  (3.0s)   ← from reel_config.frame_timings_sec.answer_reveal
  Outro / Next:     120 frames  (4.0s)   ← from reel_config.frame_timings_sec.outro

── Full reel (5 questions) ──────────────────────────────
  Total duration:   47 seconds            ← reel_config.total_duration_5q_sec
  Total frames:     1410 frames

── Rendering strategy ───────────────────────────────────
  Render each question as its own 450-frame segment.
  Concatenate segments with FFmpeg concat demuxer.
  Each segment saved as: reel{R}_q{N}_frames/frame_%05d.png

Format: MP4 H.264, yuv420p
Audio:  background music (suspense + reveal per question)
```

### Color Palettes — ROTATE between these, never reuse same palette twice:

**Palette 1 — Cosmic Night** (DEFAULT)
```python
BG_TOP    = (8, 6, 28)       # deep space black
BG_MID    = (18, 8, 45)      # dark indigo
BG_BOT    = (30, 8, 55)      # deep violet
ACCENT    = (130, 80, 255)   # electric purple
GLOW      = (80, 40, 200)    # deep glow
CORRECT   = (0, 230, 120)    # neon green
WRONG     = (255, 55, 75)    # hot red
GOLD      = (255, 200, 50)   # warm gold
```

**Palette 2 — Midnight Ocean**
```python
BG_TOP    = (4, 10, 35)
BG_BOT    = (8, 30, 65)
ACCENT    = (0, 180, 255)    # electric cyan
GLOW      = (0, 100, 200)
CORRECT   = (0, 255, 150)
WRONG     = (255, 80, 80)
GOLD      = (255, 220, 80)
```

**Palette 3 — Ember Dark**
```python
BG_TOP    = (25, 8, 8)
BG_BOT    = (50, 15, 10)
ACCENT    = (255, 100, 30)   # hot orange
GLOW      = (200, 60, 20)
CORRECT   = (80, 255, 120)
WRONG     = (255, 50, 100)
GOLD      = (255, 210, 60)
```

**Palette 4 — Aurora Green**
```python
BG_TOP    = (5, 20, 18)
BG_BOT    = (8, 40, 35)
ACCENT    = (0, 220, 160)    # mint/teal
GLOW      = (0, 140, 100)
CORRECT   = (50, 255, 130)
WRONG     = (255, 70, 90)
GOLD      = (255, 215, 55)
```

### Typography Rules
```
Question Text  → NotoSansGujarati-Bold.ttf  @ 58px
Option Text    → NotoSansGujarati-Bold.ttf  @ 46px
Badge/Label    → NotoSansGujarati-Bold.ttf  @ 30px
Sub text       → NotoSansGujarati-Regular.ttf @ 32px
Fallback       → DejaVuSans-Bold.ttf (if Gujarati unavailable)

ALWAYS load fonts at start, NEVER inside loops
ALWAYS wrap long question text (max 22 chars per line)
ALWAYS use text shadow: offset (3,3), color (0,0,0,140)
```

---

## 🎞️ ANIMATION TIMELINE — PER QUESTION SEGMENT

Each question = 450 frames (15s). Repeat for each of 5 questions.
Frame numbers below are LOCAL to each question segment (always 0–449).

```
── SEGMENT START ──────────────────────────────────────────────
PHASE 0: INTRO / QUESTION NUMBER CARD   [Frame 0–90]   0.0s–3.0s
  ├── Frame 0–8:    Flash white → fade in (attention grab)
  ├── Frame 0–20:   Background + particles materialize
  ├── Frame 10–35:  Header slides down:
  │                   • Date badge: "25 ફેબ્રુઆરી 2026"
  │                   • Reel label: "Current Affairs Quiz"
  │                   • Progress: "Q 1/5" (position_in_reel / 5)
  ├── Frame 30–70:  Large question number pops in:
  │                   "Q.01" (question_number, zero-padded)
  │                   Spring animation, scale 0→1.1→1.0
  └── Frame 70–90:  Question card fades in, options hidden

── THINK PHASE ────────────────────────────────────────────────
PHASE 1: QUESTION VISIBLE               [Frame 90–240]  3.0s–8.0s
  ├── Frame 90–120:  Question text slides up (ease_out_cubic)
  ├── Frame 110–200: Options stagger in (every 15 frames)
  │                   A: frame 110, B: frame 125,
  │                   C: frame 140, D: frame 155
  │                   Each: bounce-entry from right side
  ├── Frame 150–240: Timer bar counts down 100%→0%
  │                   Green(100–60%) → Gold(60–30%) → Red(30–0%)
  └── Frame 210–240: Suspense pulse — borders flicker urgently

── REVEAL PHASE ───────────────────────────────────────────────
PHASE 2: ANSWER REVEAL                  [Frame 240–330]  8.0s–11.0s
  ├── Frame 240–248: All options flash white (impact!)
  ├── Frame 248–270: Wrong options → red + fade to 35% opacity
  ├── Frame 248–270: Correct option → green glow EXPLODES
  │                   Glow radius: 0 → 300px in 22 frames
  ├── Frame 255–290: Confetti burst from correct card center
  ├── Frame 265–330: Explanation bullets slide up from bottom
  │                   Show 2 bullets from explanation field
  │                   Bullet 1 at frame 265, Bullet 2 at frame 285
  └── Frame 270–330: "✅ સાચો જવાબ: [correct_text]" banner

── OUTRO / TRANSITION ─────────────────────────────────────────
PHASE 3: NEXT QUESTION TEASER           [Frame 330–450]  11.0s–15.0s
  ├── If position_in_reel < 5 (more questions coming):
  │   ├── Frame 330–360: "આગળ..." / "આગળનો પ્રશ્ન" fade in
  │   ├── Frame 360–390: Current screen blurs + slides up
  │   └── Frame 390–450: Next Q intro card fades in (overlap)
  └── If position_in_reel == 5 (last question in reel):
      ├── Frame 330–380: CTA card rises from bottom
      │                   "📲 Follow @CurrentAdda"
      │                   "🔗 Live Quiz: currentadda.vercel.app"
      ├── Frame 370–430: Share prompt + date of next quiz
      └── Frame 430–450: Fade to black with logo
── SEGMENT END ────────────────────────────────────────────────
```

---

## ⚙️ CORE ANIMATION FUNCTIONS — ALWAYS IMPLEMENT THESE

### 1. Easing Functions
```python
def ease_out_cubic(t: float) -> float:
    """Smooth deceleration — use for slides, fades"""
    return 1 - (1 - min(1.0, max(0.0, t))) ** 3

def ease_in_out(t: float) -> float:
    """Smooth both ways — use for scale pulses"""
    t = min(1.0, max(0.0, t))
    return t * t * (3 - 2 * t)

def ease_bounce(t: float) -> float:
    """Bouncy landing — use for option cards"""
    t = min(1.0, max(0.0, t))
    if t < 0.727:
        return 7.5625 * t * t
    elif t < 0.909:
        t -= 0.8181
        return 7.5625 * t * t + 0.75
    elif t < 0.9642:
        t -= 0.9375
        return 7.5625 * t * t + 0.9375
    else:
        t -= 0.984375
        return 7.5625 * t * t + 0.984375

def spring(t: float, tension: float = 8.0, friction: float = 5.0) -> float:
    """Spring physics — use for question card entry"""
    import math
    return 1 - math.exp(-friction * t) * math.cos(tension * t)
```

### 2. Background Generator
```python
def render_background(frame: int, palette: dict) -> Image.Image:
    """
    ALWAYS render these layers in order:
    1. Vertical gradient (3-stop: top/mid/bottom)
    2. Noise texture overlay (subtle grain, alpha=20)
    3. Large glow orbs (2–3 orbs, animated sine pulse)
    4. Particle field (60–80 tiny stars, random but seeded)
    5. Subtle diagonal light beam (top-right, alpha=8)
    """
    img = Image.new("RGB", (1080, 1920))
    
    # 3-stop vertical gradient
    for y in range(1920):
        if y < 960:
            t = y / 960
            r = int(palette['BG_TOP'][0] + (palette['BG_MID'][0] - palette['BG_TOP'][0]) * t)
            g = int(palette['BG_TOP'][1] + (palette['BG_MID'][1] - palette['BG_TOP'][1]) * t)
            b = int(palette['BG_TOP'][2] + (palette['BG_MID'][2] - palette['BG_TOP'][2]) * t)
        else:
            t = (y - 960) / 960
            r = int(palette['BG_MID'][0] + (palette['BG_BOT'][0] - palette['BG_MID'][0]) * t)
            g = int(palette['BG_MID'][1] + (palette['BG_BOT'][1] - palette['BG_MID'][1]) * t)
            b = int(palette['BG_MID'][2] + (palette['BG_BOT'][2] - palette['BG_MID'][2]) * t)
        for x in range(1080):
            img.putpixel((x, y), (r, g, b))
    
    # Animated glow orbs (pulse with sin wave)
    import math
    pulse1 = 0.88 + 0.12 * math.sin(frame * 0.06)
    pulse2 = 0.88 + 0.12 * math.sin(frame * 0.04 + 1.5)
    img = _add_glow(img, 950, 200, int(380 * pulse1), palette['GLOW'], alpha=55)
    img = _add_glow(img, 100, 1100, int(280 * pulse2), palette['GLOW'], alpha=35)
    img = _add_glow(img, 540, 960, int(450 * pulse1), palette['GLOW'], alpha=15)
    
    # Particle stars (fixed seed = consistent)
    img = _add_particles(img, count=75, seed=99)
    
    return img
```

### 3. Glassmorphism Card
```python
def glass_card(img: Image.Image, x, y, w, h, radius=24,
               tint=(255,255,255), tint_alpha=12,
               border_color=(255,255,255), border_alpha=35,
               blur_strength=0) -> Image.Image:
    """
    Modern glass card with:
    - Semi-transparent tinted fill
    - Bright top-left border highlight (simulated glass edge)
    - Optional blur (use sparingly — expensive)
    
    USAGE:
    - Question card: tint=(100,80,200), tint_alpha=25
    - Option cards: tint=(20,15,50), tint_alpha=180
    - CTA card: tint=ACCENT, tint_alpha=30
    """
    overlay = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    
    # Glass fill
    d.rounded_rectangle([x, y, x+w, y+h], radius=radius,
                         fill=(*tint, tint_alpha))
    # Full border
    d.rounded_rectangle([x, y, x+w, y+h], radius=radius,
                         outline=(*border_color, border_alpha), width=2)
    # Top highlight (bright line = glass refraction)
    d.rounded_rectangle([x+4, y+4, x+w-4, y+30], radius=radius-2,
                         fill=(*border_color, 25))
    
    base = img.convert("RGBA")
    base.alpha_composite(overlay)
    return base.convert("RGB")
```

### 4. Option Card with State
```python
def draw_option_card(img, frame, idx, text, state, entry_frame):
    """
    state: "hidden" | "default" | "selected" | "correct" | "wrong"
    
    Animation:
    - Entry: slides from left + bounces (ease_bounce)
    - Default: subtle border glow pulse
    - Correct: green explosion glow + scale up slightly
    - Wrong: red flash + fade to 40% opacity
    
    Layout per card:
    ┌─────────────────────────────────────────┐
    │  ◉ A   Option text here in Gujarati    │
    └─────────────────────────────────────────┘
    
    Card size:  960 × 190px
    Card gap:   30px between cards
    First card Y: 580px
    """
    ...
```

### 5. Timer Bar
```python
def draw_timer_bar(img, frame, start_frame, end_frame):
    """
    Countdown bar from 100% → 0% between start_frame and end_frame
    
    Visual behavior:
    - 100%–60%: Accent color (calm)
    - 60%–30%: Yellow/orange (warning)
    - 30%–0%:  Red (urgent) + subtle flash every 15 frames
    
    Position: y=1820, height=16px, x=60 to x=1020
    Has track (dim background) + fill (colored) + knob dot
    """
    ...
```

### 6. Answer Reveal Animation
```python
def animate_answer_reveal(img, frame, reveal_start, options, answer_idx):
    """
    Frame-by-frame sequence:
    
    reveal_start + 0:   All options flash white briefly
    reveal_start + 8:   Wrong options start fading to red
    reveal_start + 15:  Correct option scales UP (1.0 → 1.05)
    reveal_start + 20:  Green glow EXPLODES from correct card
    reveal_start + 25:  Particle burst from correct card center
    reveal_start + 35:  Wrong options settle at 35% opacity
    reveal_start + 40:  "✅ સાચો જવાબ" banner slides up from bottom
    
    The green glow explosion = most important visual moment.
    Make it dramatic. Radius 0 → 300px in 15 frames.
    """
    ...
```

### 7. Confetti/Particle Burst
```python
def particle_burst(img, cx, cy, frame, burst_frame, count=40):
    """
    Physics-based particle explosion:
    - Each particle: angle, speed, gravity, color, size, lifetime
    - Colors: mix of CORRECT, GOLD, ACCENT, WHITE
    - Shape: mix of circles and small rectangles (confetti)
    - Gravity: particles arc upward then fall
    - Fade: alpha decreases from frame 20+ of lifetime
    
    Seed: use cx+cy as seed for reproducible burst
    """
    import math, random
    random.seed(cx + cy + burst_frame)
    t = max(0, frame - burst_frame)
    if t == 0 or t > 60:
        return img
    
    overlay = Image.new("RGBA", (1080, 1920), (0,0,0,0))
    d = ImageDraw.Draw(overlay)
    
    for i in range(count):
        angle = random.uniform(0, 2 * math.pi)
        speed = random.uniform(8, 22)
        px = cx + math.cos(angle) * speed * t
        py = cy + math.sin(angle) * speed * t - 0.5 * t * t  # gravity
        size = random.randint(4, 12)
        alpha = max(0, int(255 * (1 - t / 50)))
        color = random.choice([(0,230,120), (255,200,50), (130,80,255), (255,255,255)])
        d.ellipse([px-size, py-size, px+size, py+size], fill=(*color, alpha))
    
    img.convert("RGBA")
    img.alpha_composite(overlay)
    return img.convert("RGB")
```

---

## 🏗️ LAYOUT BLUEPRINT (Y-positions, never change)

```
Y=0    ─────────────────────────────────────────────────────
Y=50   │  DATE BADGE (left): "25 ફેબ્રુઆરી 2026"           │ h=60
       │  PROGRESS (right):  "Q 1/5"  •  "Reel 1/2"        │
Y=130  │  QUIZ TITLE:  "Current Affairs Quiz"               │ h=50
Y=200  ┌──────────────────────────────────────────────────┐
       │  QUESTION NUMBER:  "Q.01"  (large, centered)      │ h=120
       │  Spring-pop animation on intro                    │
Y=320  └──────────────────────────────────────────────────┘
Y=335  ┌──────────────────────────────────────────────────┐
       │  QUESTION CARD  (glassmorphism)                   │ h=280
       │  question["text"]  (Gujarati, wrapped 20 chars)   │
Y=615  └──────────────────────────────────────────────────┘
Y=645  [ Option A ]  question["options"]["A"]               h=175
Y=840  [ Option B ]  question["options"]["B"]               h=175
Y=1035 [ Option C ]  question["options"]["C"]               h=175
Y=1230 [ Option D ]  question["options"]["D"]               h=175
Y=1430 ─── EXPLANATION BULLETS (hidden until reveal) ───── h=160
       │  • bullets[0]  (first bullet from explanation)    │
       │  • bullets[1]  (second bullet)                    │
Y=1610 ─── "✅ સાચો જવાબ: [correct_text]" BANNER ──────── h=80
Y=1710 ─── TIMER BAR ────────────────────────────────────── h=16
Y=1745 ─── REEL PROGRESS DOTS ──────────────────────────── h=24
           ●●○○○  (filled = done, current = accent, empty = upcoming)
           Based on position_in_reel
Y=1800 ─── LIVE QUIZ LINK ──────────────────────────────── h=40
           "🔗 currentadda.vercel.app"  (from meta.live_quiz_link)
Y=1860 ─── BOTTOM BRAND TAG ────────────────────────────── h=40
           "@CurrentAdda  •  25 ફેબ્રુઆરી 2026"
Y=1920 ─────────────────────────────────────────────────────
```

---

## 🌀 MODERN VISUAL EFFECTS CHECKLIST

For each reel, you MUST include AT LEAST 6 of these:

- [ ] **Gradient mesh background** — 3-stop animated gradient using palette BG_TOP/MID/BOT
- [ ] **Glassmorphism cards** — frosted glass on question card + option cards
- [ ] **Glow orbs** — 2–3 large blurred circles, sin-wave pulsing per frame
- [ ] **Star particles** — 60–80 tiny seeded dots (seed=99, consistent per reel)
- [ ] **Text shadow** — every text element has drop shadow (offset 3,3)
- [ ] **Card border highlight** — thin bright top-left edge (glass refraction)
- [ ] **Animated timer bar** — color shifts green→gold→red as lf_think progresses
- [ ] **Staggered option entry** — A/B/C/D slide in 15 frames apart
- [ ] **Bounce easing on options** — ease_bounce() NOT linear
- [ ] **Answer reveal glow burst** — radius 0→300px in 22 frames from correct card
- [ ] **Confetti particle explosion** — physics-based burst from correct card center
- [ ] **CTA follow button shimmer** — diagonal highlight sweeps every 45 frames
- [ ] **Diagonal light streak** — subtle top-right beam, alpha 6–10
- [ ] **Scanline texture** — ultra-subtle horizontal lines overlay, alpha 8
- [ ] **Progress dots** — ●●○○○ showing position_in_reel (from data field)
- [ ] **"Next question" transition** — for positions 1–4, smooth fade-out + teaser
- [ ] **Explanation bullets** — 2 bullets from q["explanation"].split("•") after reveal
- [ ] **Live link watermark** — meta["live_quiz_link"] always visible at bottom

---

## 📝 PHASE-BY-PHASE RENDERING GUIDE

### PHASE 0 — Intro Flash (Frame 0–8)
```
Purpose: Grab attention immediately (Instagram stops scroll)
Effect:  White flash that fades out fast
         frame 0–2: overlay alpha 200 → 0
         frame 3–8: background fades in from black
Code:
  flash_alpha = max(0, int(200 * (1 - frame / 3)))
  if flash_alpha > 0:
      overlay white rectangle, alpha=flash_alpha
```

### PHASE 2 — Header Appears (Frame 10–25)
```
Elements:
  - Date badge (left pill): meta["date_gujarati"]  e.g. "25 ફેબ્રુઆરી 2026"
  - Quiz label (center):    "Current Affairs Quiz"
  - Progress (right):       "Q {position_in_reel}/5"  •  "Part {reel_index+1}/2"

Animation: fade in + slide down 20px → 0px
  progress = ease_out_cubic((frame - 10) / 15)
  y_offset = int((1 - progress) * 20)
  alpha = int(255 * progress)
```

### PHASE 3 — Question Card (Frame 20–50)
```
Animation: spring() entry from top
  progress = spring((frame - 20) / 30, tension=6, friction=4)
  slide = int((1 - progress) * 60)   # slides down 60px

Card style:
  - Glass card: tint=(80,50,180), alpha=35
  - Border: accent color, 2px
  - Top highlight: white, alpha=20

Text layout:
  Line 1 (small): "Q.{question_number:02d}" label, accent color, 28px
  Line 2-4: question["text"] (Gujarati), white, 56px, wrapped at 20 chars
  NOTE: question_text is already in Gujarati — render as-is, no translation needed
```

### PHASE 4 — Options Stagger (Frame 110–155 within Think phase)
```
Each option enters at local think-phase frames: 20, 35, 50, 65
  (i.e. global frames 110, 125, 140, 155 = F_INTRO + offset)

Animation per option:
  t = (lf_think - entry) / 20
  x_offset = int((1 - ease_bounce(t)) * 180)  # slides in from right
  card_x = 60 + x_offset

Card style per option:
  Text sourced from: q["options_list"][i]  or  q["options"]["A"/"B"/"C"/"D"]
  Background: dark tint of accent, alpha=160
  Border:     accent color, 2px, rounded 22px
  Left edge:  bright accent bar, 4px wide (like VS Code sidebar)
  Label circle: filled accent, white letter (A / B / C / D)
```

### PHASE 5 — Timer Countdown (lf_think 0–150, i.e. global Frame 90–240)
```
Visual:
  Track: white alpha=15, full width (x=60 to x=1020, y=1710, h=16)
  Fill:  animated width from 100% → 0%
  timer_prog = max(0.0, 1.0 - lf_think / F_THINK)  # F_THINK=150

Color transitions:
  >60% remaining → CORRECT color (calm — green or cyan)
  30–60%         → GOLD color
  <30%           → WRONG color (red)
  <10%           → WRONG color + alpha flicker every 8 frames (urgent!)

Knob: small filled circle at right edge of fill bar, accent color
```

### PHASE 6 — Suspense Pulse (lf_think 120–150, i.e. global Frame 210–240)
```
Purpose: Build tension in last 1 second before reveal
Effect:  All option card borders pulse (bright → dim → bright)
         Background glow orbs pulse at double frequency
         Timer bar flickers red urgently

  pulse = 0.5 + 0.5 * sin(lf_think * 0.8)
  border_alpha = int(100 + 155 * pulse)
  # Trigger when lf_think >= 120 (last 30 think frames)
```

### PHASE 7 — Answer Reveal (lf_rev 0–90, i.e. global Frame 240–330)
```
lf_rev = local_frame - F_INTRO - F_THINK   (0 to 89)

lf_rev 0–8:   ALL option cards flash white (alpha 0→200→0)
lf_rev 8–30:  Wrong cards fade to 30% opacity + turn red border
lf_rev 8–30:  Correct card (q["correct_idx"]) scales UP slightly
lf_rev 15–50: GREEN GLOW BURSTS from correct card center
               cy = 645 + q["correct_idx"] * 195 + 87
               glow_r = int(ease_out_cubic((lf_rev-15)/22) * 300)
lf_rev 20–80: Confetti particles burst from correct card
lf_rev 25–90: "✅ સાચો જવાબ: {q['correct_text']}" banner slides up
               Correct text sourced from: q["options"][q["correct_letter"]]
lf_rev 30–90: Explanation bullets fade in
               bullets[0] at lf_rev=30, bullets[1] at lf_rev=50
               Bullets parsed from q["explanation"].split("•")[:2]
               banner has green border, dark green fill
```

### PHASE 8 — Outro / Transition (lf_out 0–120, i.e. global Frame 330–450)
```
lf_out = local_frame - F_INTRO - F_THINK - F_REVEAL  (0 to 119)

Keep revealed state visible throughout (all options colored, banner shown)

IF q["position"] < 5  (more questions coming in this reel):
  lf_out 0–40:   Revealed state holds steady
  lf_out 40–65:  "આગળનો પ્રશ્ન →" teaser fades in at bottom
                  show next question number: Q.{q['number']+1}
  lf_out 65–95:  Screen holds
  lf_out 95–120: Black fade-out (alpha 0→220)
                  Signals clean cut to next question segment

IF q["position"] == 5  (last question = end of reel):
  lf_out 0–20:   Revealed state holds
  lf_out 20–60:  Full CTA card rises from bottom:
                   "🎉 શ્રેષ્ઠ!"
                   "✅ સાચો જવાબ: {q['correct_text']}"
                   "🔗 Live Quiz: {meta['live_quiz_link']}"
                   "📲 Follow @CurrentAdda for Daily GK"
  lf_out 60–95:  Follow button shimmer sweep (left→right, every 45 frames)
  lf_out 95–120: Full black fade-out
```

---

## 🔊 AUDIO SYNC GUIDE (per question segment, local frames)

```python
# All frame numbers are LOCAL to each 450-frame question segment
AUDIO_TIMELINE_PER_QUESTION = {
    "intro_whoosh":     0,      # 0.0s  — segment start sound
    "question_number":  30,     # 1.0s  — Q number pop sound (spring)
    "question_card":    90,     # 3.0s  — question slides in (soft whoosh)
    "option_a":        110,     # 3.67s — option A slides in
    "option_b":        125,     # 4.17s — option B slides in
    "option_c":        140,     # 4.67s — option C slides in
    "option_d":        155,     # 5.17s — option D slides in
    "timer_tick":      150,     # 5.0s  — subtle tick starts
    "suspense_peak":   210,     # 7.0s  — music intensifies
    "reveal_flash":    240,     # 8.0s  — dramatic impact sound
    "correct_ding":    255,     # 8.5s  — success chime
    "confetti_burst":  270,     # 9.0s  — celebration sound
    "outro_transition": 330,    # 11.0s — next-question whoosh or CTA music
}

# FFmpeg audio mixing per segment:
# ffmpeg -i frames/frame_%05d.png
#        -i audio/suspense_loop.mp3          (0s–8s, atrim)
#        -i audio/reveal_impact.wav          (delayed to 8.0s)
#        -i audio/success_chime.wav          (delayed to 8.5s)
#        -filter_complex "
#            [1]atrim=0:8,adelay=0[s];
#            [2]adelay=8000[r];
#            [3]adelay=8500[c];
#            [s][r][c]amix=inputs=3,volume=1.5[audio]"
#        -map 0:v -map "[audio]"
#        -c:v libx264 -c:a aac -shortest segment.mp4
```

---

## 🚀 COMPLETE SCRIPT TEMPLATE

```python
#!/usr/bin/env python3
"""
Gujarati Current Affairs Quiz Reel Generator
Usage: python generate_reel.py --data data.json --reel 0 --output reel0.mp4

Renders one full reel (5 questions × 15s = 47s) from the JSON data file.
"""

import os, sys, math, json, random, argparse, subprocess
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# ── Config ───────────────────────────────────────────────
W, H     = 1080, 1920
FPS      = 30
# Per-question frame counts (from reel_config.frame_timings_sec)
F_INTRO  = 90    # 3.0s
F_THINK  = 150   # 5.0s
F_REVEAL = 90    # 3.0s
F_OUTRO  = 120   # 4.0s
F_TOTAL  = F_INTRO + F_THINK + F_REVEAL + F_OUTRO   # 450 per question

FONT_DIR = Path("fonts")

def load_fonts():
    try:
        bold = str(FONT_DIR / "NotoSansGujarati-Bold.ttf")
        reg  = str(FONT_DIR / "NotoSansGujarati-Regular.ttf")
        return {
            "bold_xl": ImageFont.truetype(bold, 90),   # Q.01 number
            "bold_lg": ImageFont.truetype(bold, 56),   # question text
            "bold_md": ImageFont.truetype(bold, 44),   # option text
            "bold_sm": ImageFont.truetype(bold, 32),   # badges, label
            "reg_md":  ImageFont.truetype(reg,  34),   # explanation
            "reg_sm":  ImageFont.truetype(reg,  26),   # bottom tags
        }
    except Exception as e:
        print(f"⚠ Gujarati font not found ({e}), using fallback")
        bold = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        reg  = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
        return {
            "bold_xl": ImageFont.truetype(bold, 90),
            "bold_lg": ImageFont.truetype(bold, 56),
            "bold_md": ImageFont.truetype(bold, 44),
            "bold_sm": ImageFont.truetype(bold, 32),
            "reg_md":  ImageFont.truetype(reg,  34),
            "reg_sm":  ImageFont.truetype(reg,  26),
        }

def parse_question(q: dict) -> dict:
    """Flatten question dict into easy-to-use format"""
    opts            = q["options"]                           # {"A":..,"B":..}
    correct_letter  = q["correct_answer"]                   # "B"
    correct_text    = opts[correct_letter]                  # option text
    correct_idx     = ["A","B","C","D"].index(correct_letter)  # 0-based int
    bullets         = [b.strip() for b in q["explanation"].split("•") if b.strip()][:2]
    return {
        "number":         q["question_number"],             # 1–10 (global)
        "position":       q["position_in_reel"],            # 1–5 (within reel)
        "text":           q["question_text"],
        "options_list":   [opts["A"], opts["B"], opts["C"], opts["D"]],
        "correct_letter": correct_letter,
        "correct_text":   correct_text,
        "correct_idx":    correct_idx,
        "bullets":        bullets,
    }

def load_reel(json_path: str, reel_index: int):
    with open(json_path) as f:
        data = json.load(f)
    meta    = data["meta"]
    questions = sorted(
        [parse_question(q) for q in data["questions"] if q["reel_index"] == reel_index],
        key=lambda q: q["position"]
    )
    return meta, questions

def render_question_segment(q: dict, meta: dict, palette: dict,
                             fonts: dict, out_dir: Path):
    """Render 450 frames for one question"""
    out_dir.mkdir(parents=True, exist_ok=True)
    opts = q["options_list"]
    
    for local_frame in range(F_TOTAL):
        img = render_background(local_frame, palette)
        
        # ── PHASE 0: Intro (0–90) ──────────────────────
        if local_frame <= F_INTRO:
            # Flash
            if local_frame < 8:
                flash_a = max(0, int(200 * (1 - local_frame / 4)))
                img = _overlay_color(img, (255,255,255), flash_a)
            
            # Header: date + progress
            h_prog = ease_out_cubic((local_frame - 10) / 20)
            if local_frame >= 10:
                img = render_header(img, meta, q, fonts, palette, h_prog)
            
            # Big Q number pops in
            if local_frame >= 30:
                q_prog = spring((local_frame - 30) / 35)
                img = render_question_number(img, q["number"], fonts, palette, q_prog)

        # ── PHASE 1: Think (90–240) ────────────────────
        lf_think = local_frame - F_INTRO  # 0–150
        if local_frame >= F_INTRO:
            img = render_header(img, meta, q, fonts, palette, 1.0)
            img = render_question_number(img, q["number"], fonts, palette, 1.0)
            
            # Question card
            q_prog = ease_out_cubic(min(1.0, lf_think / 30))
            img = render_question_card(img, q["text"], fonts, palette, q_prog)
            
            # Options stagger (every 15 frames)
            for i in range(4):
                entry = 20 + i * 15           # 20,35,50,65 within think phase
                if lf_think >= entry:
                    prog = ease_bounce(min(1.0, (lf_think - entry) / 20))
                    img = render_option(img, i, opts[i], "default",
                                        fonts, palette, prog)
            
            # Timer bar (think phase only)
            timer_prog = max(0.0, 1.0 - lf_think / F_THINK)
            img = render_timer_bar(img, timer_prog, palette)
            
            # Suspense pulse (last 30 frames of think)
            if lf_think >= 120:
                pulse = 0.5 + 0.5 * math.sin(local_frame * 0.8)
                img = render_suspense_pulse(img, opts, fonts, palette, pulse)

        # ── PHASE 2: Reveal (240–330) ──────────────────
        lf_rev = local_frame - F_INTRO - F_THINK  # 0–90
        if local_frame >= F_INTRO + F_THINK:
            img = render_header(img, meta, q, fonts, palette, 1.0)
            img = render_question_card(img, q["text"], fonts, palette, 1.0)
            
            # All options (flash first, then settle)
            for i in range(4):
                if lf_rev < 8:
                    # White flash
                    state = "flash"
                    prog  = 1.0
                elif i == q["correct_idx"]:
                    state = "correct"
                    prog  = ease_out_cubic(min(1.0, (lf_rev - 8) / 20))
                else:
                    state = "wrong"
                    prog  = ease_out_cubic(min(1.0, (lf_rev - 8) / 20))
                img = render_option(img, i, opts[i], state, fonts, palette, prog)
            
            # Green glow burst (correct card)
            if lf_rev >= 8:
                glow_r = int(ease_out_cubic(min(1.0, (lf_rev-8)/22)) * 300)
                cy = 645 + q["correct_idx"] * 195 + 87   # card center Y
                img = _add_glow(img, W//2, cy, glow_r, palette["CORRECT"], alpha=60)
            
            # Confetti
            if lf_rev >= 15:
                cy = 645 + q["correct_idx"] * 195 + 87
                img = particle_burst(img, W//2, cy, lf_rev, 15)
            
            # Answer banner
            if lf_rev >= 25:
                ban_prog = ease_out_cubic(min(1.0, (lf_rev-25)/20))
                img = render_answer_banner(img, q["correct_text"], fonts,
                                           palette, ban_prog)
            
            # Explanation bullets
            if lf_rev >= 30 and q["bullets"]:
                b_prog = ease_out_cubic(min(1.0, (lf_rev-30)/20))
                img = render_explanation(img, q["bullets"], fonts, palette, b_prog)

        # ── PHASE 3: Outro (330–450) ───────────────────
        lf_out = local_frame - F_INTRO - F_THINK - F_REVEAL  # 0–120
        if local_frame >= F_INTRO + F_THINK + F_REVEAL:
            # Keep reveal state visible
            img = render_header(img, meta, q, fonts, palette, 1.0)
            img = render_question_card(img, q["text"], fonts, palette, 1.0)
            for i in range(4):
                state = "correct" if i == q["correct_idx"] else "wrong"
                img = render_option(img, i, opts[i], state, fonts, palette, 1.0)
            img = render_answer_banner(img, q["correct_text"], fonts, palette, 1.0)
            
            if q["position"] < 5:
                # "Next question →" teaser
                if lf_out >= 40:
                    nxt_prog = ease_out_cubic(min(1.0, (lf_out-40)/25))
                    img = render_next_teaser(img, fonts, palette, nxt_prog)
                # Fade out at end
                if lf_out >= 95:
                    fade = min(1.0, (lf_out-95)/25)
                    img = _overlay_color(img, (0,0,0), int(fade * 220))
            else:
                # Last question → full CTA
                if lf_out >= 20:
                    cta_prog = ease_out_cubic(min(1.0, (lf_out-20)/35))
                    img = render_cta_card(img, meta, fonts, palette, cta_prog)
                if lf_out >= 95:
                    fade = min(1.0, (lf_out-95)/25)
                    img = _overlay_color(img, (0,0,0), int(fade * 255))

        # ── Progress dots (always visible during think+reveal) ──
        if local_frame >= F_INTRO:
            img = render_progress_dots(img, q["position"], palette)
        
        # ── Live link (always) ──────────────────────────
        img = render_live_link(img, meta["live_quiz_link"], fonts, palette)

        img.save(out_dir / f"frame_{local_frame:05d}.png")
    
    print(f"  ✅ Q{q['number']} done ({F_TOTAL} frames)")


def stitch_reel(question_dirs: list, output: str, meta: dict):
    """Concatenate all question segments into one reel MP4"""
    # Build concat list
    concat_file = Path("concat_list.txt")
    with open(concat_file, "w") as f:
        for qdir in question_dirs:
            temp_mp4 = qdir / "segment.mp4"
            subprocess.run([
                "ffmpeg", "-y",
                "-framerate", str(FPS),
                "-i", str(qdir / "frame_%05d.png"),
                "-c:v", "libx264", "-preset", "slow", "-crf", "16",
                "-pix_fmt", "yuv420p",
                str(temp_mp4)
            ], check=True, capture_output=True)
            f.write(f"file '{temp_mp4.resolve()}'\n")
    
    # Concat all segments
    subprocess.run([
        "ffmpeg", "-y",
        "-f", "concat", "-safe", "0",
        "-i", str(concat_file),
        "-c", "copy",
        output
    ], check=True)
    concat_file.unlink()
    print(f"🎬 Full reel → {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--data",    default="data.json")
    parser.add_argument("--reel",    type=int, default=0,
                        help="reel_index (0 or 1)")
    parser.add_argument("--output",  default="reel.mp4")
    parser.add_argument("--palette", default="auto",
                        choices=["auto","cosmic","ocean","ember","aurora"],
                        help="auto = rotate by reel_index")
    args = parser.parse_args()

    meta, questions = load_reel(args.data, args.reel)
    fonts = load_fonts()

    palette_names = ["cosmic", "ocean", "ember", "aurora"]
    pal_name = args.palette if args.palette != "auto" \
               else palette_names[args.reel % 4]
    palette = PALETTES[pal_name]

    print(f"🎬 Reel {args.reel} | {len(questions)} questions | "
          f"Palette: {pal_name} | Date: {meta['date_english']}")

    q_dirs = []
    for q in questions:
        qdir = Path(f"frames/reel{args.reel}_q{q['number']}")
        render_question_segment(q, meta, palette, fonts, qdir)
        q_dirs.append(qdir)

    stitch_reel(q_dirs, args.output, meta)
    print(f"✅ Done → {args.output}")
```

---

## 🔄 GITHUB ACTIONS INTEGRATION

```yaml
# .github/workflows/daily-reel.yml
name: 🎬 Daily Current Affairs Quiz Reels

on:
  schedule:
    - cron: '30 3 * * *'    # 9:00 AM IST = 3:30 AM UTC
  workflow_dispatch:
    inputs:
      date_override:
        description: 'Date slug (e.g. 25-february-2026), blank = today'
        required: false

jobs:
  generate:
    runs-on: ubuntu-latest
    timeout-minutes: 45       # 2 reels × ~20 min each

    steps:
    - uses: actions/checkout@v4

    - name: Setup Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.11'

    - name: Cache pip
      uses: actions/cache@v4
      with:
        path: ~/.cache/pip
        key: pip-${{ hashFiles('requirements.txt') }}

    - name: Install dependencies
      run: |
        pip install pillow requests python-dotenv
        sudo apt-get install -y ffmpeg

    - name: Setup fonts
      run: |
        mkdir -p fonts
        cp assets/fonts/NotoSansGujarati-Bold.ttf fonts/
        cp assets/fonts/NotoSansGujarati-Regular.ttf fonts/

    - name: Scrape & translate today's quiz
      run: python scripts/scrape_and_translate.py
      env:
        DATE_OVERRIDE: ${{ inputs.date_override }}
      # Outputs: data/data.json  (full 10-question file)

    - name: Generate Reel 0 (Q1–Q5)
      run: |
        python generate_reel.py \
          --data data/data.json \
          --reel 0 \
          --palette cosmic \
          --output outputs/reel0.mp4

    - name: Generate Reel 1 (Q6–Q10)
      run: |
        python generate_reel.py \
          --data data/data.json \
          --reel 1 \
          --palette ocean \
          --output outputs/reel1.mp4

    - name: Upload Reel 0 to Cloudinary
      run: python scripts/upload.py --file outputs/reel0.mp4 --tag reel0
      env:
        CLOUDINARY_URL: ${{ secrets.CLOUDINARY_URL }}
      # Outputs REEL0_URL to env

    - name: Upload Reel 1 to Cloudinary
      run: python scripts/upload.py --file outputs/reel1.mp4 --tag reel1
      env:
        CLOUDINARY_URL: ${{ secrets.CLOUDINARY_URL }}

    - name: Post Reel 0 to Instagram
      run: python scripts/post_instagram.py --reel 0
      env:
        IG_TOKEN: ${{ secrets.IG_TOKEN }}
        IG_ACCOUNT_ID: ${{ secrets.IG_ACCOUNT_ID }}
        # Caption auto-generated from meta.date_gujarati + live_quiz_link

    - name: Post Reel 1 to Instagram
      run: python scripts/post_instagram.py --reel 1
      env:
        IG_TOKEN: ${{ secrets.IG_TOKEN }}
        IG_ACCOUNT_ID: ${{ secrets.IG_ACCOUNT_ID }}

    - name: Save artifacts
      uses: actions/upload-artifact@v4
      with:
        name: reels-${{ env.DATE_SLUG }}
        path: outputs/
        retention-days: 7
```

### Auto-Caption Generator
```python
def build_instagram_caption(meta: dict, reel_index: int) -> str:
    date_gu = meta["date_gujarati"]          # "25 ફેબ્રુઆરી 2026"
    link    = meta["live_quiz_link"]         # "https://currentadda.vercel.app/quiz/..."
    part    = reel_index + 1                 # 1 or 2
    total   = meta["reel_count"]             # 2
    
    return f"""🧠 {date_gu} | Current Affairs Quiz (Part {part}/{total})

પ્રશ્નો સ્ક્રીન પર જોઈ, જવાબ ધ્યાનથી વિચારો!

🔗 Live Quiz: {link}

📲 Daily GK માટે Follow કરો!

#currentaffairs #gujaratiquiz #gkquiz #dailyquiz
#ભારત #સામાન્યજ્ઞાન #currentadda"""
```

---

## ✅ QUALITY CHECKLIST — Run before every render

**Data Parsing:**
- [ ] `options` accessed as dict: `q["options"]["A"]` not `q["options"][0]`
- [ ] `correct_answer` is letter "A"–"D", resolve to text via `opts[correct_letter]`
- [ ] `correct_idx` computed as `["A","B","C","D"].index(correct_letter)`
- [ ] Questions filtered by `reel_index` and sorted by `position_in_reel`
- [ ] Explanation bullets split on "•", first 2 used, each ≤60 chars
- [ ] `date_gujarati` from `meta`, shown in header
- [ ] `live_quiz_link` from `meta`, shown in bottom bar

**Timing:**
- [ ] F_INTRO=90, F_THINK=150, F_REVEAL=90, F_OUTRO=120 (total 450 per question)
- [ ] 5 questions × 450 frames = 2250 frames = 47s total reel
- [ ] Segments concatenated via FFmpeg concat demuxer

**Design:**
- [ ] Palette auto-rotates: reel_index % 4
- [ ] Progress dots show position_in_reel (●●○○○)
- [ ] Question number formatted "Q.01" using question_number (zero-padded)
- [ ] "Q X/5" progress shown using position_in_reel

**Technical:**
- [ ] Fonts loaded once before all loops
- [ ] No `putpixel` in hot loops — use numpy or row-by-row gradient
- [ ] Output has `-pix_fmt yuv420p` (Instagram requirement)
- [ ] Each segment renders to its own folder: `frames/reel{R}_q{N}/`

**Content:**
- [ ] Correct answer letter AND text both visible on reveal
- [ ] Explanation bullets appear after answer reveal
- [ ] Live quiz link visible: `meta["live_quiz_link"]`
- [ ] Last question (position=5) shows full CTA with link
- [ ] Non-last questions show "next question" transition

---

## 🎯 READY-TO-USE PROMPT

Copy-paste this when calling AI to generate the render script:

```
You are a Python video generation expert.
Follow the QUIZ_REEL_AI_INSTRUCTIONS.md exactly.

Generate a complete, runnable Python script to render one Instagram Reel
from this data file. Here is the full data.json:

{PASTE FULL data.json CONTENTS HERE}

Render reel_index: {0 or 1}

Critical requirements:
1. options is a DICT {"A":..,"B":..,"C":..,"D":..} — access with opts["A"]
2. correct_answer is a LETTER ("A"/"B"/"C"/"D") — NOT the answer text
3. Each question = 450 frames (90 intro + 150 think + 90 reveal + 120 outro)
4. Use meta.date_gujarati in header, meta.live_quiz_link in footer
5. Progress dots show position_in_reel out of 5
6. Show first 2 explanation bullets (split on "•") after answer reveal
7. Last question (position_in_reel==5) gets full CTA with live_quiz_link
8. All other questions get "next question →" transition in outro
9. Palette: reel_index % 4 → [cosmic, ocean, ember, aurora]
10. The answer reveal glow burst is the most important visual moment — make it DRAMATIC

Output: Single complete Python file, fully runnable, zero placeholders.
```

---

*Instructions Version 3.0 | Optimized for Pillow 10+ | FFmpeg 6+ | Python 3.11+*
*Input: pendulumedu JSON with options-as-dict and correct_answer-as-letter*
*Palette rotate: reel_index % 4 → [cosmic, ocean, ember, aurora]*
*Target: 2250 frames (5 questions) in < 8 minutes on GitHub Actions ubuntu-latest*
*Per-question render: 450 frames in ~90s*
