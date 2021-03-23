import babel from "rollup-plugin-babel";
import serve from "rollup-plugin-serve";
export default {
  input: "src/index.js",
  output: {
    file: "dist/umd/vue.js",
    name: "Vue",
    format: "umd",
    sourcemap: true,
  },
  plugins: [
    // 使用babel进行转化,但是排除node_modules下的文件
    babel({
      exclude: "node_modules/**",
    }),
    process.env.ENV === "development"
      ? serve({
          open: true,
          openPage: "/public/index.html",
          port: 3000,
          contentBase: "",
        })
      : null,
  ],
};
// 需要打包不同的类型，可以写个列表循环打包针对不同的环境
