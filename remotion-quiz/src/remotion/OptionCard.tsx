import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { F_INTRO, F_THINK, PALETTES, FONT_FAMILY } from "./Constants";
import { GlassCard } from "./GlassCard";

interface OptionProps {
    index: number;
    text: string;
    reelIndex: number;
    isCorrect: boolean;
    revealStartFrame: number;
}

export const OptionCard: React.FC<OptionProps> = ({ index, text, reelIndex, isCorrect, revealStartFrame }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const palette = PALETTES[reelIndex % 4];

    // Animation values
    const thinkStart = F_INTRO;

    // All enter at the same time at frame 15 of Think
    const enterFrame = thinkStart + 15;
    const entryProgress = spring({
        frame: frame - enterFrame,
        fps,
        config: { damping: 14, mass: 1, stiffness: 100 },
    });

    const letters = ["A", "B", "C", "D"];
    const topPos = 690 + index * 180;

    // Reveal logic
    const relRevealFrame = frame - revealStartFrame;
    let flash = false;
    let baseColor = "#19142d"; // default back color
    let borderColor = palette.accent;
    let textOpacity = 1;
    let circleColor = palette.accent;
    let shadow = `0 15px 30px rgba(0,0,0,0.6)`;
    let scale = 1;

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
            textOpacity = 1 - wrongProgress * 0.6; // Drops to 40%
        }
    }

    // Pre-entry opacity and slide up
    const yOffset = interpolate(entryProgress, [0, 1], [100, 0]);
    const currentOpacity = entryProgress;

    return (
        <GlassCard
            width={960}
            height={160}
            left={60}
            top={topPos + yOffset}
            opacity={currentOpacity}
            baseColor={baseColor}
            borderColor={borderColor}
            flash={flash}
            scale={scale}
            boxShadow={shadow}
        >
            <div style={{ display: "flex", alignItems: "center", height: "100%", position: "relative" }}>
                {/* Accent sidebar inside card */}
                <div style={{ position: "absolute", left: -22, top: "5%", height: "90%", width: 6, backgroundColor: palette.accent, borderRadius: 3 }} />

                {/* Letter Circle */}
                <div
                    style={{
                        minWidth: 64,
                        height: 64,
                        borderRadius: 32,
                        backgroundColor: isCorrect && relRevealFrame >= 6 ? palette.correct : circleColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 30,
                        fontSize: 34,
                        fontWeight: "bold",
                        color: isCorrect && relRevealFrame >= 6 ? "white" : "white",
                        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                        fontFamily: FONT_FAMILY
                    }}
                >
                    {letters[index]}
                </div>

                {/* Option Text */}
                <div
                    style={{
                        fontSize: 42,
                        fontWeight: "bold",
                        color: "white",
                        fontFamily: FONT_FAMILY,
                        opacity: textOpacity,
                        lineHeight: 1.4,
                        textShadow: "2px 3px 6px rgba(0,0,0,0.6), 4px 4px 10px rgba(0,0,0,0.4)",
                    }}
                >
                    {text}
                </div>
            </div>
        </GlassCard>
    );
};
