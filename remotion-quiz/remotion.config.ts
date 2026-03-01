// remotion.config.ts
import { Config } from "@remotion/cli/config";
import TerserPlugin from "terser-webpack-plugin";

Config.overrideWebpackConfig((config) => {
    return {
        ...config,
        optimization: {
            ...config.optimization,
            minimizer: [new TerserPlugin({ minify: TerserPlugin.terserMinify })],
        },
    };
});
