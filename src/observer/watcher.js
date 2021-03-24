let id = 0;
import { pushTarget, popTarget } from "./dep.js";
class Watcher {
  constructor(vm, exprOrFn, callback, options) {
    this.vm = vm;
    this.exprOrFn = exprOrFn;
    if (typeof exprOrFn == "function") {
      this.getter = exprOrFn;
    }
    this.cb = callback;
    this.options = options;
    this.id = id++;
    this.deps = [];
    this.depsId = new Set();
    //需将所有的变量的申明放到this.get的前面
    this.get();
  }
  // new Watcher则会让exprOrFn执行
  get() {
    // console.log("thisget", this.depsId);
    // 把当前的watcher存储
    pushTarget(this);
    this.getter(); //渲染watcher的执行
    popTarget();
  }
  update() {
    // 等待着，一起来更新，因为每次调用update的时候 都放入了watcher
    // console.log("this.id", this.id);
    this.get();
    // queueWatcher(this);
  }
  addDep(dep) {
    let id = dep.id;
    if (!this.depsId.has(id)) {
      this.depsId.add(id);
      this.deps.push(dep);
      dep.addSub(this);
    }
  }
  run() {
    this.get();
  }
}
let queue = [];
let has = {};
// 希望等同步代码执行完毕后再更新watcher
function queueWatcher(watcher) {
  const id = watcher.id;
  if (has[id] == null) {
    queue.push(watcher);
    setTimeout(() => {
      queue.forEach((watcher) => watcher.run());
      // 清空队列
      queue = [];
      has = {};
    }, 0);
  }
}
export default Watcher;
