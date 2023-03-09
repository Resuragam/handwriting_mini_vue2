import {newArrayProto} from "./array";
import Dep from "./dep";

class Observer {
    constructor(data) {

        this.dep = new Dep() // 所有对象增加dep，增加属性也可以触发更新

        // Object.defineProperty已经只能劫持已经存在的属性
        // $set $delete
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false // 将ob设置为不可枚举的属性
        })
        // data.__ob__ = this // 给数据加了一个标识，说明这个属性被观测了
        if(Array.isArray(data)) {
            // 重写数组中的方法 7个变异方法，可以修改数组的方法

            data.__proto__ = newArrayProto// 需要保留数组原始方法与原有的特性

            this.observeArray(data) // 如果检测的是数组的元素是个对象，可以对象进行检测
        } else {
            this.walk(data)
        }
    }

    walk(data) { // 循环对象，遍历属性依次劫持

        // 重新定义属性 性能差
        Object.keys(data).forEach((key) => defineReactive(data, key, data[key]))
    }

    observeArray(data) {
        data.forEach(item => observe(item))
    }
}

// 深层次递归嵌套，递归多了性能差，不存在的属性检测不到，存在的属性重写方法
function dependArray(value) {
    for(let i = 0; i < value.length; i++) {
        let current = value[i]
        current.__ob__ && current.__ob__.dep.depend()
        if(Array.isArray(current)) {
            dependArray(current)
        }
    }
}

export function defineReactive(target, key, value) { //属性劫持
    let childOb = observe(value) // 对所有的对象都进行属性劫持 对象上面存在childOb.dep收集依赖
    let dep = new Dep() // 每一个属性都存在一个dep,dep内部会存放watcher
    Object.defineProperty(target, key, {
        get() { // 取值执行get
            // console.log('用户取值')

            if(Dep.target) {
                dep.depend() // 让这个属性的收集记住当前的watcher
                if(childOb) {
                    childOb.dep.depend()
                    if(Array.isArray(value)) {
                        dependArray(value)
                    }
                }
            }

            return value
        },
        set(newValue) { // 修改执行set
            // console.log('用户设置值')
            if(newValue === value) return
            observe(newValue)
            dep.notify()
            value = newValue
        }
    })
}

export function observe(data) {
    // 对对象进行劫持
    if(typeof data !== "object" || data === null) {
        return // 只对对象进行劫持
    }
    if(data.__ob__ instanceof Observer) {
        return data.__ob__
    }
    // 如果对象已经被劫持，就不需要在被劫持(可以通过一个实例判断是否被劫持)

    return new Observer(data)
}