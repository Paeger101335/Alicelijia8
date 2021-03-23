# Vue核心原理

## 一、使用Rollup搭建开发环境

### 1.什么是rollup

> rollup是js的模块打包器，将小块代码编译成大块复杂的代码，rollup更专注于js的类库打包

### 2.安装rollup环境

### 2.1按照rollup环境

> npm install @babel/preset-env @babel/core rollup rollup-pluginbabel rollup-plugin-serve cross-env -D

#### 2.2rollup.config.js配置

```javascript
import babel from "rollup-plugin-bable";
import serve from "rollup-plugin-serve";
export default {
    input:"./src/index.js",
    output:{
        format:"umd",//模块化的类型
        file:"dist/umd/vue.js",//打包后的变量名字
        name:"Vue",//打包后的变量名为
        sourcemap:true,
    },
    plugins:[
        babel({
            exclude:"node_modules/**",
        }),
        process.env.ENV === "development" ? serve({
            open:true,
            openPage:"/public/index.html",
		   port:"3000",
            contentBase:"",
        })
    ]
}
```

#### 2.3配置  .babelrc 文件

```javascript
{
    "presets":[
        "@babel/preset-env"
    ]
}
```

#### 2.4配置执行脚本

```javascript
"scripts":{
    "build:dev": "rollup -c",
    "serve": "cross-env ENV=development rollup -c -w"
}
```

## 二、Vue响应式原理

### 1.导出Vue构造函数

为了避免全部写在一个文件，方便文件的管理

```javascript
function Vue(options){
    // 此处Vue的原型上没有init方法为什么可以调用？？
    this._init(options);
}
initMixin(Vue);
//导出为浏览器可用的es6 Module
export default Vue;
```

### 2.使用init方法初始化`vue`状态`initState(vm);`

```javascript
export function initMixin(Vue){
    // 解答上面的Vue原型上没有init方法为何可以调用
    Vue.portotype.init = function(options){
        let vm = this;
        vm.$options = options;
        initState(vm);
    }
}

```

### 3.根据不同的属性初始化操作,在state.js中

> 初始化 data、 props 、methods、computed、watch

```javascript
import { observe } from  "./observe/index.js";
export function initState(vm){
    const opts = vm.$options;
    if(opts.data){
        initData(vm)
    }
    if(opts.props){
        initProps(vm);
    }
    if(opts.computed){
        initComputed(vm)
    }
    if(opts.watch){
        initWatch(vm)
    }
    if(opts.methods){
        initMethods(vm)
	}
}
```

### 4.初始化数据,在state.js中

> 注意点主要在于：如果data为函数，则需要改this指向并调用该函数 `data.call(vm)`, 

```javascript
`记住：data(){}为函数一定要return 一个对象`
`在mv实例上挂载上_data`
function initData(vm){
    let data = vm.$options.data;
    data = vm._data = typeof data === "function" ? data.call(vm):data;
    //将data数据进行观察（也就是数据双向绑定）
    observe(data);
}
```

### 重点：defineReactvie

```javascript
function defineReactvie(data,key,value){
    //递归对数据进行劫持
    obserer(value);
    Object.defineProperty(data,key,{
        get(){
            return value;
        }
        set(newvalue){
        	// 如果赋的新值仍是对象则，继续观察
        	observer(value)
		   value = newvalue
        	return value;
    	}
    })
}
```



### 5.递归属性劫持

```javascript
class Observer{
    constructor(value){
        this.walk(value);
    }
    // 让对象上所有的属性因此进行观测
    walk(data){
        let keys = Object.keys(data);
		for(let i= 0; i < keys.length; i++){
            let key = keys[i];
		   let value = data[key];
            defineReactive(data,key,value)
        }
    },    
}
function defineReactive(data,key,value){
	Object.defineProperty()        
}
export function observe(data){
    if(typeof data !== "object" || typeof data == null) return;
	return new Observer(data);
}
```



### 6.数组方法的劫持 && 重写数组原型方法

> 由于一般不会通过arr[7] = "value"， 考虑到数组的量很大而且每个key都增加get() 与 set() ，非常的耗费性能
>
> 实现方案：`重写数组的原型链，让增加的的重新增加数据劫持，数组原有的方法，改变当前this指针的调用`

