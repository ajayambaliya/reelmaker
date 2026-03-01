export const F_HOOK = 45;
export const F_QUESTION = 135;
export const F_OPTIONS = 150;
export const F_TENSION = 60;
export const F_ANSWER = 90;
export const F_EXPLANATION = 60;
export const F_LOOP = 60;
export const F_TOTAL = F_HOOK + F_QUESTION + F_OPTIONS + F_TENSION + F_ANSWER + F_EXPLANATION + F_LOOP;

export const PALETTES = [
    {
        name: "dark-neon",
        bgTop: "#050B14", bgMid: "#0B0F1A", bgBot: "#080C16",
        accent: "#00E5FF", glow: "#00E5FF",
        correct: "#22C55E", wrong: "#EF4444", gold: "#FFD60A"
    },
    {
        name: "tech-deep",
        bgTop: "#0A0514", bgMid: "#0B0F1A", bgBot: "#0C0816",
        accent: "#B000FF", glow: "#B000FF",
        correct: "#22C55E", wrong: "#EF4444", gold: "#FFD60A"
    },
    {
        name: "cyan-dream",
        bgTop: "#05140F", bgMid: "#0B0F1A", bgBot: "#081610",
        accent: "#00FFB0", glow: "#00FFB0",
        correct: "#22C55E", wrong: "#EF4444", gold: "#FFD60A"
    },
    {
        name: "crimson-night",
        bgTop: "#140505", bgMid: "#0B0F1A", bgBot: "#160808",
        accent: "#FF0055", glow: "#FF0055",
        correct: "#22C55E", wrong: "#EF4444", gold: "#FFD60A"
    }
];

export const FONT_HEADLINE = "'Montserrat', sans-serif";
export const FONT_GUJARATI = "'Hind Vadodara', sans-serif";
export const FONT_BODY = "'Inter', sans-serif";
