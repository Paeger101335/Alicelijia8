export function isFunction(val) {
  return typeof val === "function";
}
export const LIFECYCLE_HOOKS = [
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
      // 旧的没有，新的需要变为数组
      return [childVal];
    }
  } else {
    // 没有新的用老的
    return parentVal;
  }
}
LIFECYCLE_HOOKS.forEach((hook) => {
  strats[hook] = mergeHook;
});
// {data:{}} // {data:{}}
export function mergeOptions(parent, child) {
  // 1. 父有儿没有
  const options = {};
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
    if (strats[key]) {
      return (options[key] = strats[key](parent[key], child[key]));
    }
    if (typeof parent[key] == "object" && typeof child[key] == "object") {
      options[key] = {
        ...parent[key],
        ...child[key],
      };
    } else if (child[key] == null) {
      // 儿子没有则以父为准
      options[key] = parent[key];
    } else if (parent[key] == null) {
      // 父没有以子为准
      options[key] = child[key];
    }
  }
  return options;
}
