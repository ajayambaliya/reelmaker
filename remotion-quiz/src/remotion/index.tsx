import React, { useEffect, useState } from "react";
import {
    AbsoluteFill,
    Audio,
    Sequence,
    delayRender,
    continueRender,
    staticFile,
    random,
} from "remotion";
import { QuestionSegment } from "./QuestionSegment";
import { Background } from "./Background";
import { F_INTRO, F_BASE_TOTAL } from "./Constants";
import { loadFont as loadHindVadodara } from "@remotion/google-fonts/HindVadodara";
import { loadFont as loadMontserrat } from "@remotion/google-fonts/Montserrat";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

loadHindVadodara("normal", {
    weights: ["400", "600"],
    subsets: ["gujarati", "latin"],
    ignoreTooManyRequestsWarning: true
});
loadMontserrat("normal", {
    weights: ["500", "800"],
    subsets: ["latin"],
    ignoreTooManyRequestsWarning: true
});
loadInter("normal", {
    weights: ["400", "600"],
    subsets: ["latin"],
    ignoreTooManyRequestsWarning: true
});

export interface ReelData {
    meta: any;
    reel_config: any;
    questions: any[];
}

export const QuizReel: React.FC<{ reelIndex: number }> = ({ reelIndex }) => {
    const [handle] = useState(() => delayRender());
    const [data, setData] = useState<ReelData | null>(null);

    useEffect(() => {
        fetch(staticFile("data.json"))
            .then((res) => res.json())
            .then((json) => {
                setData(json);
                continueRender(handle);
            })
            .catch((err) => {
                console.error("Error loading data:", err);
            });
    }, [handle]);

    if (!data) {
        return null;
    }

    // Filter and parse questions
    const rawQuestions = data.questions.filter((q) => q.reel_index === reelIndex);
    rawQuestions.sort((a, b) => a.position_in_reel - b.position_in_reel);

    // The music files
    const musicFiles = [
        "delosound-background-music-upbeat-405218.mp3",
        "delosound-inspiring-motivation-music-374880.mp3",
        "kornevmusic-upbeat-happy-corporate-487426.mp3",
        "paulyudin-motivational-485930.mp3",
        "tatamusic-energetic-upbeat-background-music-377668.mp3",
        "the_mountain-background-music-159125.mp3"
    ];
    const audioIndex = Math.floor(random(`audio-${reelIndex}`) * musicFiles.length);

    return (
        <AbsoluteFill className="bg-black font-sans text-white">
            <Background reelIndex={reelIndex} />

            {rawQuestions.map((q, i) => {
                const isFirst = i === 0;
                const startFrame = isFirst ? 0 : F_INTRO + (i - 1) * F_BASE_TOTAL;
                const duration = isFirst ? F_INTRO + F_BASE_TOTAL : F_BASE_TOTAL;

                return (
                    <Sequence
                        key={q.question_number}
                        from={startFrame}
                        durationInFrames={duration}
                    >
                        <QuestionSegment
                            question={q}
                            meta={data.meta}
                            reelIndex={reelIndex}
                            isLast={i === rawQuestions.length - 1}
                            isFirst={isFirst}
                        />
                    </Sequence>
                );
            })}

            {/* Persistent Audio Track */}
            <Audio
                src={staticFile(musicFiles[audioIndex])}
            />
        </AbsoluteFill>
    );
};
