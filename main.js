(function() {
    'use strict';
    var h = $("<div>").appendTo($("body").css({
        "text-align": "center"
    }));
    function addBtn(title, func){
        return $("<button>",{text:title}).click(func).appendTo(h);
    }
    var p = yaju1919.getParam();
    for(var k in p) p[k] = yaju1919.decode(p[k]);
    //---------------------------------------------------------------------------------
    var reg_URL = /(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g;
    (p.edit === '0' ? view_mode : edit_mode)();
    function view_mode(){ // 閲覧モード
        if(reg_URL.test(p.img)) {
            yaju1919.setBgImage(p.img,{
                color: p.color,
                opacity: Number(p.alpha)/100
            });
        }
        else $("body").css({"background-color": p.img});
        $("body").css({
            "color": p.font,
            "text-align": !p.pos || p.pos === "2" ? "center" : p.pos === "3" ? "right" : "left",
            padding: "1em"
        });
        $("title").text(p.ttl ? p.ttl : "untitled");
        $("<h1>",{text: p.ttl}).appendTo(h);
        var MAX = 50;
        $("<div>").html(String(p.text).replace(/\n/g, "<br>").replace(reg_URL, function(url){
            if(p.auto && p.auto !== '0') return url;
            var url2 = url;
            if(url.length > MAX) url2 = url.slice(0,MAX) + '…';
            var a = $("<a>",{text: url2, href: url, src: url, target: "_blank"});
            var btm = url.match(/\.[0-9a-zA-Z]+?$/);
            if(btm) {
                var btm2 = btm[0].slice(1), elm;
                if([
                    "jpg","JPG","jpeg","JPEG","gif","png","bmp","svg","ico"
                ].indexOf(btm2) !== -1) elm = $("<img>",{src: url, alt: url});
                else if([
                    "mp3","wma","wav","aac","ogg","m4a","flac"
                ].indexOf(btm2) !== -1) elm = $("<audio>",{src: url, alt: url, controls: true});
                else if([
                    "mov","mp4","mpg","mpeg","avi","m4v","flv","wmv"
                ].indexOf(btm2) !== -1) elm = $("<video>",{src: url, alt: url, controls: true, preload: "none"});
            }
            var Domain = yaju1919.getDomain(url), m, sub;
            switch(Domain.slice(-2).join('.')){
                case "youtu.be": // YouTube
                    m = url.match(/youtu\.be\/([A-Za-z0-9_\-]+)/);
                case "youtube.com":
                    if(!m) m = url.match(/\?v=([A-Za-z0-9_\-]+)/);
                    if(!m) break;
                    sub = url.match(/t(=[0-9]+)/);
                    sub = sub ? "?start" + sub[1] : "";
                    elm = $("<iframe>",{src: "//www.youtube.com/embed/" + m[1] + sub});
                    break;
                case "nicovideo.jp": // ニコニコ動画
                case "nico.ms":
                    m = url.match(/sm[0-9]+/);
                    if(!m) break;
                    sub = url.match(/from(=[0-9]+)/);
                    sub = sub ? "?from" + sub[1] : "";
                    elm = $("<iframe>",{src: "//embed.nicovideo.jp/watch/" + m[0] + sub});
                    break;
            }
            if(elm) elm.appendTo(a.text('')).css({"max-width":"90%"});
            return (a).prop("outerHTML");
        })).appendTo(h);
    }
    //---------------------------------------------------------------------------------
    function edit_mode(){ // 編集モード
        var q = {};
        $("title").text("Webページジェネレータ");
        $("<h1>",{text:"手軽にWebページが作成できます。"}).appendTo(h);
        $("<h2>",{text:"作ったURLを公開し、他人と共有してみよう。"}).appendTo(h);
        $("<small>").appendTo(h).html("作品ページのURLの「https://yaju1919.github.io/page/?edit=0」を「?edit=1」に変えて再度アクセスすると再編集ができます。");
        h.append("<br>");
        $("<a>",{target:"_blank",href:"https://www2.x-feeder.info/docs/",text:"作品はこちらで公開&保管できます。"}).appendTo(h);
        h.append("<br>");
        h.append("<br>");
        h.append("<br>");
        q.ttl = yaju1919.addInputText(h,{
            title: "タイトル",
            placeholder: "文書ページのタイトル",
            value: p.ttl,
            hankaku: false,
        });
        q.img = yaju1919.addInputText(h,{
            title: "下層背景の色or画像",
            placeholder: "カラーコードor画像のURL",
            value: p.img||"https://illustimage.com/photo/9388.png?20190127",
        });
        q.color = yaju1919.addInputText(h,{
            title: "上層背景の色",
            placeholder: "RGB形式カラーコード",
            value: p.color||"#000000",
        });
        q.alpha = yaju1919.addInputNumber(h,{
            title: "上層背景の透過度[%]",
            placeholder: "0~100",
            value: Number(p.alpha)||"40",
            min: 0,
            max: 100,
        });
        q.font = yaju1919.addInputText(h,{
            title: "文字の色",
            placeholder: "RGB形式カラーコード",
            value: q.font||"#FFFFFF",
        });
        q.pos = yaju1919.addSelect(h,{
            title: "配置",
            list: {
                "左寄り": '1',
                "真ん中": '2',
                "右寄り": '3',
            },
            value: p.pos||'2'
        });
        h.append("<br>");
        q.auto = yaju1919.addInputBool(h,{
            title: p.auto||"自動的なURLのリンク化を無効"
        });
        h.append("<br>");
        h.append("<br>");
        var show_length = $("<div>").appendTo(h);
        q.text = yaju1919.addInputText(h,{
            title: "本文",
            placeholder: "本文の内容をここに書いてください。\n画像の拡張子が付いているURLは画像化されます。\nHTMLが使用できます。scriptタグは1行で記述してください。",
            value: p.text,
            change: function(v){
                show_length.text("現在の文字数:"+v.length);
            },
            textarea: true,
            hankaku: false,
        });
        addBtn("URLを生成", function(){
            var array = [];
            array.push(["edit","0"]);
            for(var k in q) {
                var value = q[k]();
                if(!value) continue;
                if(value.length === 0) continue;
                array.push([k, yaju1919.encode(String(value))]);
            }
            var url = location.href.replace(/\?.*$/g,"") + '?' + array.map(function(v){
                return v.join('=');
            }).join('&');
            $("<div>",{text: "URLの長さ:"+url.length}).appendTo(show_url.empty());
            $("<a>",{text: url, href: url, target: "_blank"}).appendTo(show_url);
        });
        var show_url = $("<div>").appendTo(h);
    }
    //---------------------------------------------------------------------------------
})();
