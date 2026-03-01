import "./index.css";
import { Composition } from "remotion";
import { QuizReel } from "./remotion/index";
import { F_INTRO, F_BASE_TOTAL } from "./remotion/Constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="QuizReel0"
        component={QuizReel}
        durationInFrames={F_INTRO + (F_BASE_TOTAL * 5)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          reelIndex: 0,
        }}
      />
      <Composition
        id="QuizReel1"
        component={QuizReel}
        durationInFrames={F_INTRO + (F_BASE_TOTAL * 5)}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          reelIndex: 1,
        }}
      />
    </>
  );
};
