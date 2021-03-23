const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
function gen(node) {
  if (node.type == 1) {
    // 只要是元素则递归解析
    return generate(node);
  } else {
    // node.type == 2文本节点
    let text = node.text;
    // 如果为类似于a b与c的文本 --- a {{name}} b {{age}}  c
    // "a" + _s(name) +"b" + _s(age)+"c"
    if (!defaultTagRE.test(text)) {
      return `_v(${JSON.stringify(text)})`;
    }
    // let reg = /a/g ; a.match("abc")
    // 只要是全局匹配，每次匹配都需要将lastIndex调为0
    let lastIndex = (defaultTagRE.lastIndex = 0);
    let tokens = [];
    let match, index;
    // 如果匹配到了，匹配不捕获
    while ((match = defaultTagRE.exec(text))) {
      // console.log("match", match);
      index = match.index;
      // console.log("lastIndex", lastIndex);

      if (index > lastIndex) {
        // 给字符串加上双引号
        tokens.push(JSON.stringify(text.slice(lastIndex, index)));
      }
      tokens.push(`_s(${match[1].trim()})`);
      lastIndex = index + match[0].length;
    }
    // 最后一个 c匹配不到
    if (lastIndex < text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)));
    }
    // console.log("tokens", tokens);
    return `_v(${tokens.join("+")})`;
  }
}
// 生成儿子节点
function getChildren(el) {
  // console.log("child", child);
  const children = el.children;
  if (children) {
    return `${children.map((c) => gen(c)).join(",")}`;
  } else {
    return false;
  }
}

// 生成属性
function genProps(attrs) {
  // 生成属性

  let str = "";
  for (let i = 0; i < attrs.length; i++) {
    let attr = attrs[i];
    if (attr.name === "style") {
      let obj = {};
      attr.value.split(";").forEach((item) => {
        let [key, value] = item.split(":");
        obj[key] = value;
      });
      attr.value = obj;
    }
    str += `${attr.name}:${JSON.stringify(attr.value)},`;
  }
  return `{${str.slice(0, -1)}}`;
}

export function generate(el) {
  // console.log("el", el);
  let children = getChildren(el);
  let code = `_c('${el.tag}',${
    el.attrs.length ? `${genProps(el.attrs)}` : "undefined"
  }${children ? `,${children}` : ""})`;
  console.log("code", code);
  return code;
}
