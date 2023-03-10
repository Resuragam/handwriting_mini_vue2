// 就是给Vue增加init方法
import { initState } from "./state";
import { compileToFunction } from "./compiler/index";
import {callHook, mountComponent} from "./lifecycle";
import { mergeOptions } from "./utils";

export function initMixin(Vue) {
    Vue.prototype._init = function (options) { // 进行初始化操作

        // vue vm.$options 获取用户自身的配置
        const vm = this

        // 我们定义的全局指令和过滤器   都会挂载到实例对象上
        vm.$options = mergeOptions(this.constructor.options,options)

        // console.log(vm.$options)
        callHook(vm, 'beforeCreate')

        // 初始化状态,初始化计算属性
        initState(vm)

        callHook(vm, 'created')

        if(options.el) {
            vm.$mount(options.el)
        }
    }
    Vue.prototype.$mount = function (el) {
        const vm = this
        el = document.querySelector(el)

        let ops = vm.$options
        if(!ops.render) { // 先检查render函数
            let template  // 没有render函数就检查模板
            if(!ops.template && el) { // 检查el
                // 没有写模板，但是有el
                template = el.outerHTML
            }else {
                // 有el和模板
                if(el) {
                    template = ops.template
                }
            }
            if(template) {
                // 需要对模板进行编译
                const render = compileToFunction(template)
                ops.render = render
            }

            // console.log(template)
        }
        mountComponent(vm, el) //组建的挂载
        // ops.render; // 最终可以获取render方法
    }
}
