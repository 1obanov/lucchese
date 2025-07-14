import vituum from "vituum";
import liquid from "@vituum/vite-plugin-liquid";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";

export default {
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
      symbolId: "icon-[name]"
    }),
    vituum(),
    liquid({
      root: "./src",
    }),
  ],
};
