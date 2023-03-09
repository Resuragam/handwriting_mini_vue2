import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle";
import { initStateMixin } from "./state";
import { compileToFunction } from "./compiler/index";
import {createElm, patch} from "./vdom/patch";

function Vue(options) { // options就是用户的选项
    this._init(options)
}


initMixin(Vue) // 扩展init
initLifeCycle(Vue)
initStateMixin(Vue) // 实现nextTick和 $watch


// 为了方便观察前后的虚拟节点
let render1 = compileToFunction(`<ul key="a" style="color: gold">
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>
    <li key="d">d</li>
</ul>`)
let vm1 = new Vue({
    data:{
        name:'hhy'
    }
})
let prevNode = render1.call(vm1)
let el = createElm(prevNode)
document.body.appendChild(el)


let render2 = compileToFunction(`<ul key="a" style="background-color: lightgreen">
    <li key="b">b</li>
    <li key="m">m</li>
    <li key="a">a</li>
    <li key="p">p</li>
    <li key="c">c</li>
    <li key="q">q</li>
</ul>`)
let vm2 = new Vue({
    data:{
        name:'hhy'
    }
})
let nextVNode = render2.call(vm2)
let newEl = createElm(nextVNode)

// 比较两者区别再去替换， diff算法
// diff算法是一个平级比较的过程，父亲和父亲比对，儿子和儿子比对
setTimeout(() => {
    patch(prevNode, nextVNode)
},1000)







export default Vue