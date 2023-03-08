// 就是给Vue增加init方法
import { initState } from "./state";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) { // 进行初始化操作

        // vue vm.$options 获取用户自身的配置
        const vm = this
        vm.$options = options

        // 初始化状态
        initState(vm)
    }
}
