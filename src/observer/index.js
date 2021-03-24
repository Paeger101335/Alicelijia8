import { arrayMethods } from "./Array";
import Dep from "./dep";
class Observer {
  constructor(value) {
    this.dep = new Dep();
    value.__ob__ = this;
    // 被劫持过的属性都有__ob__
    Object.defineProperty(value, "__ob__", {
      enumerable: false,
      configurable: false,
      value: this,
    });
    if (Array.isArray(value)) {
      // 重写value的原型，进行劫持
      value.__proto__ = arrayMethods;
      // 如果数组中的数据是对象类型的，需要监控对象的变化
      this.observeArray(value);
    } else {
      this.walk(value);
    }
  }
  walk(data) {
    let keys = Object.keys(data);
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      let value = data[key];
      defineReactvie(data, key, value);
    }
  }
  // 监控数组对象里面的对象,如果数组里面仍然有对象需要进行进一步的观测
  observeArray(value) {
    // console.log("value", value);
    value.forEach((item) => {
      observe(item);
    });
  }
}
function defineReactvie(data, key, value) {
  let dep = new Dep();
  // 此处value可能是{}/[]，返回的结果是observer的实例，当前的value对应的observer
  let childOb = observe(value);
  // ************************
  Object.defineProperty(data, key, {
    get() {
      // console.log("获取值");
      if (Dep.target) {
        // 意味着我要将waterh存起来，需要将属性对应的watcher存储起来
        dep.depend();
        // 数组的依赖
        if (childOb) {
          childOb.dep.depend();
          if (Array.isArray(value)) {
            dependArray(value);
          }
        }
        // console.log("dep", dep.subs);
      }
      return value;
    },
    set(newVal) {
      if (newVal == value) return;
      //防止用户输入的newVal为对象类型，vm._data.school.mid = {name:"bobo"}
      // console.log("取值", dep);
      observe(newVal);
      value = newVal;
      // 如果用户赋值为一个新对象，需要将这个对象进行劫持

      // 通知依赖的watcher进行更新操作
      dep.notify();
    },
  });
}
function dependArray(value) {
  for (let i = 0; i < value.length; i++) {
    let current = value[i];
    if (Array.isArray(current)) {
      current.__ob__ && current.__ob__.depend();
      dependArray(current);
    }
  }
}
export function observe(data) {
  if (typeof data !== "object" || typeof data == null) {
    return;
  }
  // 如果数据被观测过了，则无需再观测了
  if (data.__ob__) {
    return;
  }
  return new Observer(data);
}
