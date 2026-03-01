import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT_FAMILY, PALETTES } from "./Constants";
import { GlassCard } from "./GlassCard";

export const RevealExtras: React.FC<{
    question: any;
    reelIndex: number;
    startFrame: number;
}> = ({ question, reelIndex, startFrame }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const relFrame = frame - startFrame;
    const palette = PALETTES[reelIndex % 4];

    if (relFrame <= 0) return null;

    const glowRadius = spring({ frame: relFrame - 6, fps, config: { damping: 15 } }) * 350;
    const opacity = interpolate(relFrame - 6, [0, 10, 40, 60], [0, 1, 1, 0], { extrapolateRight: "clamp" });
    const cy = 690 + question.correct_idx * 180 + 80;

    // Banner slide up
    const bannerProg = spring({ frame: relFrame - 25, fps, config: { damping: 14 } });

    // Explanation bullets
    const bulletsProg = spring({ frame: relFrame - 30, fps, config: { damping: 14 } });

    return (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
            {/* GLOW BLAST */}
            {relFrame >= 6 && glowRadius > 0 && (
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
                            opacity: opacity * 0.4,
                            mixBlendMode: "screen"
                        }}
                    />
                    {/* Inner intense pulse */}
                    <div
                        style={{
                            position: "absolute",
                            left: 540 - glowRadius * 0.5,
                            top: cy - glowRadius * 0.5,
                            width: glowRadius,
                            height: glowRadius,
                            borderRadius: "50%",
                            backgroundColor: "white",
                            filter: "blur(30px)",
                            opacity: opacity * 0.6,
                            mixBlendMode: "screen"
                        }}
                    />
                </>
            )}

            {/* CONFETTI BURST */}
            {relFrame >= 12 && (
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
                    {Array.from({ length: 80 }).map((_, i) => {
                        const rng = Math.sin(i * 12345);
                        const angle = Math.abs(rng) * Math.PI * 2;
                        const speed = 10 + Math.abs(Math.sin(i * 777)) * 25;
                        const size = 5 + Math.abs(Math.sin(i * 333)) * 15;
                        const t = relFrame - 12;

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
                                    transform: `rotate(${t * 10}deg)`
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {/* Answer Banner */}
            {relFrame >= 25 && (
                <GlassCard
                    width={960}
                    height={85}
                    left={60}
                    top={1560 - (bannerProg * 20)}
                    opacity={bannerProg}
                    baseColor="#052d14"
                    borderColor={palette.correct}
                    boxShadow={`0 10px 20px ${palette.correct}44`}
                >
                    <div style={{ fontSize: 34, fontWeight: "bold", fontFamily: FONT_FAMILY, color: palette.correct, textShadow: "1px 1px 3px black" }}>
                        ✅ સાચો જવાબ: {question.correct_text.length > 32 ? question.correct_text.substring(0, 32) + "..." : question.correct_text}
                    </div>
                </GlassCard>
            )}

            {/* Explanation Bullets */}
            {relFrame >= 30 && question.bullets.length > 0 && (
                <div style={{
                    position: "absolute",
                    top: 1420 - (bulletsProg * 20),
                    left: 60,
                    width: 960,
                    padding: "20px",
                    backgroundColor: "rgba(0,0,0,0.7)",
                    borderRadius: 18,
                    opacity: bulletsProg
                }}>
                    {question.bullets.map((b: string, i: number) => (
                        <div key={i} style={{ fontSize: 36, color: "#eef", fontFamily: FONT_FAMILY, marginBottom: 10, lineHeight: 1.4, textShadow: "1px 1px 4px black" }}>
                            • {b}
                        </div>
                    ))}
                </div>
            )}

        </AbsoluteFill>
    );
};
