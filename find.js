/**
 * Created by zhanghongtao on 2016/1/13.
 */
var http = require("http");
var fs = require("fs");
var _ = require('lodash');
var c =_.startsWith('@@f3b8f7bbe384787ab2596eef634cc36ab5f52aba70d1f22801fb5cc85260dc5b','@@');
console.log(c);
//var url = "http://f.hiphotos.baidu.com/image/pic/item/7c1ed21b0ef41bd56888d6d354da81cb39db3d39.jpg";
//http.get(url, function(res){
//    var imgData = "";
//    res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
//
//    res.on("data", function(chunk){
//        imgData+=chunk;
//    });
//
//    res.on("end", function(){
//        fs.writeFile(__dirname+ '\\a1.jpg', imgData, "binary", function(err){
//            if(err){
//                console.log("down fail");
//            }
//            console.log("down success");
//        });
//    });
//});