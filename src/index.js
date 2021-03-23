import { initMixin } from "./init";
import { renderMixin } from "./render";
import { lifecycleMixin } from "./lifecycle";
import { initGlobalAPI } from "./initGlobalAPI/index";
function Vue(options) {
  this._init(options);
}
initMixin(Vue);
renderMixin(Vue);
lifecycleMixin(Vue);
// es6 Moduel必须要使用export default

// 初始化全局的api
initGlobalAPI(Vue);
export default Vue;
