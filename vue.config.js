module.exports = {
    productionSourceMap: false,
    chainWebpack: config => {
        config.module.rules.delete('eslint');
    }
}
