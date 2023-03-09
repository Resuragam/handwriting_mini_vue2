import { createElementVNode, createTextVNode } from "./vdom/index";
function createElm(vnode) {
    let {tag, data, children, text} = vnode
    if(typeof tag === 'string') {
        // 标签
        vnode.el = document.createElement(tag) // 这里将真实节点和虚拟节点对应起来，后续如果修改属性
        patchProps(vnode.el, data)
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        })
    }else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function patchProps(el, props) {
    for(let key in props) {

        if(key === 'style') {
            for(let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        }else {
            el.setAttribute(key, props[key])
        }
    }
}

function patch(oldVNode, vnode) {
    // 初始渲染功能

    const isRealElement = oldVNode.nodeType
    if(isRealElement) {
        const elm = oldVNode
        // 拿到父元素
        const parentElm = elm.parentNode
        let newElm = createElm(vnode)
        // console.log(newElm)
        parentElm.insertBefore(newElm, elm.nextSibling)
        parentElm.removeChild(elm)

        return newElm
    }else {
        // diff算法
    }
}

export function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
        const vm = this
        const el = vm.$el

        console.log(el)
        // vnode转化为真实DOM
        // console.log('update', vnode)
        // patch既有初始化的功能，又有更新的功能
        vm.$el = patch(el, vnode)
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
    vm._update(vm._render()) // 返回虚拟节点

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
