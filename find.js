/**
 * Created by zhanghongtao on 2016/1/13.
 */
var http = require("http");
var fs = require("fs");

var url = "http://f.hiphotos.baidu.com/image/pic/item/7c1ed21b0ef41bd56888d6d354da81cb39db3d39.jpg";
http.get(url, function(res){
    var imgData = "";
    res.setEncoding("binary"); //һ��Ҫ����response�ı���Ϊbinary���������������ͼƬ�򲻿�

    res.on("data", function(chunk){
        imgData+=chunk;
    });

    res.on("end", function(){
        fs.writeFile(__dirname+ '\\a1.jpg', imgData, "binary", function(err){
            if(err){
                console.log("down fail");
            }
            console.log("down success");
        });
    });
});