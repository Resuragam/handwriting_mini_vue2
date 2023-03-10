import { createElementVNode, createTextVNode } from "./vdom/index";
import Watcher from "./observe/watcher"
import { patch } from './vdom/patch'

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el
        const prevVnode = vm._vnode
        vm._vnode = vnode
        // console.log(el)
        // vnode转化为真实DOM
        // console.log('update', vnode)
        // patch既有初始化的功能，又有更新的功能

        if(prevVnode) { // 之前渲染过了
            vm.$el = patch(prevVnode, vnode)
        }else {
            vm.$el = patch(el, vnode)
        }
        // 把组件第一次产生的虚拟节点保存在vnode上
    }
    // _c('div',{},...children)
    Vue.prototype._c = function () {
        return createElementVNode(this, ...arguments)
    }
    // -v(text)
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }
    Vue.prototype._s = function (value) {
        if(typeof value !== 'object') return value
        return JSON.stringify(value)
    }
    Vue.prototype._render = function () {
        // console.log('_render')
        // 当渲染的时候回去实例中取值，我们可将属性与视图绑定在一起
        const vm = this
        // console.log(vm.$options.render.toString())
        // 修改this的指向
        return vm.$options.render.call(vm)
    }
}

export function mountComponent(vm, el) {
    // 1. 调用render方法产生虚拟DOM
    vm.$el = el

    const updateComponent = () => {
        vm._update(vm._render()) // 返回虚拟节点
    }

    const watcher = new Watcher(vm, updateComponent, true)
    // console.log(watcher)
    // 2. 根据虚拟DOM实现真实DOM

    // 3. 插入el元素中
}

/*
* Vue核心流程
* 1. 创造响应式数据
* 2. 模板转换为ast语法树
* 3. 将ast语法树转为render函数
* 4. 每次数据更新只执行render函数（不需要再次执行ast转化）
*
*
* render函数会产生虚拟节点，使用响应式数据
* 根据虚拟节点创造真实DOM
* */

export function callHook(vm, hook) {
    const handlers = vm.$options[hook]
    if(handlers) {
        handlers.forEach(handler => handler.call(vm))
    }
}