```javascript
const oldArrayMethods = Array.prototype;
// 让新的arrayMethods
export const arrayMethods = Object.create(oldArrayMethods);
const ARRAY_METHODS = [
    "push",
    "pop",
    "unshift",
    "shift",
    "sort",
    "reverser",
    "slice"
];
//遍历当前的改变数组的方法
ARRAY_METHODS.forEach(item => {    
    // 此处不能用箭头函数，无this
    // 改变arrayMethods里面的方法的
    arrayMethods[method] = arrayMethods.forEach(function (...args)  {
        const ob = this.__ob__;
        // 改变原型链原有的数组的调用指向
        const result = oldArrayMethods[method].apply(this,args);
        let inserted = null;//定义新增的数据
        switch(method){
             case "push":
                case "unshift":                
                inserted = args;
             break;
             case "splice":
                inserted = args.slice(0,2)
             break:                
             default:
             break;
        }
        if(inserted){
			// 对新增数据进行劫持
            ob.observeArray(inserted)
        }
	})
})
```

### 7.增加__ob__属性

> 在数组里面对数据进行劫持的时候，如何获取到observeArray,这个方法?? ,尤大大用了一个比较hack的写法，在Observer的原型上

```javascript
import { arrayMethods } from "./Array";// 对数组的原型链进行重写劫持
class Observer {
    constructor(value){
        // 给当前的劫持对象，添加__ob__属性，这样在原型链式就可以访问的到
        value.__ob__ = this;
        // 由于是能被劫持的都是 typeof === 'object' 的，如果value.__ob__如  hobbies: [{ like: "打多多" }],则会一直递归的劫持，去原型链上
        // 此处如果不作处理，会产生堆栈溢出
        Object.defineProperty(value,"__ob__",{
            enumerable:false,
            configurable:false,
            vulue:this,
        })
        // 此处对数组以及对象分别进行不同的劫持方法
        if(Array.isArray(value)){
            // 对数组的原型链进行劫持
            Array.prototype = ArrayMethods;
        }else {
            
        }
    }
    //监控数组对象里面的对象，如果数组对象里面仍然有对象需要进一步的观测
    observerArray(value){
        value.forEach(item =>{
            // observer里面会对类型进行进一步的判断，如果为普通对象，则return 掉
            observer(item);
        })
    }
     // 让对象上所有的属性因此进行观测
    walk(data){
        let keys = Object.keys(data);
        /*变量对象里面的值，进行拦截*/
    }
}
```

### 8.数据代理

> 每次用户获取数据都需要从 vm._data.arr 上获取，如果希望从vm.arr直接读取，则需要将vm._data进行数据的劫持

```javascript
// 在state.js中
function initData(vm){
    let data = vm.$options.data;
    data = vm._data = isFunction(data) ? data.call(vm) : data;
    for(let key in data){
        proxy(vm, "_data",key);
    }
    observe(data);
}
function proxy(vm,source,key){
    Object.defineProperty(vm,source,{
        get(){
            return vm[source];//即 访问 vm.arr 实际上 访问的是 vm._data.arr
        }
        set(newVal){
        	vm[source][key] = newVal;
    	}
    })
}
```

## 三、模板编译

>  页面挂载，如果页面用户传入了 el, 则需要手动的帮助用户挂载

1.  将 template 通过parseHTML 转换AST 语法树
2. 将 AST 通过generator 转换成 模板字符串
3.  将模板字符串转换成 render函数
4. 将render函数生成虚拟dom
5. 将虚拟dom生成真实的dom

### 1.将 template 通过parseHTML 转换AST 语法树

希望通过parseHtml实现

![html](E:\zhufeng\vue-yuan-ma\vue_source_code\image\html.png)

实现： AST语法树图

![AST语法树](E:\zhufeng\vue-yuan-ma\vue_source_code\image\root.png)

#### 实现步骤

- 通过正则匹配 到当前的标签，属性、文本、结束标签

- 对匹配到的开始标签 + 属性通过start 、文本通过chars、结束标签通过end进行转换

- 通过createASTElement，将html 转换成AST语法树的描述

- 将AST语法树的内容通过codegen，也就是generator生成render函数

- render函数 转换成 vnode, 也就是dom的描述对象，俗称虚拟dom

