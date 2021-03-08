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
    var alias = {
        a: "ttl",
        b: "img",
        c: "color",
        d: "alpha",
        e: "font",
        f: "pos",
        g: "auto",
        h: "text",
        i: "imgur",
    };
    for(var k2 in alias) if(p[k2]) p[alias[k2]] = p[k2];
    //---------------------------------------------------------------------------------
    var reg_URL = /(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)/g;
    if(!Object.keys(p).length) edit_mode();
    else (p.edit ? edit_mode : view_mode)();
    function view_mode(){ // 閲覧モード
        yaju1919.setBgImg(p.img,{
            color: p.color,
            opacity: Number(p.alpha)/100
        });
        $("body").css({
            "color": p.font,
            "text-align": p.pos === '1' ? "left" : p.pos === '2' ? "right" : "center",
            padding: "1em"
        });
        $("title").text(p.ttl);
        $("<h1>",{text: p.ttl}).appendTo(h);
        var MAX = 50;
        $("<div>").html(String(p.text||'').replace(/\n/g, "<br>").replace(reg_URL, function(url){
            if(p.auto) return url;
            var url2 = url, video_flag;
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
                ].indexOf(btm2) !== -1) {
                    elm = $("<video>",{src: url, alt: url, controls: true, preload: "none"});
                    video_flag = true;
                }
            }
            var m,Domain = yaju1919.getDomain(url);
            var query = url.split('?')[1] || '';
            switch(Domain.slice(-2).join('.')){
                case "youtu.be": // YouTube
                    m = url.match(/youtu\.be\/([A-Za-z0-9_\-]+)/);
                case "youtube.com":
                    if(!m) m = url.match(/[\?&]v=([A-Za-z0-9_\-]+)/);
                    if(!m) break;
                    query = query.split('&').filter(function(v){
                        return v.split('=')[0] !== 'v';
                    }).join('&');
                    elm = $("<iframe>",{
                        src: "//www.youtube.com/embed/" + m[1] + '?' + query
                    });
                    video_flag = true;
                    break;
                case "nicovideo.jp": // ニコニコ動画
                case "nico.ms":
                    m = url.match(/sm[0-9]+/);
                    if(!m) break;
                    elm = $("<iframe>",{
                        src: "//embed.nicovideo.jp/watch/" + m[0] + '?' + query
                    });
                    video_flag = true;
                    break;
            }
            function resize(){
                var w = $(window).width() * 0.9;
                if(!w) return setTimeout(resize, 500);
                elm.css({
                    width: w,
                    height: w * (9/16) // 16:9
                });
            }
            if(elm) {
                elm.appendTo(a.text('')).css({maxWidth: "90%"});
                if(video_flag){
                    resize();
                    $(window).resize(resize);
                }
            }
            return (a).prop("outerHTML");
        })).appendTo(h);
        if(p.imgur){
            $("<img>").on("load", function(){
                Function(loadImg(this))();
            }).attr({
                crossOrigin: "anonymous",
                src: "https://i.imgur.com/" + p.imgur + ".png"
            });
        }
    }
    function loadImg(img){
        var width = img.width,
            height = img.height;
        var cv = $("<canvas>").attr({
            width: width,
            height: height
        });
        var ctx = cv.get(0).getContext('2d');
        ctx.drawImage(img,0,0);
        var data = ctx.getImageData(0, 0, width, height).data;
        var ar = [];
        for(var i = 0; i < data.length; i++){
            var i4 = i * 4;
            for(var o = 0; o < 3; o++){
                ar.push(data[i4 + o]);
            }
        }
        var str = '';
        for(var p = 0; p < ar.length; p++){
            var n = ar[p];
            if(n < 128){
                str += String.fromCharCode(n);
            }
            else if(n === 128){
                str += String.fromCharCode((ar[p + 1] << 8) + ar[p + 2]);
                p += 2;
            }
        }
        return str.replace(/\0+$/,'');
    }
    //---------------------------------------------------------------------------------
    function edit_mode(){ // 編集モード
        var q = {};
        $("title").text("Webページジェネレータ");
        $("<h1>",{text:"手軽にWebページが作成できます。"}).appendTo(h);
        $("<h2>",{text:"作ったURLを公開し、他人と共有してみよう。"}).appendTo(h);
        $("<small>").appendTo(h).html("作品ページのURLのクエリパラメータに「&edit=1」を付け加えると再編集ができます。");
        h.append("<br><br>");
        q.ttl = yaju1919.addInputText(h,{
            title: "タイトル",
            placeholder: "文書ページのタイトル",
            value: p.ttl,
            hankaku: false,
        });
        q.img = yaju1919.addInputText(h,{
            title: "画像",
            placeholder: "画像のURL",
            value: p.img,
        });
        q.color = yaju1919.addInputText(h,{
            title: "フィルタの色",
            placeholder: "RGB形式カラーコード",
            value: p.color,
        });
        q.alpha = yaju1919.addInputNumber(h,{
            title: "フィルタの濃さ[%]",
            placeholder: "0~100",
            value: p.alpha,
            min: 0,
            max: 100,
        });
        q.font = yaju1919.addInputText(h,{
            title: "文字の色",
            placeholder: "RGB形式カラーコード",
            value: p.font,
        });
        q.pos = yaju1919.addSelect(h,{
            title: "配置",
            list: {
                "真ん中": 0,
                "左寄り": 1,
                "右寄り": 2,
            },
            value: p.pos
        });
        h.append("<br>");
        q.auto = yaju1919.addInputBool(h,{
            title: "自動的なURLのリンク化を無効",
            value: p.auto === '1'
        });
        h.append("<br>");
        h.append("<br>");
        q.imgur = yaju1919.addInputText(h,{
            title: "JavaScriptを圧縮した画像",
            placeholder: "imgurの画像ID",
            value: p.imgur,
            change: function(v){
                return v.replace(/^https:\/\/imgur\.com\//,'');
            }
        });
        $("<a>",{target:"_blank",href:"https://yaju1919.github.io/str-to-img/",text:"画像はこちらで作成できます。"}).appendTo(h);
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
            for(var k in q) {
                var value = q[k]();
                if(!value || value.length === 0 || value === '0') continue;
                if(yaju1919.judgeType(value,"Boolean")) value = 1;
                var key = Object.keys(alias).filter(function(v){
                    return alias[v] === k;
                })[0];
                if(!key) continue;
                array.push([key, yaju1919.encode(String(value))]);
            }
            var url = location.href.replace(/\?.*$/g,"") + '?' + array.map(function(v){
                return v.join('=');
            }).join('&');
            $("<div>",{text: "URLの長さ:"+url.length}).appendTo(show_url.empty());
            $("<a>",{text: "作成したページの直リンク", href: url, target: "_blank"}).appendTo(show_url);
            yaju1919.addInputText(show_url,{
                title: "copy",
                value: url,
                readonly: true,
                textarea: true,
            });
        });
        var show_url = $("<div>").appendTo(h);
    }
    //---------------------------------------------------------------------------------
})();
