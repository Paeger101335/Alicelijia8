const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >

import { generate } from "../codegen/index";
function parseHTML(html) {
  let root;
  let currentParent;
  let stack = [];
  const ELEMENT_TYPE = 1;
  const TEXT_TYPE = 3;
  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: ELEMENT_TYPE,
      children: [],
      attrs,
      parent: null,
    };
  }
  function start(tagName, attrs) {
    let element = createASTElement(tagName, attrs);
    if (!root) {
      root = element;
    }
    currentParent = element;
    stack.push(element);
  }
  // 匹配到结束标签 让父以及子相互记住
  function end(tagName) {
    let element = stack.pop();
    currentParent = stack[stack.length - 1];
    if (currentParent) {
      element.parent = currentParent;
      currentParent.children.push(element);
    }
  }
  function chars(text) {
    text = text.replace(/\s/g, "");
    if (text) {
      currentParent.children.push({
        type: TEXT_TYPE,
        text,
      });
    }
  }

  while (html) {
    let textEnd = html.indexOf("<");
    if (textEnd == 0) {
      const startTagMatch = parseStartTag();
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs);
        continue;
      }
      const endTagMatch = html.match(endTag);
      if (endTagMatch) {
        advance(endTagMatch[0].length);
        end(endTagMatch[1]);
        continue;
      }
    }
    let text;
    if (textEnd >= 0) {
      // console.log("文本",text)
      text = html.substring(0, textEnd);
    }
    if (text) {
      advance(text.length);
      chars(text); //解析文本
    }
  }
  function advance(n) {
    html = html.substring(n);
  }
  function parseStartTag() {
    const start = html.match(startTagOpen);
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      };
      advance(start[0].length);
      let attr, end;
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        advance(attr[0].length);
        match.attrs.push({ name: attr[1], value: attr[3] });
      }
      if (end) {
        advance(end[0].length);
        return match;
      }
    }
  }
  // console.log("root",root)
  return root;
}
export function compileToFunctions(template) {
  let root = parseHTML(template);
  // 根据生成的AST,字符串拼接成对应的render函数
  let code = generate(root);
  // 需要将ast语法树生成最终的render函数;
  let render = `with(this){return ${code}}`;
  let renderFn = new Function(render);
  return renderFn;
}
// 所有的模板引擎的实现都需要new Function 以及 with
// 1.更加传入的template 通过parserHTML将 html转换成 AST
// 生成AST的过程
// render函数将AST再次转换成js的过程
// _c(
//   "div",
//   { id: "app" },
//   _c("p", undefined, _v("hello" + _s(name)), _v("hello"))
// );