- 第一次将虚拟dom替换为真实的dom, 第二次是将上次的虚拟dom与本次的虚拟dom作比对，如果有差异则更新差异

  ```javascript
  _c('div',{id:"app",class:"myclass",style:{"color":" red"," font-size":" 14px"}},_v("hello"+_s(name)+_s(name)+_s(name)+_s(name)+_s(name)+_s(name)+_s(name)+_s(name)+_s(name)+_s(name)+_s(name)+_s(name)),_c('ul',undefined,_v(_s(hobbies)),_c('li',{id:"1"},_v(_s(school.mid))),_c('li',{id:"2"},_v(_s(school.high)))))
  ```

### 2.解析标签内容

#### parseHTML通过正则匹配对标签进行解析

```javascript
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;  
const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 标签开头的正则 捕获的内容是标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配标签结尾的 </div>
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的
const startTagClose = /^\s*(\/?)>/; // 匹配标签结束的 >
// 将用户传入的template做处理
function parseHTML(html){
    while(html){
        let textEnd = html.indexOf("<");//匹配到此符号有可能会是结束标签
        if(textEnd == 0){
            const startTagMatch = parseStartTag();
            if(startTagMatch){
                start(startTagMatch.tagName,startTagMatch.attrs);
                continue;
            }
            //如果是结束标签，？？？目前不知道场景
            const endTagMatch = html.match(endTag);
            if(endTagMatch){
                advance(endTagMatch[0].length);
                end(endTagMatch[1]);
                continue;
            }
        }
        // 开始标签与属性都切割完毕 `text <` 再开始切割匹配到的就是 文本到下一个开始或者结束标签
        let text ;
        if(textEnd >= 0){
		  // subString 是从0开始切割
            text = html.subString(0,textEnd)
        }
        if(text){
            advance(text.length);
            chars(text);
        }
    }
}
```

> 此处难一点的函数就是对开始标签进行处理

#### 对开始标签以及属性进行解析 parseStartTag

> 难点在于对属性，递归循环的处理放入一个指定的 match = { attrs: [] } attrs堆栈中

```javascript
function parseStartTag(){
    // 匹配到开始标签
    const start = html.match(startTagOpen);
    if(start){
        const match = [
            tagName:start[1],
            attrs: []
        ]
        advance(start[1]);// <div
        let attr ,end;
        // 如果不是end && 匹配到属性，则为属性
        while((!end = html.match(startTagClose)) && (attr = html.match(attribute))){
            advance(attr[0].length);// id = app "id" = "app" 'id'='app'
            //如上：属性分3种
            match.attrs.push({name:attr[1],value:attr[3] || value:attr[3]||value:attr[3]})
        }
    	if(end){
            advance(end[0].length);
            return match;
        }
    }
}
```

### 3.生成ast语法树

- 将切除好的开始标签与属性，调用start进行处理

- 实现思路：

  >  1 如果没有根元素，则将当前的标签作为root
  >
  >  2 为了让父记住子，子记住父，维护一个currentParent
  >
  > 3 维护一个所有的元素放入一个堆栈中

  

```javascript
let root;
let currentParent;
let stack = [];
const ELEMENT_TYPE   = 1;// 为元素节点
const TEXT_TYPE = 3;// 为文本节点
function createASTElement(tagName,attrs){
    return {
        tag: tagName,
        type:ELEMENT_TYPE,
        attrs,
        children:[],        
        parent:null
    }
}
function start(tagName, attrs) {
    let element = createASTElement(tagName,attrs);
    // 如果第一次进来没有根元素则让当前的元素作为根元素
    if(!root){
        root = element;
    }
    // 当前的父元素也为的 `element`
    currentParent = element;
    // 然后将当前元素放入堆栈中
    stack.push(element);
}
function chars(text) {
    text = text.replace(/\s/g,'');
    if(text){
        currentParent.children.push({
            type:TEXT_TYPE,
            text
        })
    }
}
function end(tagName) {
    // 如果匹配到结束标签，则与队尾的的元素进行比较 [div, ul,li, li ],检测用户的标签是否书写合格
    // 取出队尾的元素 如 div > ul > <li></li> <li></li> ,匹配到第一个结束标签的就是第一个li,pop会改变原数组，所以：
    let element = stack.pop();
    currentParent = stack[stack.length-1];
    if(currentParent){
        // 所以：当前元素的父元素就是队尾元素 stack[stack.length-1]，也就是它未pop之前的上一个
        element.parent = currentParent;
        currentParent.children.push(element);
    }
}
```

