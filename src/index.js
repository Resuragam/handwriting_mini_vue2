import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import { nextTick } from "./observe/watcher";

function Vue(options) { // options就是用户的选项
    this._init(options)
}

Vue.prototype.$nextTick = nextTick

initMixin(Vue)
initLifeCycle(Vue)
export default Vue