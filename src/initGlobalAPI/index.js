import { mergeOptions } from "../util.js";

// VUe.mixin是在实例上 扩展的方法
export function initGlobalAPI(Vue) {
  // 用户存放全局属性的,每个组件初始化的时候都会和options选项进行合并
  // Vue.component
  // Vue.filter
  // Vue.directive
  // 整合了所有全局相关的内容
  Vue.options = {};
  Vue.minxin = function (mixin) {
    // console.log("mixin",mixin)
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
