import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { F_INTRO, F_THINK, F_REVEAL, PALETTES, FONT_FAMILY } from "./Constants";
import { OptionCard } from "./OptionCard";
import { TimerBar } from "./TimerBar";
import { GlassCard } from "./GlassCard";
import { RevealExtras } from "./RevealExtras";

export const QuestionSegment: React.FC<{
    question: any;
    meta: any;
    reelIndex: number;
    isLast: boolean;
}> = ({ question, meta, reelIndex, isLast }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const palette = PALETTES[reelIndex % 4];

    // Global phases bounds relative to 0 start
    const thinkEnd = F_INTRO + F_THINK;
    const revealEnd = thinkEnd + F_REVEAL;

    // Header Entry
    const headerProg = spring({ frame: frame - 10, fps, config: { damping: 15 } });
    const headerY = interpolate(headerProg, [0, 1], [-50, 0]);

    // Question Q.01 scale pop
    const qNumScale = spring({ frame: frame - 20, fps, config: { stiffness: 150, damping: 10 } });

    // Card slide up
    const cardProg = spring({ frame: frame - 50, fps, config: { damping: 14 } });
    const cardOpacity = interpolate(cardProg, [0, 1], [0, 1]);
    const cardY = interpolate(cardProg, [0, 1], [50, 0]);

    // Handle Outro transitions
    const outroProg = frame > revealEnd ? spring({ frame: frame - revealEnd, fps }) : 0;

    // Fade entire scene to black before next
    let sceneOpacity = 1;
    if (!isLast && frame > revealEnd + 90) {
        sceneOpacity = interpolate(frame - (revealEnd + 90), [0, 30], [1, 0]);
    }

    return (
        <AbsoluteFill style={{ opacity: sceneOpacity }}>
            {/* Date Header Badge */}
            <div
                style={{
                    position: "absolute",
                    top: 60 + headerY,
                    left: 60,
                    background: palette.accent,
                    padding: "10px 30px",
                    borderRadius: 30,
                    border: "2px solid rgba(255,255,255,0.4)",
                    opacity: headerProg,
                }}
            >
                <span style={{ fontSize: 34, fontWeight: "bold", fontFamily: FONT_FAMILY, color: "white" }}>
                    {meta.date_gujarati}
                </span>
            </div>

            <div
                style={{
                    position: "absolute",
                    top: 60 + headerY,
                    right: 60,
                    background: palette.gold,
                    padding: "10px 30px",
                    borderRadius: 30,
                    opacity: headerProg,
                }}
            >
                <span style={{ fontSize: 34, fontWeight: "bold", fontFamily: FONT_FAMILY, color: "white" }}>
                    Q {question.position_in_reel}/5
                </span>
            </div>

            {/* Main Big Top Banner */}
            <div style={{ position: "absolute", top: 150 + headerY, width: "100%", textAlign: "center", opacity: headerProg }}>
                <h2 style={{ fontSize: 44, color: "#e6e6ff", fontFamily: FONT_FAMILY, textShadow: "2px 2px 5px black" }}>
                    Current Affairs Quiz
                </h2>
            </div>

            {/* Large Q Number */}
            <div style={{ position: "absolute", top: 220, width: "100%", textAlign: "center", transform: `scale(${qNumScale})` }}>
                <h1 style={{ fontSize: 105, fontWeight: "bold", color: palette.gold, fontFamily: FONT_FAMILY, textShadow: `0 8px 15px ${palette.glow}, 0 4px 5px black` }}>
                    Q.{question.question_number < 10 ? `0${question.question_number}` : question.question_number}
                </h1>
            </div>

            {/* Question Glass Card */}
            <div style={{ position: "absolute", top: 380 + cardY, left: 50, opacity: cardOpacity }}>
                <GlassCard width={980} height={280} top={0} left={0} baseColor="#0f0a23" borderColor={palette.accent} opacity={1}>
                    <p style={{
                        fontSize: 54,
                        fontWeight: "bold",
                        fontFamily: FONT_FAMILY,
                        color: "white",
                        lineHeight: 1.5,
                        textShadow: "3px 3px 5px black, 1px 1px 2px black",
                        margin: 0,
                    }}>
                        {question.text}
                    </p>
                </GlassCard>
            </div>

            {/* Options */}
            {Object.values(question.options).map((text: any, idx: number) => {
                const correctIdx = ["A", "B", "C", "D"].indexOf(question.correct_answer);
                return (
                    <OptionCard
                        key={idx}
                        index={idx}
                        text={text as string}
                        reelIndex={reelIndex}
                        isCorrect={idx === correctIdx}
                        revealStartFrame={thinkEnd}
                    />
                );
            })}

            <TimerBar reelIndex={reelIndex} />

            {/* Reveal Effects & Answers */}
            <RevealExtras
                question={question}
                reelIndex={reelIndex}
                startFrame={thinkEnd}
            />

            {/* Outro Next Indicator */}
            {!isLast && frame > thinkEnd + F_REVEAL + 30 && (
                <div style={{ position: "absolute", top: 1690 - (outroProg * 20), width: "100%", textAlign: "center" }}>
                    <h3 style={{ fontSize: 34, color: palette.gold, fontFamily: FONT_FAMILY, fontWeight: "bold", textShadow: "2px 2px 5px black" }}>
                        આગળનો પ્રશ્ન → Q.{(question.question_number + 1) < 10 ? `0${question.question_number + 1}` : question.question_number + 1}
                    </h3>
                </div>
            )}

            {/* Progress Dots Bottom */}
            <div style={{ position: "absolute", top: 1750, width: "100%", display: "flex", justifyContent: "center", gap: 35, opacity: headerProg }}>
                {[1, 2, 3, 4, 5].map(dot => (
                    <div key={dot} style={{
                        width: 16, height: 16, borderRadius: 8,
                        backgroundColor: dot < question.position_in_reel ? palette.correct : dot === question.position_in_reel ? "white" : "rgba(255,255,255,0.2)",
                        boxShadow: dot === question.position_in_reel ? "0 0 10px white" : "none"
                    }} />
                ))}
            </div>

            {/* Bottom Link watermark */}
            <div style={{ position: "absolute", top: 1800, width: "100%", textAlign: "center", opacity: headerProg }}>
                <p style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", fontFamily: FONT_FAMILY, margin: 0 }}>
                    🔗 {meta.live_quiz_link.replace('https://', '')}
                </p>
                <p style={{ fontSize: 24, color: palette.accent, fontFamily: FONT_FAMILY, marginTop: 10 }}>
                    @CurrentAdda
                </p>
            </div>

            {/* Full Screen Last Question CTA */}
            {isLast && frame > thinkEnd + F_REVEAL + 20 && (
                <GlassCard
                    width={940} height={320} left={70} top={1360 - (spring({ frame: frame - (thinkEnd + F_REVEAL + 20), fps }) * 40)}
                    baseColor="#0f0a1e" borderColor={palette.accent} opacity={spring({ frame: frame - (thinkEnd + F_REVEAL + 20), fps })}
                >
                    <h1 style={{ fontSize: 54, fontWeight: "bold", color: palette.gold, fontFamily: FONT_FAMILY, marginBottom: 20 }}>🎉 શ્રેષ્ઠ!</h1>
                    <h2 style={{ fontSize: 36, color: "white", fontFamily: FONT_FAMILY, marginBottom: 40 }}>🔗 {meta.live_quiz_link.replace('https://', '')}</h2>
                    <h3 style={{ fontSize: 34, fontWeight: "bold", color: palette.accent, fontFamily: FONT_FAMILY }}>📲 Follow @CurrentAdda</h3>
                </GlassCard>
            )}

        </AbsoluteFill>
    );
};
