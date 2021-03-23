let id = 0;

class Dep {
  constructor() {
    this.id = id++;
    this.subs = [];
  }
  // 用观察者模式
  depend() {
    if (Dep.target) {
      // this.subs.push(Dep.target);
      Dep.target.addDep(this); // 让watcher,去存放dep
      // 让当前的watcher记住当前的dep
    }
  }
  notify() {
    console.log("dep-notify", this.subs);
    this.subs.forEach((watcher) => {
      console.log("watcher-update", watcher);
      watcher.update();
    });
  }
  addSub(watcher) {
    this.subs.push(watcher);
  }
}
let stack = [];
export function pushTarget(watcher) {
  Dep.target = watcher;
  stack.push(watcher);
  console.log("stack", Dep.target, stack);
}
export function popTarget() {
  stack.pop();
  Dep.target = stack[stack.length - 1];
}
export default Dep;
