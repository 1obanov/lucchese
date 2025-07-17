import vituum from "vituum";
import liquid from "@vituum/vite-plugin-liquid";
import tailwindcss from "@tailwindcss/vite";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import path from "path";

export default ({ mode }) => ({
  base: mode === "development" ? "/" : "/lucchese/",
  plugins: [
    tailwindcss(),
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "public/assets/icons/icons-sprite")],
      symbolId: "icon-[name]",
    }),
    vituum(),
    liquid({
      root: "./src",
    }),
  ],
});
