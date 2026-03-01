import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { PALETTES } from "./Constants";

export const Background: React.FC<{ reelIndex: number }> = ({ reelIndex }) => {
    const frame = useCurrentFrame();
    const palette = PALETTES[reelIndex % 4];

    // Slow Background Parallax Translation Y
    const parallaxY = interpolate(frame, [0, 600], [0, -150]);

    // Light Sweep every 2 seconds (60 frames). 20px width rotating.
    const sweepProgress = (frame % 60) / 60;
    const sweepLeft = interpolate(sweepProgress, [0, 1], [-200, 1300]);

    return (
        <AbsoluteFill style={{ overflow: "hidden" }}>
            {/* Dark Parallax Gradient */}
            <AbsoluteFill
                style={{
                    height: "120%",
                    transform: `translateY(${parallaxY}px)`,
                    background: `linear-gradient(180deg, ${palette.bgTop} 0%, ${palette.bgMid} 50%, ${palette.bgBot} 100%)`,
                }}
            />

            {/* Light Sweep Effect */}
            <div
                style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: sweepLeft,
                    width: 300,
                    background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.03), transparent)`,
                    transform: "skewX(-20deg)",
                    filter: "blur(20px)"
                }}
            />
        </AbsoluteFill>
    );
};
