import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { compileToFunction } from "./compiler/index";
import {createElm, patch} from "./vdom/patch";
import {initGlobalAPI} from "./globalAPI";

function Vue(options) { // options就是用户的选项
    this._init(options)
}


initMixin(Vue) // 扩展init
initLifeCycle(Vue)
initStateMixin(Vue) // 实现nextTick和 $watch
initGlobalAPI(Vue)

export default Vue