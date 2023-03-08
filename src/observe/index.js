class Observer {
    constructor(data) {
        // Object.defineProperty已经只能劫持已经存在的属性
        // $set $delete

        this.walk(data)
    }

    walk(data) { // 循环对象，遍历属性依次劫持

        // 重新定义属性 性能差
        Object.keys(data).forEach((key) => defineReactive(data, key, data[key]))
    }
}

export function defineReactive(target, key, value) { //属性劫持
    observe(value) // 对所有的对象都进行属性劫持
    Object.defineProperty(target, key, {
        get() { // 取值执行get
            console.log('用户取值')
            return value
        },
        set(newValue) { // 修改执行set
            console.log('用户设置值')
            if(newValue === value) return
            value = newValue
        }
    })
}

export function observe(data) {
    // 对对象进行劫持
    if(typeof data !== "object" || data === null) {
        return // 只对对象进行劫持
    }

    // 如果对象已经被劫持，就不需要在被劫持(可以通过一个实例判断是否被劫持)

    return new Observer(data)
}