const path = require('path')
module.exports={
    // 配置 webpack-dev-server
    devServer:{
        host:'0.0.0.0',
        port:8000,
        proxy:{
            '/api':{
                target:'http://localhost:3000',
                changeOrigin:true,
                pathRewrite:{
                    '^/api':''
                }
            }
        }
    },
    pages:{
        index:{
            entry:'frontend/src/main.js',
            template: 'frontend/public/index.html',
            filename: 'index.html',
        }
    },
    configureWebpack: {
        resolve: {
          alias: {
            '@': path.resolve(__dirname, 'frontend/src')
          }
    }
}
    
}