// h() _c()
export function createElementVNode(vm, tag, data, ...children) {
    if(data === null) {
        data = {}
    }
    let key = data.key
    if(key) {
        delete data.key
    }
    return vnode(vm, tag, key, data, children)
}

// _v()
export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

// ast进行语法层面的转化，描述的是语法层面的本身（描述HTML）
// 虚拟DOM描述的是dom元素，可以增加一些自定义的属性 (描述DOM元素)
function vnode(vm, tag, key, data, children, text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
    }
}

