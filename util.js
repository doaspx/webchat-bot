/**
 * Created by zhanghongtao on 2016/1/14.
 */
var util = {

    getDeviceID : function () {
        return "e" + ("" + Math.random().toFixed(15)).substring(2, 17)
    },
    Now : function () {
        return  + (+new Date + "" + Math.round(Math.random() * 10000))
    }, //
    getCookie : function (e) {
        for (var t = e + "=", o = document.cookie.split(";"), n = 0; n < o.length; n++) {
            for (var r = o[n]; " " == r.charAt(0); )
                r = r.substring(1);
            if (-1 != r.indexOf(t))
                return r.substring(t.length, r.length)
        }
        return ""
    }, //
    getSkey : function () {
        var src = $(".main_inner .header .avatar img").attr("src");
        var result = /\@crypt_.{0,41}/.exec(src);
        return result != null && result.length > 0 ? result[0] : "";
    },
    getFromUserName : function () {
        var src = $(".main_inner .header .avatar img").attr("src");
        var result = /\&username=(\@.+?)\&/.exec(src);
        return result != null && result.length > 0 ? result[1] : "";
    }, //
    getActiveRoom : function () {
        var cmStr = $("[ng-repeat='chatContact in chatList track by chatContact.UserName'] .active").attr("data-cm");
        var json = JSON.parse(cmStr);
        return json != null && json.username != null ? json.username : "";
    } //
};

module.exports = util;