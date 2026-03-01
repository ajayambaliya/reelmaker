import React from "react";

export const GlassCard: React.FC<{
    children: React.ReactNode;
    width: number;
    height: number;
    top: number;
    left: number;
    baseColor: string;
    borderColor: string;
    opacity: number;
    scale?: number;
    flash?: boolean;
    boxShadow?: string;
}> = ({ children, width, height, top, left, baseColor, borderColor, opacity, scale = 1, flash = false, boxShadow }) => {
    return (
        <div
            style={{
                position: "absolute",
                top,
                left,
                width,
                height,
                opacity,
                transform: `scale(${scale})`,
                borderRadius: 30,
                backgroundColor: flash ? "rgba(255,255,255,0.8)" : `${baseColor}99`,
                border: `3px solid ${flash ? "white" : borderColor}`,
                boxShadow: boxShadow || `0 25px 50px -12px rgba(0,0,0,0.8)`,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                padding: "30px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                zIndex: 10,
                overflow: "visible", // for top light streak
            }}
        >
            {/* Top light reflection */}
            {!flash && (
                <div
                    style={{
                        position: "absolute",
                        top: 2,
                        left: 2,
                        right: 2,
                        height: 25,
                        borderRadius: "26px 26px 0 0",
                        background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)",
                        pointerEvents: "none",
                    }}
                />
            )}
            {children}
        </div>
    );
};
