const strats = {}
const LIFECYCLE = [
    'beforeCreate',
    'created'
]
LIFECYCLE.forEach(hook => {
    strats[hook] = function (p, c) {
        if(c) { // 如果儿子有，父亲有 让父亲和儿子拼在一起
            if(p) {
                return p.concat(c)
            } else { // 儿子有，父亲没有， 则将儿子包装成十足
                return [c]
            }
        }else {
            return p // 如果儿子没有则用父亲即可
        }
    }
})

export function mergeOptions(parent, child) {
    const options = {}
    for(let key in parent) { // 循环老
        mergeFiled(key)
    }

    for(let key in child) { // 循环新
        if(!parent.hasOwnProperty(key)) {
            mergeFiled(key)
        }
    }

    function mergeFiled(key) {
        // 策略模式 用策略模式减少if else
        if(strats[key]) {
            options[key] = strats[key](parent[key],child[key])
        }else {
            // 如果不在策略中，以儿子为主
            options[key] = child[key] || parent[key] // 优先采用儿子，再采用父亲的
        }
    }

    return options
}