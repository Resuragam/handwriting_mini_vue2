let id = 0

class Dep{
    constructor() {
        this.id = id ++ // 属性的dep需要收集watcher
        this.subs = [] // 存放当前属性对应的watcher
    }

    depend() {
        // 这里我们不希望放置重复的watcher，dep->watcher
        // watcher记录dep
        // this.subs.push(Dep.target)

        Dep.target.addDep(this) // 让wathcer记住dep

        // dep和watcher是一个多对多的关系
        // 一个属性可以在多个组件中使用 dep -> 多个watcher
        // 一个组件由多个属性组成 watcher -> 多个dep
    }

    addSub(watcher) {
        this.subs.push(watcher)
    }

    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}

Dep.target = null

export default Dep