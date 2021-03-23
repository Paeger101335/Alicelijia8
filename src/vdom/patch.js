export function patch(oldVnode, vnode) {
  // console.log("vnode", oldVnode, vnode);
  // 如果有nodeType属性则为真实的dom
  const isRealElement = oldVnode.nodeType;
  if (isRealElement) {
    const oldElm = oldVnode;
    // 获取当前根元素的父节点
    const parentElm = oldElm.parentNode;
    // 根据vdom生成真是的dom
    let el = createElm(vnode);
    console.log("转换后的真实dom",el)
    // 插入根元素的 nextSibling
    parentElm.insertBefore(el, oldElm.nextSibling);
    // 移除旧节点
    parentElm.removeChild(oldVnode);
    return el;
  }
}

// ***将vdom生成真实的dom
// 创建vnode与真是dom的映射关系
function createElm(vnode) {
  let { tag, children, key, data, text } = vnode;
  if (typeof tag == "string") {
    // 根据当前的tag，创建真实的dom节点
    vnode.el = document.createElement(tag);
    children.forEach((child) => {
      // 递归的创建孩子节点，将儿子节点放入父节点中
      return vnode.el.appendChild(createElm(child));
    });
    // 根据属性对象描述生成真实的属性
    updateProperties(vnode);
  } else {
    vnode.el = document.createTextNode(text);
  }
  return vnode.el;
}

// 更新属性
function updateProperties(vnode) {
  let newProps = vnode.data || {}; // 获取当前老节点中的属性
  let el = vnode.el; // 当前的真实节点
  // console.log("newProps", newProps);
  const isHaveProp = Object.keys(newProps).length > 0;
  if (isHaveProp) {
    for (let key in newProps) {
      if (key == "style") {
        for (let styleName in newProps.style) {
          el.style[styleName] = newProps.style[styleName];
        }
        if (key == "class") {
          el.className = newProps.class;
        }
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }
}
