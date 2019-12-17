(function() {
    'use strict';
    function baseN(base){ // N進数を作成するクラス
        var len = base.length, reg = /^0+/;
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
                return base.indexOf(v) * (len ** i);
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
    //---------------------------------------------------------------------------------
    var h = $("<center>").appendTo($("body"));
    var query = {}; // title = "タイトル", text = "コンテンツ", background = "背景"
    var reg_URL = new RegExp(
        '^(https?:\\/\\/)?'+ // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
        '(\\#[-a-z\\d_]*)?$','gi'
    ); // fragment locator
    //---------------------------------------------------------------------------------
    (location.search.length ? view_mode : edit_mode)();
    function view_mode(){ // 閲覧モード
        location.search.slice(1).split('&').map(function(v){
            var ar = v.split('=');
            query[ar[0]] = to64.decode(ar[1]);
        });
        $("body").css({
            "background-color": query.color,
            "background-image": "url(" + query.img + ")",
            "color": query.font
        });
        $("<h1>",{text: query.title}).appendTo(h);
        $("<h3>",{text: query.text}).appendTo(h);
    }
    //---------------------------------------------------------------------------------
    function edit_mode(){ // 編集モード
        $("<h1>",{text: "簡単な文書ページが作成できます。"}).appendTo(h);
        query.title = addInput("タイトル");
        query.img = addInput("背景の画像", "画像のurl");
        query.color = addInput("背景の色", "RGB形式カラーコード");
        query.font = addInput("文字の色", "RGB形式カラーコード");
        query.text = addInput("本文", "650字以内で書いてください。").keyup((function(){
            var text = $(this).val();
            $(this).height((text.split('\n').length + 2) + "em");
            show_length.text("現在の文字数:"+text.length);
        }));
        var show_length = $("<div>").appendTo(h);
        var url = "";
        addBtn("URLを生成", function(){
            var array = [];
            for(var k in query) {
                var value = query[k].val();
                if(value.length === 0) continue;
                array.push([k, to64.encode(value)]);
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
        function addInput(title, placeholder, textarea_flag){
            return $(textarea_flag ? "<textarea>" : "<input>",{
                placeholder: placeholder
            }).appendTo($("<div>",{text: title + ':'}).appendTo(h));
        }
        function addBtn(title, func){
            return $("<button>",{text:title}).click(func).appendTo(h);
        }
    }
    //---------------------------------------------------------------------------------
})();
