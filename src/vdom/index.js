// h() _c()

const isReservedTag = (tag) => {
    return ['a', 'div', 'p', 'button', 'ul', 'li', 'span'].includes(tag)
}

export function createElementVNode(vm, tag, data, ...children) {
    if(data === null) {
        data = {}
    }
    let key = data.key
    if(key) {
        delete data.key
    }

    if(isReservedTag(tag)) {
        return vnode(vm, tag, key, data, children)
    }else {
        // 创造一个组件的虚拟节点（包含组件的构造函数）
        let Ctor = vm.$options.components[tag] // 组件的构造函数

        // Ctor就是组件的定义， 可能是一个Sub类 或者组件的obj选项
        return createComponentVnode(vm, tag, key, data, children, Ctor)
    }
}

function createComponentVnode(vm, tag, key, data, children, Ctor) {

    if(typeof Ctor === 'object') {
        Ctor = vm.$options._base.extend(Ctor)
    }

    data.hook = {
        init() { // 稍后创造真实节点的时候，如果是组件则调用此方法

        }
    }

    return vnode(vm, tag, key, data, children, null, {Ctor})
}

// _v()
export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

// ast进行语法层面的转化，描述的是语法层面的本身（描述HTML）
// 虚拟DOM描述的是dom元素，可以增加一些自定义的属性 (描述DOM元素)
function vnode(vm, tag, key, data, children, text, componentOptions) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentOptions // 包含组件的构造函数
    }
}

export function isSameVNode(vnode1, vnode2) {
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key
}

