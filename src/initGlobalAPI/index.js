import { mergeOptions } from "../util.js";

export function initGlobalAPI(Vue) {
  // 整合了所有全局相关的内容
  Vue.options = {};
  Vue.minxin = function (mixin) {
    this.options = mergeOptions(this.options, mixin);
  };
  // 生命周期的合并 [beforeCreated,beforeCreated]
  Vue.minxin({
    a: 1,
    beforeCreate() {
      // console.log("global-hook", 1);
    },
  });
  Vue.minxin({
    b: 2,
    beforeCreate() {
      // console.log("global-hook", 2);
    },
  });
  // console.log(Vue.options);
  return this;
}
