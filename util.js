/**
 * Created by zhanghongtao on 2016/1/14.
 */

    var _ = require('lodash');
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
    }, //
    filterMsgList: function(list){
        return _.filter(list, function(item){ return item.MsgType == 1 && item.FromUserName != 'newsapp'});
    },
    findNickName: function(list, userName){
        var fil = _.filter(list, {'UserName': userName});
        if(fil.length > 0) return _.result(fil[0],'NickName');
        else return 'Ä³ÈË';
    },
    urlEncode :function (str) {
        var ret = "";
        var strSpecial = "!\"#$%&()*+,/:;<=>?[]^`{|}~%";
        var tt = "";
        for (var i = 0; i < str.length; i++) {
            var chr = str.charAt(i);
            var c = str2asc(chr);
            tt += chr + ":" + c + "n";
            if (parseInt("0x" + c) > 0x7f) {
                ret += "%" + c.slice(0, 2) + "%" + c.slice(-2);
            }
            else {
                if (chr == " ")
                    ret += "+";
                else if (strSpecial.indexOf(chr) != -1)
                    ret += "%" + c.toString(16);
                else
                    ret += chr;
            }
        }
        return ret;
    },
    urlDecode: function(str) {
        var ret = "";
        for (var i = 0; i < str.length; i++) {
            var chr = str.charAt(i);
            if (chr == "+") {
                ret += " ";
            }
            else if (chr == "%") {
                var asc = str.substring(i + 1, i + 3);
                if (parseInt("0x" + asc) > 0x7f) {
                    ret += asc2str(parseInt("0x" + asc + str.substring(i + 4, i + 6)));
                    i += 5;
                }
                else {
                    ret += asc2str(parseInt("0x" + asc));
                    i += 2;
                }
            }
            else {
                ret += chr;
            }
        }
        return ret;
    }
};

module.exports = util;