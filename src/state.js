import { observe } from "./observer/index.js";
import { isFunction } from "./util";
export function initState(vm) {
  const opts = vm.$options;
  // 根据用户传入的不同的属性，进行初始化操作，如initData
  if (opts.data) {
    initData(vm);
  }
  if (opts.props) {
    initProps(vm);
  }
  if (opts.methods) {
    initMethod(vm);
  }
  if (opts.computed) {
    initComputed(vm);
  }
  if (opts.watch) {
    initWatch(vm);
  }
}
function initProps() {}
function initMethod() {}
function initData(vm) {
  let data = vm.$options.data;
  // 将vm实例上挂载上_data,并且如果data为函数则调用data
  data = vm._data = isFunction(data) ? data.call(vm) : data;
  // 对data进行一层代理 vm._data
  // 用户去vm.name取值类似于去vm._data.name上取值
  for (let key in data) {
    proxy(vm, "_data", key);
  }
  observe(data);
}
function proxy(vm, source, key) {
  Object.defineProperty(vm, key, {
    get() {
      // vm._data.name
      return vm[source][key];
    },
    set(newVal) {
      vm[source][key] = newVal;
    },
  });
}
function initComputed() {}
function initWatch() {}
// export default initState;
