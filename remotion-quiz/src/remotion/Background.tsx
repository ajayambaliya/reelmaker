import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { PALETTES } from "./Constants";

export const Background: React.FC<{ reelIndex: number }> = ({ reelIndex }) => {
    const frame = useCurrentFrame();
    const palette = PALETTES[reelIndex % 4];

    const pulse1 = 0.8 + 0.2 * Math.sin(frame * 0.05);
    const pulse2 = 0.8 + 0.2 * Math.sin(frame * 0.03 + 2.0);
    const pulse3 = 0.8 + 0.2 * Math.sin(frame * 0.04 + 4.0);

    return (
        <AbsoluteFill
            style={{
                background: `linear-gradient(to bottom, ${palette.bgTop}, ${palette.bgBot})`,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: "10%",
                    right: "-10%",
                    width: "600px",
                    height: "600px",
                    background: `radial-gradient(circle, ${palette.glow} ${Math.floor(60 * pulse1)}%, transparent 70%)`,
                    filter: "blur(100px)",
                    opacity: 0.6,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    bottom: "10%",
                    left: "-20%",
                    width: "800px",
                    height: "800px",
                    background: `radial-gradient(circle, ${palette.accent} ${Math.floor(50 * pulse2)}%, transparent 70%)`,
                    filter: "blur(120px)",
                    opacity: 0.4,
                }}
            />
            <div
                style={{
                    position: "absolute",
                    top: "40%",
                    left: "20%",
                    width: "500px",
                    height: "500px",
                    background: `radial-gradient(circle, ${palette.glow} ${Math.floor(50 * pulse3)}%, transparent 70%)`,
                    filter: "blur(80px)",
                    opacity: 0.25,
                }}
            />

            {/* Simple Star Particles */}
            {Array.from({ length: 50 }).map((_, i) => {
                const x = ((Math.sin(i * 12345) + 1) / 2) * 1080;
                const y = ((Math.cos(i * 54321) + 1) / 2) * 1920;
                const s = ((Math.sin(i * 888) + 1) / 2) * 3 + 1;

                // Make them pulse slightly based on frame
                const opacity = 0.3 + 0.5 * ((Math.sin(frame * 0.02 + i) + 1) / 2);

                return (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: x,
                            top: y,
                            width: s,
                            height: s,
                            backgroundColor: "white",
                            borderRadius: "50%",
                            opacity,
                            boxShadow: `0 0 ${s * 2}px rgba(255,255,255,${opacity})`,
                        }}
                    />
                );
            })}
        </AbsoluteFill>
    );
};
