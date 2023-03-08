// rollup 配置文件
import babel from 'rollup-plugin-babel'
// import resolve from '@rollup/plugin-node-resolve'
export default {
    input: './src/index.js', // 入口文件
    output: {
        file:'./dist/Vue.js', // 出口文件
        name: 'Vue',
        format: 'umd',
        sourcemap: true, // 希望可以调试源代码
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        // resolve()
    ]
}