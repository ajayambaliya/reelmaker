import React from "react";
import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { F_INTRO, F_THINK, F_REVEAL, F_OUTRO, PALETTES } from "./Constants";

export const TimerBar: React.FC<{
    reelIndex: number;
}> = ({ reelIndex }) => {
    const frame = useCurrentFrame();
    const palette = PALETTES[reelIndex % 4];

    // Logic for timer
    const localThinkFrame = frame - F_INTRO;

    // Opacity fade in and out bounds
    let opacity = 0;
    if (localThinkFrame >= 0 && localThinkFrame <= F_THINK) {
        opacity = 1;
    }
    if (localThinkFrame > F_THINK && localThinkFrame < F_THINK + 10) {
        opacity = 1 - (localThinkFrame - F_THINK) / 10;
    }

    // Timer width from 1 to 0
    const progress = Math.max(0, 1 - localThinkFrame / F_THINK);

    let color = palette.correct;
    if (progress < 0.25) color = palette.wrong;
    else if (progress < 0.55) color = palette.gold;

    return (
        <div
            style={{
                position: "absolute",
                top: 1710,
                left: 50,
                width: 980,
                height: 18,
                borderRadius: 9,
                backgroundColor: "rgba(0,0,0,0.5)",
                opacity: Math.max(0, opacity),
            }}
        >
            <div
                style={{
                    width: `${progress * 100}%`,
                    height: "100%",
                    backgroundColor: color,
                    borderRadius: 9,
                    boxShadow: `0 0 10px ${color}`,
                    transition: "width 0.1s linear"
                }}
            />
            {progress > 0 && (
                <div style={{
                    position: 'absolute',
                    left: `calc(${progress * 100}% - 12px)`,
                    top: -3,
                    width: 24,
                    height: 24,
                    backgroundColor: 'white',
                    borderRadius: '50%',
                    boxShadow: `0 0 15px white`
                }} />
            )}
        </div>
    );
};
