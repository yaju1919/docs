(function() {
    'use strict';
    function baseN(base){ // N進数を作成するクラス
        var len = base.length, reg = /^0+(?=.+$)/;
        this.encode = function(num){ // 10進数をN進数に変換
            if(isNaN(num)) return NaN;
            var str = "", v = num;
            while(v !== 0){
                v = parseInt(v);
                str = base[v % len] + str;
                v /= len;
            }
            return str.replace(reg,"");
        }
        this.decode = function(str){ // N進数を10進数に変換
            return String(str).replace(reg,"").split("").reverse().map(function(v,i){
                return base.indexOf(v) * Math.pow(len, i);
            }).reduce(function(total, v){
                return total + v;
            });
        }
    }
    var to64 = new baseN([
        '0123456789',
        'abcdefghijklmnopqrstuvwxyz',
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        '-_'
    ].join(''));
    function encode(str){
        return str.split('').map(function(v){
            return ("000"+to64.encode(v.charCodeAt(0))).slice(-3);
        }).join('');
    }
    function decode(str){
        return str.replace(/.{3}/g, function(n){
            return String.fromCharCode(to64.decode(n));
        });
    }
    //---------------------------------------------------------------------------------
    var h = $("<center>").appendTo($("body"));
    var query = {}; // title = "タイトル", text = "コンテンツ", background = "背景"
    location.search.slice(1).split('&').map(function(v){
        var ar = v.split('=');
        if(ar.length !== 2) return;
        query[ar[0]] = decode(ar[1]);
    });
    var reg_URL = /(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g;
    //---------------------------------------------------------------------------------
    (!location.search.length || query.ver ? edit_mode : view_mode)();
    function view_mode(){ // 閲覧モード
        $("body").css({
            "background-color": query.color,
            "background-image": "url(" + query.img + ")",
            "color": query.font
        });
        $("title").text(query.title);
        $("<h1>",{text: query.title}).appendTo(h);
        var MAX = 50;
        $("<h3>").html(query.text.replace(/\n/g, "<br>").replace(reg_URL, function(url){
            var url2 = url;
            if(url.length > MAX) url2 = url.slice(0,MAX) + '…';
            return $("<a>",{text: url2, href: url, target: "_blank"}).prop("outerHTML");
        })).appendTo(h);
    }
    //---------------------------------------------------------------------------------
    function edit_mode(){ // 編集モード
        $("title").text("簡易ホームページ作成ツール");
        $("<h1>").appendTo(h).html("簡単な文書ページが作成できます。<br>URLを作成し、他人と共有できます。");
        query.title = addInput("タイトル");
        query.img = addInput("背景の画像", "画像のurl");
        query.color = addInput("背景の色", "RGB形式カラーコード");
        query.font = addInput("文字の色", "RGB形式カラーコード");
        query.text = $("<textarea>", {
            placeholder: "本文\n650字以内で書いてください。"
        }).appendTo(h).keyup((function(){
            var text = $(this).val();
            $(this).height((text.split('\n').length + 2) + "em");
            show_length.text("現在の文字数:"+text.length);
        })).css({
            width: "70%"
        });
        var show_length = $("<div>").appendTo(h);
        var url = "";
        addBtn("URLを生成", function(){
            var array = [];
            for(var k in query) {
                if(!query[k].val) continue;
                var value = query[k].val();
                if(value.length === 0) continue;
                array.push([k, encode(value)]);
            }
            url = location.origin + location.pathname + '?' + array.map(function(v){
                return v.join('=');
            }).join('&');
            $("<div>",{text: "URLの長さ:"+url.length}).appendTo(show_url.empty());
            $("<a>",{text: url, href: url, target: "_blank"}).appendTo(show_url);
        });
        addBtn("コピー", function(){
            var e = document.createElement("textarea");
            e.textContent = url;
            var body = document.getElementsByTagName("body")[0];
            body.appendChild(e);
            e.select();
            document.execCommand('copy');
            body.removeChild(e);
        });
        var show_url = $("<div>").appendTo(h);
        function addInput(title, placeholder){
            return $("<input>",{
                placeholder: placeholder
            }).appendTo($("<div>",{text: title + ':'}).appendTo(h));
        }
        function addBtn(title, func){
            return $("<button>",{text:title}).click(func).appendTo(h);
        }
    }
    //---------------------------------------------------------------------------------
})();
