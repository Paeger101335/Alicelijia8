// 如果没有属性，则默认为空属性
export function createElement(tag, data = {}, ...children) {
  let key = data.key;
  if (key) {
    delete data.key;
  }
  return vnode(tag, data, key, children);
}
export function createTextNode(text) {
  // console.log(text);
  return vnode(undefined, undefined, undefined, undefined, text);
}
//虚拟节点就是通过 _c _v实现对象来描述dom的操作 （对象）
function vnode(tag, data, key, children, text) {
  return {
    tag,
    data,
    key,
    children,
    text,
  };
}

// 1. 将template转换为AST
// 2. 将AST生成render方法
// 3. 将render生成虚拟的dom(即对象的描述)
// 4. 根据虚拟dom生成真实的dom
// {
//   tag:"div",
//   key:'undefined',
//   data:{},
//   children:[],
//   text:undefined,
// }
