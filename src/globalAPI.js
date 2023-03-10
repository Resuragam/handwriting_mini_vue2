// 静态方法
import Vue from "./index";
import { mergeOptions } from "./utils";


export function initGlobalAPI(Vue) {

    Vue.options = {
        _base: Vue
    }


    Vue.mixin = function(mixin) {
        // 我们期望将用户的选项和全局的options进行合并
        this.options = mergeOptions(this.options, mixin)
        return this
    }

    // 手动构造函数进行挂载
    Vue.extend = function (options) {
        // 实现根据用户的参数，返回一个构造函数而已
        function Sub(options = {}) { // 最终可以使用一个组件，就是new一个实例
            this._init(options) // 默认对子类进行初始化操作
        }
        Sub.prototype = Object.create(Vue.prototype) // Sub.prototype.__proto__ === Vue.prototy[e
        Sub.prototype.constructor = Sub

        // 希望将用户的传递的参数 和全局的Vue.options合并
        Sub.options = mergeOptions(Vue.options, options)
        return Sub
    }

    Vue.options.components = {} // 全局的指令

    Vue.component = function (id, definition) {

        // 如果definition已经是一个函数了，说明用户自己调用Vue.extend()
        definition = typeof definition === 'function' ? definition : Vue.extend(definition)

        Vue.options.components[id] = definition

        console.log(Vue.options.components)
    }

}

// export function initGlobalAPI(Vue) {
//     // 静态方法
//     Vue.options = {}
//     Vue.mixin = function (mixin) {
//
//     }
//     Vue.extend = function (options) {
//         function Sub() { // 最终可以使用一个组件，就是new一个实例
//             this._init(options) // 默认对子类进行初始化操作
//         }
//         Sub.prototype = Object.create(Vue.prototype)
//         Sub.options = options
//         return Sub
//     }
// }