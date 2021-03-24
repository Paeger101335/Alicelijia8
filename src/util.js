 function isFunction(val) {
  return typeof val === "function";
}
 const LIFECYCLE_HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "update",
  "beforeDestory",
  "destoryed",
];
// 针对不同的策略不同的方法
const strats = {};
function mergeHook(parentVal, childVal) {
  if (childVal) {
    if (parentVal) {
      // 新旧都有
      return parentVal.concat(childVal);
    } else {
      // 第一次parentVal默认是空对象，第一次已经将childVal变为数组
      return [childVal];
    }
  } else {
    // 没有新的用老的
    return parentVal;
  }
}
// strats = {
//   beforeCreate:mergeHook()
// }
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook;
});
// {data:{}} // {data:{}}
 function mergeOptions(parent, child) {
  // 1. 初始化父为空
  const options = {};
  // 父有儿没有
  for (let key in parent) {
    mergeField(key);
  }
  //儿有父没有
  for (let key in child) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key);
    }
  }
  // 父子都有
  function mergeField(key) {
    // 默认的合并策略 但是有些属性 需要有特殊的合并方式 如生命周期的合并
    let parentVal = parent[key];
    let childVal = child[key]
    // 策略模式，如果用if else 判断太对了
    if (strats[key]) { // 如果有对应的策略采用对应的策略
    //  strats[key](parentVal,childVal) 实际上调用的是mergeHook()
      return (options[key] = strats[key](parentVal,childVal));
    }
    if (typeof parentVal == "object" && typeof childVal == "object") {
      options[key] = {
        ...parentVal,
        ...childVal,
      };
    } else if (childVal == null) {
      // 儿子没有则以父为准
      options[key] = parentVal;
    } else if (parent[key] == null) {
      // 父没有以子为准
      options[key] = child[key];
    }
  }
  return options;
}

