import { initState } from "./state";
import { compileToFunctions } from "./compiler/index";
import { mountComponent, callHook } from "./lifecycle";
import { mergeOptions } from "./util";
export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this;
    // 将用户传递的与全局的进行合并 vm.constructor.options？？
    vm.$options = mergeOptions(vm.constructor.options, options);
    // vm.$options = options;
    // console.log("vm.$options", vm.$options);
    // 初始化状态用户所有属性的数据
    callHook(vm, "beforeCreate");
    initState(vm); //数据的劫持操作
    callHook(vm, "created");
    // 如果用户输入el,则自动调用$mount，否则需要用户手动调用
    if (vm.$options.el) {
      vm.$mount(vm.$options.el);
    }
    callHook(vm, "mounted");
  };
  Vue.prototype.$mount = function (el) {
    const vm = this;
    const options = vm.$options;
    // 获取用户传入的元素
    el = document.querySelector(el);
    // console.log("需要托管的元素", el);

    // 把模板转换成对应的渲染函数 =》 虚拟dom的概念 vnode => diff算法 更新虚拟dom => 产生真实的dom更新
    if (!options.render) {
      // 1 如果用户没有传入render
      let template = options.template;
      if (!template && el) {
        //3. 有el，取出outerHTML
        template = el.outerHTML;
        // console.log("template", el.outerHTML);
      }
      // 如果是template的写法，需要转换成render函数
      const render = compileToFunctions(template);
      // console.log("render", render);
      // 将替换好的模板替换到页面？？？
      options.render = render;
      // 渲染当前组件 挂载到这个组件上
      mountComponent(vm, el);
    }
    // console.log("options.render", options.render); //最终渲染时用的都是这个render方法
  };
}
