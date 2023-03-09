import {isSameVNode} from "./index";

export function createElm(vnode) {
    let {tag, data, children, text} = vnode
    if(typeof tag === 'string') {
        // 标签
        vnode.el = document.createElement(tag) // 这里将真实节点和虚拟节点对应起来，后续如果修改属性
        patchProps(vnode.el,{}, data)
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        })
    }else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

function patchProps(el, oldProps = {}, props = {}) {
    // 老的样式有, 新的样式没有
    let oldStyles = oldProps.style || {}
    let newStyles = props.style || {}
    for(let key in oldStyles) {
        if(!newStyles[key]) {
            el.style[key] = ''
        }
    }

    for(let key in oldProps) { // 老的属性有
        if(!oldProps[key]) { // 新的属性没有
            el.removeAttribute(key)
        }
    }

    for(let key in props) { // 用新的覆盖老的
        if(key === 'style') {
            for(let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        }else {
            el.setAttribute(key, props[key])
        }
    }

}

export function patch(oldVNode, vnode) {
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
        // 1. 两个节点不是一个节点，直接删除老的换新的

        // 2. 两个节点是一个同一个节点（判断节点的tag 和 节点的key） 比较两个节点的属性是否存在差异(复用老节点)

        // 3. 比较两人的儿子节点

        return patchVnode(oldVNode, vnode)

    }
}

function patchVnode(oldVNode, vnode) {
    if(!isSameVNode(oldVNode,vnode)) { // tag === tag && key === key
        // 用老节点的父亲进行替换
        let el = createElm(vnode)
        oldVNode.el.parentNode.replaceChild(el, oldVNode.el)
        return el
    }

    // 文本的情况 文本我们期望比较一下文本的内容
    let el = vnode.el = oldVNode.el
    // console.log(el)
    if(!oldVNode.tag) { // 是文本
        if(oldVNode.text !== vnode.text) {
            el.textContent = vnode.text // 用新的文本覆盖老文本
        }
    }

    // 是标签 是标签我们需要比对标签的属性
    patchProps(el, oldVNode.data, vnode.data)

    // 比较儿子节点 比较的时候，一方有儿子，一方没有儿子
    //                      两方都有儿子
    let oldChildren = oldVNode.children || []
    let newChildren = vnode.children || []


    if(oldChildren.length > 0 && newChildren.length > 0) {
        // 完整的diff算法比较两个人的儿子
        updateChildren(el, oldChildren, newChildren)
    }else if(newChildren.length > 0) { // 没有老的，有新的
        mountChildren(el, newChildren)
    }else if(oldChildren.length > 0) { // 新的没有，老的有
        el.innerHTML = '' // 可以循环删除
    }
    // console.log(oldChildren, newChildren)
    return el
}

function mountChildren(el, newChildren) {
    for(let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i]
        el.appendChild(createElm(child))
    }
}

function updateChildren(el, oldChildren, newChildren) {
    // 我们操作列表， 经常是有 push shift pop
    // Vue2采用双指针的方式比较两个节点

    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1

    let oldStartVnode = oldChildren[0]
    let newStartVnode = newChildren[0]

    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[newEndIndex]

    function makeIndexByKey(children) {
        let map = {

        }
        children.forEach((child, index) => {
            map[child.key] = index
        })
        return map
    }
    let map = makeIndexByKey(oldChildren)
    console.log(map)
    // console.log(oldStartVnode, newStartVnode)
    // console.log(oldEndVnode, newEndVnode)

    // 我们循环的时候为什么要加key
    while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) { // 有任何一个不满足则停止 ||表示有一个为true继续走
        if(!oldStartVnode) {
           oldStartVnode = oldChildren[++oldStartIndex]
        }else if(!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex]
        }
        // 双方有一方有头指针， 大于尾指针则停止循环
        else if(isSameVNode(oldStartVnode, newStartVnode)) {
            // 比较是不是相同节点
            // 比较开头节点
            patchVnode(oldStartVnode, newStartVnode)
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]

        }else if(isSameVNode(oldEndVnode, newEndVnode)) {
            // 比较是不是相同节点
            // 比较结尾的节点
            patchVnode(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]


        }// 交叉比对 abcd -> dabc
        else if(isSameVNode(oldEndVnode, newStartVnode)) {
            patchVnode(oldEndVnode, newStartVnode)
            // insertBefore具备移动性，会将原来的元素移动走
            el.insertBefore(oldEndVnode.el, oldStartVnode.el) // 将老的尾巴移动到前面去
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        }
        // 交叉比对 abcd -> bcda
        else if(isSameVNode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newEndVnode)
            // insertBefore具备移动性，会将原来的元素移动走
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling) // 将老的尾巴移动到前面去
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        }else {
            // 再给动态列表添加的时候，要尽量避免添加索引，因为索引都是从0开始，会发生错误

            // 乱序比对

            // 根据老的列表做一个映射关系，用新的去找，找到则移动，找不到则添加，最后多余的添加
            let moveIndex = map[newStartVnode.key]
            if(moveIndex !== undefined) {
                let moveVnode = oldChildren[moveIndex] // 找到对应的虚拟节点进行复用
                el.insertBefore(moveVnode.el, oldStartVnode.el)
                oldChildren[moveIndex] = undefined // 表示一个节点已经移走
                patchVnode(moveVnode, newStartVnode) // 比对属性
            }else{
                el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
            }

            newStartVnode = newChildren[++newStartIndex]
        }
    }

    if(newStartIndex <= newEndIndex) { // 多余的就插入
        for(let i = newStartIndex; i <= newEndIndex; i ++) {
            let childEl = createElm(newChildren[i])
            // 可能是向后追加，可能是向前追加
            let anchor = newChildren[newEndIndex + 1] ?  newChildren[newEndIndex + 1].el : null// 获取下一个元素
            // el.appendChild(childEl)
            el.insertBefore(childEl, anchor) // anchor为null的时候会被认为appendChild
        }
    }
    if(oldStartIndex <= oldEndIndex) {
        for(let i = oldStartIndex; i <= oldEndIndex; i ++) {
            if(oldChildren[i]) {
                let childEl = oldChildren[i].el
                el.removeChild(childEl)
            }
        }
    }

    // 我们为了 比较两个儿子的时候 增高性能 我们会有一些优化策略
    // console.log(el,oldChildren,newChildren)
    
    // 如果批量像页面修改出入内容，浏览器会自动优化
}