#### 即生成后AST目前只包含5个属性

```javascript
{tag: "div", type: 1, children: Array(2), attrs: Array(3), parent: null}
	attrs: Array(3)
	0: {name: "id", value: "app"}
	1: {name: "class", value: "myclass"}
	2: {name: "style", value: {…}}
children: Array(2)
	0: {type: 3, text: "hello{{name}}{{name}}{{name}}{{name}}{{name}}{{nam…}{{name}}{{name}}{{name}}	{{name}}{{name}}{{name}}"}
	1:attrs: []
children: Array(3)
	0: {type: 3, text: "{{hobbies}}"}
	1: {tag: "li", type: 1, children: Array(1), attrs: Array(1), parent: {…}}
	2: {tag: "li", type: 1, children: Array(1), attrs: Array(1), parent: {…}}
	length: 3
	__proto__: Array(0)
parent: {tag: "div", type: 1, children: Array(2), attrs: Array(3), parent: null}
tag: "ul"
type: 1
parent: null
tag: "div"
type: 1
```

### 4.生成模板字符串并转化成render函数

```javascript
<div style="color:red">hello {{name}} <span></span></div>
render(){
    // _c 创建 元素 _v创建文本节点 _s JSON.stringify 
   return _c('div',{style:{color:'red'}},_v('hello'+_s(name)),_c('span',undefined,''))
}
```

#### 目前只对元素+ 文本进行解析

```javascript
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
//  text: "hello{{name}}{{name}}{{name}}{{name}}{{name}}{{nam…}{{name}}{{name}}{{name}}	{{name}}{{name}}{{name}}"}
function gen(node){
    if(node.type == 1){
        return generator(node)
    } else {
        // 对定义的文本进行处理
        let text = node.text;
        // 如果不是 {{ }} 我们定义的模板
        if(!defaultTagRE.text(text)){
             // 则就为文本节点，需要用_v
            return `_v(${JSON.stringify(text)})`
        }
        // 解决JS正则的bug,匹配一次可以匹配到，再次匹配就匹配不到了
        let lastIndex = defaultTagRE.lastIndex = 0;
        // 将所有的文本，都放入一个容器，最后用 join("+")起来
        let tokens = [];
		// 递归循环的匹配 我们定义的 {{ 插值表达式}},并用 _s 包裹
        // 也就是JSON.stringify(value) ,具备取值的功能，所以此处 _s(name),即可获得更新后的name
        // 正则 exec 是个啥？？？？
        while (match = defaultTagRE.exec(text)) {
            index = match.index;//匹配到了
            if(index > lastIndex){
                tokens.push(JSON.stringify(text.slice(lastIndex,index)));
            }
            tokens.push(`_s(${match[1].trim()})`)
            // 下一次开始匹配的位置
            lastIndex = index + match[0].length;
        }
        //解决
    }
}
```

![](E:\zhufeng\vue-yuan-ma\vue_source_code\image\tokens.png)

#### 通过generator将代码生成

```javascript
function generate(el) {
    // 将孩子属性区分开来
    let children = getChildren(el);
    let code = `_c('${el.tag}',${
        el.attrs.length?`${genProps(el.attrs)}`:'undefined'
    }${
        children? `,${children}`:''
    })`;
    return code;
}
let code = generate(root);
```

#### getChildren



#### genProps

### 5.生成`vnode`虚拟dom

![](E:\zhufeng\vue-yuan-ma\vue_source_code\image\虚拟dom.png)

### 6. 转换成真实的dom, 也就是数据更新后的dom

![](E:\zhufeng\vue-yuan-ma\vue_source_code\image\真实dom.png)



## 四、创建渲染watcher

### 1.初始化渲染Watcher

### 2.生成虚拟`dom`

### 3.生成真实`DOM`元素

### 4.

## 五、生命周期的合并

### 1.Mixin原理

### 2.合并生命周期

### 3.4.调用生命周期

### 4.初始化流程中调用生命周期

## 六、依赖收集



## 七、实现Vue异步更新之nextTick

