import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import Watcher, { nextTick } from "./observe/watcher";

function Vue(options) { // options就是用户的选项
    this._init(options)
}

Vue.prototype.$nextTick = nextTick

initMixin(Vue)
initLifeCycle(Vue)

Vue.prototype.$watch = function (exprOrFn, cb) {
    // firstName
    // () => vm.firstName

    // firstName的值变换，直接执行cb函数
    new Watcher(this, exprOrFn, {
        user: true
    }, cb)
}

export default Vue