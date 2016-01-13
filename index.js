/**
 * Created by zhanghongtao on 2016/1/13.
 */
var child_process = require('child_process');
//child_process.exec(' start ' + __dirname + '\\a.jpg', function(err, stdout, sterr){
//    console.log(err);
//    console.log('close');
//    console.log(sterr);
//});


//var openApp = function(){
//    child_process.execFile(__dirname + '\\a.bat',[__dirname + '\\a.jpg'],{cwd:'D:/'},function (error,stdout,stderr) {
//        if (error !== null) {
//            console.log('exec error: ' + error);
//        }
//        else console.log('成功执行指令!');
//    });
//}
//openApp();
//console.log('正在执行bat文件……');


var openPP = function() {
    var url = 'http://www.sj88.com/attachments/bd-aldimg/1202/125/11.jpg';
    var http = require('http');
    var fs = require('fs');
    //
    //request({uri: url}, function (err, response, body) {
    //    body.setEncoding("binary");
    //    var name = new Date().getTime().toString() + '.jpg';
    //
    //});


    http.get(url, function(res){
        var imgData = "";
        res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开

        res.on("data", function(chunk){
            imgData+=chunk;
        });

        res.on("end", function(){
            fs.writeFile("./a1.jpg", imgData, "binary", function(err){
                if(err){
                    console.log("down fail");
                }

                child_process.execFile(__dirname + '\\a.bat', [__dirname + '\\a1.jpg'], {cwd: 'D:/'}, function (error, stdout, stderr) {
                    if (error !== null) {
                        console.log('exec error: ' + error);
                    }
                    else console.log('成功执行指令!');
                });
            });
        });
    });
}
openPP();
//cat.stdin.end();