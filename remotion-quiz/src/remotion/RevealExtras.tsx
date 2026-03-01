import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { F_HOOK, F_QUESTION, F_OPTIONS, F_TENSION, F_ANSWER, PALETTES, FONT_GUJARATI } from "./Constants";
import { GlassCard } from "./GlassCard";

export const RevealExtras: React.FC<{
    question: any;
    reelIndex: number;
}> = ({ question, reelIndex }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const palette = PALETTES[reelIndex % 4];

    const optionsStart = F_HOOK + F_QUESTION;
    const answerStart = optionsStart + F_OPTIONS + F_TENSION;
    const explanationStart = answerStart + F_ANSWER;

    // Answer Phase (Frame 390 - 480)
    const relAnswer = frame - answerStart;

    // Explanation Phase (Frame 480 - 540)
    const relExp = frame - explanationStart;

    if (relAnswer <= 0) return null; // Wait until Answer Reveal phase

    const correctIdx = ["A", "B", "C", "D"].indexOf(question.correct_answer);
    const correctText = question.options[question.correct_answer] || "";
    const rawBullets = question.explanation.split("•").map((b: string) => b.trim()).filter(Boolean);
    const bullets = rawBullets.slice(0, 3).map((b: string) => b.substring(0, 60) + (b.length > 60 ? "..." : ""));

    // Option circle Y position
    const cy = 680 + correctIdx * 200 + 80;

    // ANSWER REVEAL EFFECTS
    const glowRadius = spring({ frame: relAnswer - 6, fps, config: { damping: 15 } }) * 350;
    const glowOpacity = interpolate(relAnswer - 6, [0, 10, 60, 90], [0, 1, 1, 0], { extrapolateRight: "clamp" });

    // Screen Flash (Very quick frame 0-6 whiteout)
    const screenFlash = interpolate(relAnswer, [0, 3, 6], [0, 0.4, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

    // Banner slide up
    const bannerProg = spring({ frame: relAnswer - 20, fps, config: { damping: 14 } });

    // EXPECTATION EFFECTS
    const bulletSpacing = 20; //frames

    return (
        <AbsoluteFill style={{ pointerEvents: "none" }}>

            {/* SCREEN FLASH */}
            {screenFlash > 0 && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'white', opacity: screenFlash, zIndex: 100 }} />
            )}

            {/* GLOW BLAST */}
            {relAnswer >= 6 && glowRadius > 0 && (
                <>
                    {/* Outer diffuse */}
                    <div
                        style={{
                            position: "absolute",
                            left: 540 - glowRadius,
                            top: cy - glowRadius,
                            width: glowRadius * 2,
                            height: glowRadius * 2,
                            borderRadius: "50%",
                            backgroundColor: palette.correct,
                            filter: "blur(60px)",
                            opacity: glowOpacity * 0.5,
                            mixBlendMode: "screen",
                            zIndex: 10
                        }}
                    />
                </>
            )}

            {/* CONFETTI BURST */}
            {relAnswer >= 10 && (
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 9 }}>
                    {Array.from({ length: 60 }).map((_, i) => {
                        const rng = Math.sin(i * 12345);
                        const angle = Math.abs(rng) * Math.PI * 2;
                        const speed = 15 + Math.abs(Math.sin(i * 777)) * 25;
                        const size = 6 + Math.abs(Math.sin(i * 333)) * 14;
                        const t = relAnswer - 10;

                        const px = 540 + Math.cos(angle) * speed * t;
                        // Add fake gravity 
                        const py = cy + Math.sin(angle) * speed * t + (0.8 * t * t);

                        const pOpacity = interpolate(t, [0, 30, 60], [1, 1, 0]);

                        if (t > 60) return null;

                        return (
                            <div
                                key={i}
                                style={{
                                    position: "absolute",
                                    left: px,
                                    top: py,
                                    width: size,
                                    height: size,
                                    backgroundColor: i % 3 === 0 ? palette.correct : i % 3 === 1 ? palette.gold : "white",
                                    borderRadius: i % 2 === 0 ? "50%" : 4,
                                    opacity: Math.max(0, pOpacity),
                                    transform: `rotate(${t * 15}deg)`,
                                    boxShadow: `0 0 10px ${i % 3 === 0 ? palette.correct : "white"}`
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {/* ANSWER BANNER */}
            {relAnswer >= 20 && (
                <GlassCard
                    width={960}
                    height={100}
                    left={60}
                    top={1600 - (bannerProg * 25)}
                    opacity={bannerProg}
                    baseColor="#0B1A14"
                    borderColor={palette.correct}
                    boxShadow={`0 15px 30px rgba(34, 197, 94, 0.4)`}
                >
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <div style={{ fontSize: 44, fontWeight: "600", fontFamily: FONT_GUJARATI, color: palette.correct, textShadow: "1px 1px 3px black", paddingLeft: 30 }}>
                            ✅ સાચો જવાબ: {correctText.length > 32 ? correctText.substring(0, 32) + "..." : correctText}
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* EXPLANATION PHASE BULLETS (Full Screen Overlay) */}
            {relExp >= 0 && bullets.length > 0 && (
                <AbsoluteFill style={{
                    backgroundColor: "rgba(8, 12, 20, 0.98)", // Solid dark background to hide question phase
                    opacity: interpolate(relExp, [0, 15, 55, 60], [0, 1, 1, 0], { extrapolateRight: "clamp" }), // Fades out precisely when loop phase begins
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "60px",
                    zIndex: 50,
                    pointerEvents: "none"
                }}>
                    <div style={{
                        position: "absolute", top: 150, width: "100%", textAlign: "center"
                    }}>
                        <h2 style={{ fontSize: 55, fontWeight: "800", color: palette.gold, fontFamily: FONT_GUJARATI, letterSpacing: 2, textShadow: "0 5px 15px black" }}>
                            સ્પષ્ટતા (Explanation)
                        </h2>
                    </div>

                    <div style={{ width: "100%", marginTop: 80 }}>
                        {bullets.map((b: string, i: number) => {
                            const bulletProg = spring({ frame: relExp - 10 - (i * bulletSpacing), fps, config: { damping: 14 } });
                            if (bulletProg <= 0) return null;

                            return (
                                <div key={i} style={{
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    borderRadius: 20,
                                    padding: "35px 30px",
                                    marginBottom: 30,
                                    opacity: bulletProg,
                                    transform: `translateY(${(1 - bulletProg) * 30}px) scale(${interpolate(bulletProg, [0, 1], [0.95, 1])})`,
                                    borderLeft: `8px solid ${palette.correct}`,
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                                }}>
                                    <div style={{ fontSize: 46, color: "white", fontFamily: FONT_GUJARATI, fontWeight: "600", lineHeight: 1.5 }}>
                                        {b}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </AbsoluteFill>
            )}

        </AbsoluteFill>
    );
};
