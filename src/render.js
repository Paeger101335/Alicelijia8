import { createElement, createTextNode } from "./vdom/create-element";
// _c 创建元素的虚拟节点
// _v创建文本的虚拟节点
// _s JSON.stringify()
export function renderMixin(Vue) {
  Vue.prototype._c = function () {
    // 创建元素
    return createElement(...arguments);
  };
  Vue.prototype._v = function (text) {
    // 创建文本
    return createTextNode(text);
  };

  Vue.prototype._s = function (val) {
    // 如果取不到不能在页面显示null
    return val == null
      ? ""
      : typeof val === "object"
      ? JSON.stringify(val)
      : val;
  };
  Vue.prototype._render = function () {
    // console.log("render", render);
    const vm = this;
    const { render } = vm.$options;
    // console.log("render", render);
    // 调用render生成vnode
    let vnode = render.call(this);
    return vnode;
  };
}
