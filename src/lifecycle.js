//Wacher 是用来渲染的
// vm._render通过解析render方法 渲染出虚拟dom _c _v _s
// vm._update 通过虚拟dom创建真是的dom
import Watcher from "./observer/watcher";
import { patch } from "./vdom/patch";
export function mountComponent(vm, el) {
  const options = vm.$options;
  vm.$el = el; //真实的dom
  // 无论是渲染还是更新都会调用此方法
  callHook(vm, "beforeMount");
  let updateComponent = () => {
    // 返回的是虚拟dom
    vm._update(vm._render());
  };
  // 渲染Watcher 每个组件都有一个Watcher,true表示渲染Watcher
  new Watcher(vm, updateComponent, () => {}, true);
  callHook(vm, "mounted");
}
// import { lifecycleMixin } from "./lifecycle";
// import { renderMixin } from "./render";
export function lifecycleMixin(Vue) {
  Vue.prototype._update = function (vnode) {
    // console.log("虚拟dom",vnode);
    const vm = this;
    // 用vnode,替换vm.$el真实的dom
    vm.$el = patch(vm.$el, vnode);
  };
}

export function callHook(vm, hook) {
  const handlers = vm.$options[hook];
  if (handlers) {
    for (let i = 0; i < handlers.length; i++) {
      handlers[i].call(vm);
    }
  }
}
