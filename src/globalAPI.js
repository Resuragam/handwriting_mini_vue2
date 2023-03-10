// 静态方法
import Vue from "./index";
import { mergeOptions } from "./utils";


export function initGlobalAPI(Vue) {



    Vue.options = {}


    Vue.mixin = function(mixin) {
        // 我们期望将用户的选项和全局的options进行合并
        this.options = mergeOptions(this.options, mixin)
        return this
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