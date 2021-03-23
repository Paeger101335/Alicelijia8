// push shift unshift pop reverse sort splice这7个方法可能更改原数组

const oldArrayProtoMethods = Array.prototype;
export const arrayMethods = Object.create(oldArrayProtoMethods);

const methodsToPathch = [
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
];

methodsToPathch.forEach((method) => {
  // 如果此处用箭头函数，无arguments对象
  arrayMethods[method] = function (...args) {
    // console.log("调用了push");
    // 根据当前的this数组获取到observe实例
    const ob = this.__ob__;
    // console.group("ob", ob);
    const result = oldArrayProtoMethods[method].apply(this, args);
    let inserted;
    switch (method) {
      case "push":
      case "unshift":
        // console.log("新增的参数", args);
        inserted = args;
        break;
      case "splice":
        inserted = args.slice(0, 2);
      default:
        break;
    }
    // 需要对数组里面的每一项进行观测
    if (inserted) {
      // ob上有observeArray以及walk方法
      ob.observeArray(inserted);
    }
    // 用户调用push，我会通知当前的dep去更新
    ob.dep.notify();
    // ob.dep.nofity();
    return result;
  };
});
