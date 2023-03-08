const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture =`((?:${ncname}\\:)?${ncname})`
const startTag0pen = new RegExp(`^<${qnameCapture}`) //他匹配到的分组是一个标签名
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/ // 匹配属性的正则表达式
const startTagClose =/^\s*(\/?)>/
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// 解析ast语法树
export function parseHTML(html) {
    const ELEMENT_TYPE = 1
    const TEXT_TYPE = 3
    const stack = [] //用于存放元素
    let currentParent; // 指向栈中最后一个元素
    let root

    // 生成一颗抽象语法树
    function createASTEElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            children: [],
            attrs,
            parent: null
        }
    }

    // 最终需要转化为一颗抽象语法树
    function start(tag, attrs) {
        let node = createASTEElement(tag, attrs)
        if(!root) { // 是否是空树
            root = node // 如果当前为空表示是当前树的根节点
        }
        if(currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }
        stack.push(node)
        currentParent = node // currentParent是栈中的最后一个
        // console.log(tag,attrs, '开始标签')
    }
    function chars(text) { // 文本直接放入当前指向的节点
        // console.log(text, '文本标签')
        text = text.replace(/\s/g,'')
        text && currentParent.children.push({
            type: TEXT_TYPE,
            text,
            parent: currentParent
        })
    }
    function end(tag) {
        // console.log(tag, '结束标签')
        let node = stack.pop()
        currentParent = stack[stack.length - 1]
    }
    function advance(n) {
        html = html.substring(n)
    }
    function parseStartTag() {
        const start = html.match(startTag0pen)
        if(start) {
            const match = {
                tagName:start[1], // 标签名
                attrs: []
            }
            advance(start[0].length)
            // console.log(match, html)

            // 如果不是开始的标签的结束，就一直匹配
            let attr, end
            while(!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                advance(attr[0].length)
                match.attrs.push({name: attr[1], value: attr[3] || attr[4] || attr[5] || true})
                // console.log('消除')
            }

            if(end) {
                advance(end[0].length)
            }
            // console.log(match)
            return match

        }
        // console.log(html)
        return false
        // console.log(start)
    }

    // 开始解析模板
    while(html) {
        // debugger;
        // 如果textEnd为0 说明是一个开始标签或者结束标签
        // 如果textEnd > 0 说明就是文本的结束位置
        let textEnd = html.indexOf('<') // 如果indexOf中的标签索引是0 则说明是一个标签

        if(textEnd === 0) {
            const startTagMatch = parseStartTag()

            if(startTagMatch) { // 解析到的开始标签
                // console.log(html)
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }

            let endTagMatch = html.match(endTag)
            if(endTagMatch) {
                advance(endTagMatch[0].length)
                end(endTagMatch[1])
                continue
            }
        }
        if(textEnd > 0) {
            let text = html.substring(0,textEnd)

            if(text) {
                chars(text)
                advance(text.length) // 解析到文本
                // console.log(html)
            }
        }
        // break
    }

    return root
}
