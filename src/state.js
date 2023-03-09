import { observe } from "./observe/index.js"
import Watcher, {nextTick} from "./observe/watcher";
import Dep from "./observe/dep";
import dep from "./observe/dep";
import Vue from "./index";

export function initState(vm) {
    const opts = vm.$options // 获取所有的选项
    if(opts.data) {
        initData(vm)
    }
    if(opts.computed) {
        initComputed(vm)
    }
    if(opts.watch) {
        initWatch(vm)
    }
}

function initWatch(vm) {
    let watch = vm.$options.watch

    for(let key in watch) { // 字符串 数组 函数
        const handler = watch[key]

        if(Array.isArray(handler)) {
            for(let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i])
            }
        }else {
            createWatcher(vm, key, handler)
        }
    }
}

function createWatcher(vm, key, handler) {
    // 字符串 数组 函数
    if(typeof handler === 'string') {
        handler = vm[handler]
        console.log(handler)
    }
    return vm.$watch(key, handler)
}

function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            return vm[target][key]
        },
        set(newValue) {
            vm[target][key] = newValue
        }
    })
}

function initData(vm) {
    let data = vm.$options.data // 函数或者对象
    data = typeof data === 'function' ? data.call(this) : data

    vm._data = data
    // 对数据进行劫持 Object.defineProperty
    observe(data)

    for(let key in data) {
        proxy(vm, '_data', key)
    }
}

function initComputed(vm) {
    const computed = vm.$options.computed
    const watchers = vm._computedWatcher = {} // 保存计算属性的watcher
    // console.log(computed)

    for(let key in computed) {
        let userDef = computed[key]

        // const getter = typeof userDef === 'function' ? userDef : userDef.get
        // const setter = userDef.set || (() => {})
        //
        // console.log(getter)
        // console.log(setter)

        // 我们需要监控计算属性中get的变化
        let fn = typeof userDef === 'function' ? userDef : userDef.get
        watchers[key] = new Watcher(vm, fn, {
            lazy: true
        })
        defineComputed(vm, key, userDef)
    }
}

function defineComputed(target, key, userDef) {
    // const getter = typeof userDef === 'function' ? userDef : userDef.get
    const setter = userDef.set || (() => {})

    // 可以通过拿到对应的属性
    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

// 计算属性根本不会收集依赖，让自己的依赖属性去收集依赖
function createComputedGetter(key) {
    // 检测是否执行getter
    return function () {
        const watcher = this._computedWatcher[key] // 获取到对应属性的计算watcher
        if(watcher.dirty) {
            // 如果是脏的就去执行 用户传入依赖
            watcher.evaluate()
        }
        if(Dep.target) { // 说明计算属性出栈后 还有watcher， 应该让依赖的属性收集上层watcher
            watcher.depend()
        }
        return watcher.value
    }
}

export function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick
    Vue.prototype.$watch = function (exprOrFn, cb) {
        // firstName
        // () => vm.firstName

        // firstName的值变换，直接执行cb函数
        new Watcher(this, exprOrFn, {
            user: true
        }, cb)
    }
}