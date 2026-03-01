import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { F_HOOK, F_QUESTION, F_OPTIONS, F_TENSION, PALETTES, FONT_HEADLINE } from "./Constants";

export const TimerBar: React.FC<{ reelIndex: number }> = ({ reelIndex }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();
    const palette = PALETTES[reelIndex % 4];

    const tensionStart = F_HOOK + F_QUESTION + F_OPTIONS;

    // Only show during tension phase
    if (frame < tensionStart || frame > tensionStart + F_TENSION + 5) {
        return null;
    }

    const relFrame = frame - tensionStart;
    const progress = Math.min(1, Math.max(0, relFrame / F_TENSION)); // 0 to 1

    // Timer goes 3..2..1..
    const secondsLeft = Math.ceil((F_TENSION - relFrame) / fps);

    // Color changes to red in last second
    const color = relFrame > F_TENSION - 30 ? palette.wrong : palette.gold;

    // Shrinks from 960 to 0
    const width = interpolate(progress, [0, 1], [960, 0]);

    // Opacity fade in quick
    const opacity = interpolate(relFrame, [0, 5], [0, 1], { extrapolateRight: "clamp" });

    return (
        <div style={{ position: "absolute", top: 180, left: 60, width: 960, height: 16, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 8, opacity }}>

            {/* Countdown Text */}
            <div style={{ position: "absolute", top: -70, right: 0, fontSize: 50, fontWeight: "800", color, fontFamily: FONT_HEADLINE, textShadow: "0 0 10px black" }}>
                {secondsLeft}
            </div>

            {/* Shrinking Bar */}
            <div style={{
                width: width,
                height: "100%",
                backgroundColor: color,
                borderRadius: 8,
                boxShadow: `0 0 15px ${color}`
            }} />
        </div>
    );
};
