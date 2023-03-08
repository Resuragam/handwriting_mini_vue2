import { parseHTML } from './parse'

function genProps(attrs) {
    let str = ''
    for(let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if(attr.name === 'style') {
            // style color:red => {color:red}
            let obj = {}
            attr.value.split(';').forEach((item) => {
                let [key, value] = item.split(':')
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0,-1)}}`
}

const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g
function gen(node) {
    if(node.type === 1) {
        return codegen(node)
    }else {
        // 文本
        let text = node.text
        if(!defaultTagRE.test(text)) {
            return `_v(${JSON.stringify(text)})`
        }else {
           let tokens = []
            let match
            defaultTagRE.lastIndex = 0
            let lastIndex = 0
            while(match = defaultTagRE.exec(text)) {
               // console.log(match,'..........')
                let index = match.index // 匹配的位置

                if(index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                tokens.push(`_s(${match[1].trim()})`)

                lastIndex = index + match[0].length

            }
            if(lastIndex < text.length) {
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`
            // console.log(tokens)
        }
    }
}

function genChildren(children) {
    if(children) {
        return children.map(child => gen(child)).join(',')
    }
}

function codegen(ast) {
    let children = genChildren(ast.children)
    let code = `_c('${ast.tag}',${
        ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'
    }${
        ast.children.length > 0 ? `,${children}` : ''
    })`
    return code
}

export function compileToFunction(template) {
    // console.log(template)
    // 1.将template转化为ast语法树
    let ast = parseHTML(template)

    // 2. 生成render方法(render方法执行后的结果就是虚拟DOM)

    console.log(ast)

    console.log(codegen(ast))
    // render(){
    //     return _c('div', {id:'app'}, _c('div', {style: { color: "red"}}, _v(_s(name) + 'hello')))
    // }
}