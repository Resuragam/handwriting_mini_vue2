// 我们希望重写数组中的部分方法

let oldArrayProto = Array.prototype // 获取数组的原型对象

// newArrayProto.__proto__ = oldArrayProto
export let newArrayProto = Object.create(oldArrayProto) // 拷贝一份新的

let methods = [
    // 找到所有可以修改原数组的变异方法
    'push',
    'pop',
    'shift',
    'unshift',
    'sort',
    'reserve',
    'splice'
]

methods.forEach(method => {
    newArrayProto[method] = function (...args) { // 这里重写了数组的方法
        const result = oldArrayProto[method].call(this, ...args) // 内部调用原来的方法，函数的劫持，切片编程

        // 我们需要对新增的参数在进行判断
        let inserted
        let ob = this.__ob__
        switch (method) {
            case 'push':
            case 'unshift':
                inserted = args
                break
            case 'splice':
                inserted = args.slice(2)
            default:
                break
        }
        if(inserted) {
            ob.observeArray(inserted)
        }
        console.log(inserted) //新增内容
        console.log('method', method)
        return result
    }
})

