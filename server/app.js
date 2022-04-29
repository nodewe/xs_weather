const express = require('express');
const exceljs = require('exceljs')
const axios = require('axios')
const workbook = new exceljs.Workbook();
const {
    renameSync,
    createReadStream,
    existsSync 
} = require('fs')
//form表单需要的中间件。
const mutipart = require('connect-multiparty');

const mutipartMiddeware = mutipart();
const app = express();
/**
 * 处理excel
 * @param {Object} worksheet 表格
 * @param {String} file 文件路径
 * @param {Array} codes 行政区划的集合
 * @param {Number} limit 控制同时请求的并发数量
 */
function excel(worksheet,file,codes,limit=2){
    return new Promise(resolve=>{
        const start = async ()=>{
            const task = codes.shift();
            if(task){
                let getRowInsert = worksheet.getRow(task.index+2);
                // 发送请求 得到temp写入到同一行C中
                const ret = await axios.get(`http://www.weather.com.cn/data/sk/${task.code}.html`)
                const temp = ret.data.weatherinfo.temp
                getRowInsert.getCell('C').value = temp;
                getRowInsert.commit();
                workbook.xlsx.writeFile(file);
                start()
            }else{
                resolve(file)
            }
        }
        while(limit>0){
            start();
            limit--
        }
    })
    
}
//下载文件
app.get('/download',(req,res)=>{
    //检测文件是否存在
    if(!existsSync(__dirname+'/file/input.xlsx')){
        res.send({
            code:500,
            msg:'没有上传input.xlsx文件'
        })
        return
    }
    // 将处理好的input.xlsx 文件流返回给前端
    createReadStream(__dirname+'/file/input.xlsx').pipe(res)
})
//修改临时文件的储存位置
app.use(mutipart({
    uploadDir: __dirname+'/file'
}));

// 上传文件
app.post('/upload',mutipartMiddeware,async (req,res)=>{
    // 拿到文件
    let oldPath = req.files.file.path,
    // 得到最后一个\\的索引
    index = oldPath.lastIndexOf('\\'),
    // 截取从开始到file
    newPath = oldPath.slice(0,index);
    // 生成新的fileName
    newPath+='\\input.xlsx'
    // 重命名 文件
    renameSync(oldPath,newPath)
    //拿到文件路径 
    //读取文件
    await workbook.xlsx.readFile(newPath);
    let worksheet = workbook.getWorksheet(1),
    // 获取区划代码
    codes = worksheet.getColumn(1).values
    // 筛选出有效的区划
    codes = codes.filter(code=>!isNaN(code))
            .map((code,index)=>({
                code:code,
                index
            }));
    //循环请求 并且写入城市对应的天气值
    try {
        await excel(worksheet,newPath,codes);
        res.send({
            code:0,
            msg:'文件处理成功'
        })
    } catch (error) {
        res.send({
            code:500,
            msg:'文件处理失败'
        })
    }
   
    
})
//设置http服务监听的端口号。
const PORT = 3000
app.listen(PORT, () => {
    console.log(`server listen ${PORT}`);
});
