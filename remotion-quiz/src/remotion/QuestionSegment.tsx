import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
    F_HOOK, F_QUESTION, F_OPTIONS, F_TENSION, F_ANSWER, F_EXPLANATION, F_LOOP,
    PALETTES, FONT_HEADLINE, FONT_GUJARATI, FONT_BODY
} from "./Constants";
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

    // Global phase bounds
    const questionStart = F_HOOK;
    const optionsStart = questionStart + F_QUESTION;
    const answerStart = optionsStart + F_OPTIONS + F_TENSION;
    const loopStart = answerStart + F_ANSWER + F_EXPLANATION;

    // Header & Base Elements Entry (Persist mostly)
    const headerProg = spring({ frame: frame - 10, fps, config: { damping: 15 } });
    const headerY = interpolate(headerProg, [0, 1], [-50, 0]);

    // QUESTION NUMBER POP (appears during hook, persists)
    const qNumScale = spring({ frame: frame - 20, fps, config: { stiffness: 150, damping: 10 } });

    // -------------- HOOK PHASE (0 - 45) --------------
    // E.g. "🚨 MOST ASKED PSI QUESTION"
    const hookProg = spring({ frame: frame - 5, fps, config: { damping: 12, stiffness: 120 } });
    const hookScale = interpolate(hookProg, [0, 1], [0.8, 1]);
    const hookOpacity = frame < questionStart ? interpolate(frame, [questionStart - 10, questionStart], [1, 0]) : 0;

    // -------------- QUESTION PHASE (45 - 180) --------------
    const cardProg = spring({ frame: frame - questionStart, fps, config: { damping: 14 } });
    const cardOpacity = interpolate(cardProg, [0, 1], [0, 1]);
    const cardY = interpolate(cardProg, [0, 1], [30, 0]);
    // Subtle float
    const cardFloatY = interpolate(Math.sin((frame - questionStart) / 10), [-1, 1], [-2, 2]);

    // -------------- LOOP PHASE (540 - 600) --------------
    // Loop only if not last
    const loopProg = frame > loopStart ? spring({ frame: frame - loopStart, fps }) : 0;

    // Global fade out at end for smooth transition
    let sceneOpacity = interpolate(frame, [loopStart + F_LOOP - 15, loopStart + F_LOOP], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    if (isLast) sceneOpacity = 1; // Don't fade out completely if last, handled differently by End CTA

    return (
        <AbsoluteFill style={{ opacity: sceneOpacity }}>
            {/* Header Badge: Date */}
            <div style={{ position: "absolute", top: 60 + headerY, left: 60, background: palette.bgBot, padding: "10px 30px", borderRadius: 30, border: `2px solid ${palette.accent}`, opacity: headerProg }}>
                <span style={{ fontSize: 32, fontWeight: "600", fontFamily: FONT_GUJARATI, color: "white" }}>
                    {meta.date_gujarati}
                </span>
            </div>

            {/* Header Badge: Progress */}
            <div style={{ position: "absolute", top: 60 + headerY, right: 60, background: palette.gold, padding: "10px 30px", borderRadius: 30, opacity: headerProg }}>
                <span style={{ fontSize: 32, fontWeight: "800", fontFamily: FONT_HEADLINE, color: "#111" }}>
                    Q {question.position_in_reel}/5
                </span>
            </div>

            {/* Hook Scene (Fades out when question appears) */}
            {frame < questionStart && (
                <div style={{ position: "absolute", top: 400, width: "100%", textAlign: "center", opacity: hookOpacity, transform: `scale(${hookScale})` }}>
                    <div style={{ fontSize: 100, marginBottom: 20 }}>🚨</div>
                    <h1 style={{ fontSize: 75, fontWeight: "800", color: palette.gold, fontFamily: FONT_HEADLINE, textShadow: "0 10px 20px black", padding: "0 40px", lineHeight: 1.2 }}>
                        90% GET THIS WRONG
                    </h1>
                    <h2 style={{ fontSize: 50, fontWeight: "600", color: "white", fontFamily: FONT_BODY, marginTop: 40 }}>
                        Current Affairs Challenge
                    </h2>
                </div>
            )}

            {/* Main Question Elements (Appears at Question Phase) */}
            {frame >= questionStart - 10 && (
                <>
                    {/* Top Banner Text */}
                    <div style={{ position: "absolute", top: 150 + headerY, width: "100%", textAlign: "center", opacity: headerProg }}>
                        <h2 style={{ fontSize: 40, color: "rgba(255,255,255,0.7)", fontFamily: FONT_HEADLINE, fontWeight: "600", letterSpacing: 2 }}>
                            CURRENT AFFAIRS QUIZ
                        </h2>
                    </div>

                    {/* Q Number */}
                    <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center", transform: `scale(${qNumScale})` }}>
                        <h1 style={{ fontSize: 110, fontWeight: "800", color: palette.gold, fontFamily: FONT_HEADLINE, textShadow: `0 8px 30px ${palette.glow}88, 0 4px 10px black` }}>
                            Q.{question.question_number < 10 ? `0${question.question_number}` : question.question_number}
                        </h1>
                    </div>

                    {/* Question Card */}
                    <div style={{ position: "absolute", top: 380 + cardY + cardFloatY, left: 50, opacity: cardOpacity }}>
                        <GlassCard width={980} height={260} top={0} left={0} baseColor="rgba(11, 15, 26, 0.7)" borderColor="rgba(255,255,255,0.1)" opacity={1} boxShadow="0 20px 40px rgba(0,0,0,0.5)">
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 30px" }}>
                                <p style={{
                                    fontSize: 52,
                                    fontWeight: "600",
                                    fontFamily: FONT_GUJARATI,
                                    color: "white",
                                    lineHeight: 1.4,
                                    textShadow: "2px 2px 4px black",
                                    margin: 0,
                                    textAlign: "center"
                                }}>
                                    {question.question_text || question.text}
                                </p>
                            </div>
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
                            />
                        );
                    })}

                    <TimerBar reelIndex={reelIndex} />

                    {/* Reveal Effects & Answers */}
                    <RevealExtras
                        question={question}
                        reelIndex={reelIndex}
                    />
                </>
            )}

            {/* Loop End / Outro Next Indicator */}
            {!isLast && frame > loopStart && (
                <div style={{ position: "absolute", top: 1690 - (loopProg * 20), width: "100%", textAlign: "center", opacity: loopProg }}>
                    <h3 style={{ fontSize: 40, color: palette.gold, fontFamily: FONT_HEADLINE, fontWeight: "800", textShadow: "0 4px 10px black", backgroundColor: "rgba(0,0,0,0.5)", padding: "20px", display: "inline-block", borderRadius: 20 }}>
                        NEXT QUESTION IN {Math.ceil((loopStart + F_LOOP - frame) / 30)}...
                    </h3>
                </div>
            )}

            {/* Progress Dots Bottom */}
            <div style={{ position: "absolute", top: 1770, width: "100%", display: "flex", justifyContent: "center", gap: 30, opacity: headerProg }}>
                {[1, 2, 3, 4, 5].map(dot => (
                    <div key={dot} style={{
                        width: 14, height: 14, borderRadius: 7,
                        backgroundColor: dot < question.position_in_reel ? palette.correct : dot === question.position_in_reel ? "white" : "rgba(255,255,255,0.2)",
                        boxShadow: dot === question.position_in_reel ? "0 0 10px white" : "none",
                        transition: "all 0.3s"
                    }} />
                ))}
            </div>

            {/* Bottom Link watermark */}
            <div style={{ position: "absolute", top: 1815, width: "100%", textAlign: "center", opacity: headerProg }}>
                <p style={{ fontSize: 26, color: "rgba(255,255,255,0.6)", fontFamily: FONT_BODY, margin: 0, fontWeight: "600" }}>
                    🔗 {meta.live_quiz_link.replace('https://', '')}
                </p>
                <p style={{ fontSize: 24, color: palette.accent, fontFamily: FONT_BODY, marginTop: 10, fontWeight: "800" }}>
                    @CurrentAdda
                </p>
            </div>

            {/* Full Screen Last Question CTA */}
            {isLast && frame > loopStart && (
                <GlassCard
                    width={960} height={350} left={60} top={1400 - (spring({ frame: frame - loopStart, fps }) * 50)}
                    baseColor="rgba(11, 15, 26, 0.9)" borderColor={palette.accent} opacity={spring({ frame: frame - loopStart, fps })}
                >
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
                        <h1 style={{ fontSize: 65, fontWeight: "800", color: palette.gold, fontFamily: FONT_HEADLINE, marginBottom: 20 }}>🎉 EXCELLENT!</h1>
                        <h2 style={{ fontSize: 40, color: "white", fontFamily: FONT_BODY, marginBottom: 40 }}>🔗 Take Live Quiz Link Below</h2>
                        <h3 style={{ fontSize: 45, fontWeight: "800", color: palette.accent, fontFamily: FONT_HEADLINE }}>+ Follow @CurrentAdda</h3>
                    </div>
                </GlassCard>
            )}

        </AbsoluteFill>
    );
};
