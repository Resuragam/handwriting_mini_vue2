import Dep, { popTarget, pushTarget } from "./dep";

let id = 0

// 每个属性有一个dep 被观察者， watcher是观察者，属性变化了会通知观察者更新 -》观察者模式
/*
* 1. 当我们创建渲染watcher会把当前的渲染watcher放到Dep.target
* 2. 当我们调用_render()方法时，走到get上
* */
// 渲染watcher
class Watcher{ // 不同组件存在不同的watcher new Watcher
    constructor(vm, exprOfFn, options, cb) {
        this.id = id ++
        this.renderWatcher = options // options为true表示一个渲染watcher

        if(typeof exprOfFn === 'string') {
            this.getter = function () {
                return vm[exprOfFn]
            }
        }else {
            this.getter = exprOfFn
        }
        // this.getter = exprOfFn // getter意外是调用这个函数发生取值操作
        this.deps = [] // 后续我们实现计算属性，和一些清理工作需要用到
        this.depsId = new Set()
        this.lazy = options.lazy
        this.dirty = this.lazy // 缓存值
        this.vm = vm
        this.user = options.user // 标识是否是用户自己的watcher
        this.cb = cb
        this.value = this.lazy ? undefined : this.get()
    }
    addDep(dep) { // 一个组件对应着多个属性，重复的属性不记录
        let id = dep.id
        if(!this.depsId.has(id)) {
            this.deps.push(dep)
            this.depsId.add(id)
            dep.addSub(this) // watcher记住并且去重
        }
    }
    evaluate() {
        this.value = this.get() // 获取到用户函数的返回值，被标识为脏
        this.dirty = false
    }
    get() {
        pushTarget(this)
        // Dep.target = this // 静态属性只有一份，全局变量
        let value = this.getter.call(this.vm)
        // Dep.target = null
        popTarget() // 渲染完毕立即清空
        return value
    }
    depend() {
        let i = this.deps.length
        while (i--) {
            this.deps[i].depend() // 让计算属性watcher也收集渲染watcher
        }
    }
    update() {

        if(this.lazy) {
            // 如果是计算属性 依赖的值变化 标识计算属性是脏值
            this.dirty = true
        }else {
            // console.log('update')
            // this.get() // 重新渲染
            queueWatcher(this) // 把当前的watcher缓存起来
        }
    }
    run() {
        let oldValue = this.value
        let newValue = this.get()
        if(this.user) {
            this.cb.call(this.vm, newValue, oldValue)
        }
        // console.log('现在才是最后的渲染')
    }
}

// 需要给每个属性增加一个dep, 目的就是收集一个watcher

// 一个视图总存在n个属性，n个dep对应一个watcher
// 一个属性对应着多个视图，一个属性可以对应多个组件 一个dep对应多个watcher

let queue = []
let has = {}
let pending = false // 防抖

function flushSchedulerQueue() {
    let flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    flushQueue.forEach(queue => queue.run()) // 再刷新的过程可能还有新的watcher
}

function queueWatcher(watcher) {
    const id = watcher.id
    if(!has[id]) {
        queue.push(watcher)
        has[id] = true
        // 不管update执行多少次，最终只执行一轮的刷新操作

        if(!pending) {
            nextTick(flushSchedulerQueue, 0)
            pending = true
        }
        // console.log(queue)
    }
}

let callbacks = []
let waiting = false
function flushCallbacks() {
    waiting = false
    let cbs = callbacks.slice(0)
    callbacks = []
    cbs.forEach(cb => cb())
}

// nextTick 没有直接采用某个API，采用优雅降级的操作
// 内部先采用的Promise（ie不兼容） MutationObserver(H5 API)  可以考虑IE专享的setImmediate  setTimeout

let timeFunc;
if(Promise) {
    timeFunc = () => {
        Promise.resolve().then(flushCallbacks)
    }
}else if(MutationObserver) {
    let observer = new MutationObserver(flushCallbacks) // 这里传入的回调是异步执行的
    let textNode = document.createTextNode(1)
    observer.observe(textNode, {
        characterData: true
    })
    timeFunc = () => {
        textNode.textContent = 2
    }
}else if(setImmediate) {
    timeFunc = () => {
        setImmediate(flushCallbacks)
    }
}else{
    timeFunc = () => {
        setTimeout(flushCallbacks)
    }
}

export function nextTick(cb) {
    callbacks.push(cb) // 维护nextTick中的callback方法，最后一起刷新，按照顺序一次执行
    if(!waiting) {
        timeFunc(flushCallbacks)
        waiting = true
    }
}


export default Watcher