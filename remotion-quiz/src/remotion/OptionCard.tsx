import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { F_HOOK, F_QUESTION, F_OPTIONS, F_TENSION, PALETTES, FONT_HEADLINE, FONT_GUJARATI } from "./Constants";
import { GlassCard } from "./GlassCard";

interface OptionProps {
    index: number;
    text: string;
    reelIndex: number;
    isCorrect: boolean;
}

export const OptionCard: React.FC<OptionProps> = ({ index, text, reelIndex, isCorrect }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const palette = PALETTES[reelIndex % 4];

    // Global Timing Offsets
    const optionsStart = F_HOOK + F_QUESTION;
    const answerStart = optionsStart + F_OPTIONS + F_TENSION;

    // Phase 3: Options (Option entries staggered by 30 frames: 180, 210, 240, 270)
    const enterFrame = optionsStart + index * 30;
    const entryProgress = spring({
        frame: frame - enterFrame,
        fps,
        config: { damping: 14, mass: 1, stiffness: 100 },
    });

    const letters = ["A", "B", "C", "D"];
    const topPos = 680 + index * 200;

    // Phase 5: Answer Reveal
    const relRevealFrame = frame - answerStart;
    let flash = false;
    let baseColor = "#0f1629";
    let borderColor = "rgba(255,255,255,0.05)";
    let textOpacity = 1;
    let circleColor = palette.accent;
    let shadow = `0 10px 20px rgba(0,0,0,0.4)`;
    let scale = 1;

    // Answer Logic
    if (relRevealFrame > 0 && relRevealFrame < 6) {
        flash = true; // white flash
    } else if (relRevealFrame >= 6) {
        if (isCorrect) {
            const correctProgress = spring({ frame: relRevealFrame - 6, fps, config: { damping: 12 } });
            baseColor = palette.correct;
            borderColor = "white";
            circleColor = "white";
            shadow = `0 0 ${interpolate(correctProgress, [0, 1], [0, 80])}px ${palette.correct}`;
        } else {
            const wrongProgress = Math.min(1, (relRevealFrame - 6) / 20);
            baseColor = palette.wrong;
            borderColor = palette.wrong;
            circleColor = palette.wrong;
            textOpacity = Math.max(0.4, 1 - wrongProgress);
        }
    }

    // Pre-entry opacity and slide up
    const yOffset = interpolate(entryProgress, [0, 1], [60, 0]);
    const currentOpacity = entryProgress;

    // Tension hover effect: if active (just an illusion, scale up slightly on entry finishing)
    const hoverScale = interpolate(entryProgress, [0, 0.8, 1], [0.95, 1.02, 1], { extrapolateRight: "clamp" });
    scale *= hoverScale;

    // Slight fade out logic at end (if loop trigger starts)
    const loopOpacity = frame > 540 ? interpolate(frame, [540, 570], [1, 0]) : 1;

    return (
        <GlassCard
            width={960}
            height={160}
            left={60}
            top={topPos + yOffset}
            opacity={Math.min(currentOpacity, loopOpacity)}
            baseColor={baseColor}
            borderColor={borderColor}
            flash={flash}
            scale={scale}
            boxShadow={shadow}
        >
            <div style={{ display: "flex", alignItems: "center", height: "100%", position: "relative" }}>
                {/* Accent sidebar inside card */}
                <div style={{ position: "absolute", left: -22, top: "20%", height: "60%", width: 6, backgroundColor: palette.accent, borderRadius: 3 }} />

                {/* Letter Circle */}
                <div
                    style={{
                        minWidth: 70,
                        height: 70,
                        borderRadius: 35,
                        backgroundColor: isCorrect && relRevealFrame >= 6 ? palette.correct : circleColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 35,
                        marginLeft: 10,
                        fontSize: 36,
                        fontWeight: "800",
                        color: isCorrect && relRevealFrame >= 6 ? "white" : "white",
                        textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
                        fontFamily: FONT_HEADLINE
                    }}
                >
                    {letters[index]}
                </div>

                {/* Option Text */}
                <div
                    style={{
                        fontSize: 42,
                        fontWeight: "600",
                        color: "white",
                        fontFamily: FONT_GUJARATI,
                        opacity: textOpacity,
                        lineHeight: 1.4,
                        textShadow: "2px 2px 5px rgba(0,0,0,0.8)",
                    }}
                >
                    {text}
                </div>
            </div>
        </GlassCard>
    );
};
