var server;
var ip   = "127.0.0.1";
var port = 1234;
var http = require("http");
var path = require("path");
var ziwei = require('./ziwei');
var fs = require('fs');
const url = require('url');
//設定http server，req參數是代表client傳來的要求，res代表server端的動作
var host = "http://" + ip + ":" + port;
server = http.createServer( async function (req, res) {
var queryKeys = ["name","y","m","d","h","g","t"];
var queryStatus = true;
    //取得路徑，依照路徑不同回覆client不同的資料
    var pathname  = url.parse(req.url,true).pathname;
    var query  = url.parse(req.url,true).query;
    var segment  = pathname.split("/");
    switch(segment[1]){
        case "assets":
            var filePath = '.' + pathname;
            var extension = path.extname(filePath);
            var contentType;
            switch(extension){
                case ".js":
                    contentType = "text/javascript";
                break;
                case ".css":
                    contentType = "text/css";
                break;
            }
            fs.readFile(filePath, function(error, content) {
                res.writeHead(200, {'Content-Type': contentType+';charset=utf-8'});
                res.end(content, 'utf-8');
            });
            break;
        case "download":
                if(segment.length == 9){
                    query = {
                        name : decodeURIComponent(segment[2]),
                        y : segment[3],
                        m : segment[4],
                        d : segment[5],
                        h : decodeURIComponent(segment[6]),
                        g : decodeURIComponent(segment[7]),
                        t : decodeURIComponent(segment[8])
                    };
                }
				var pdfFilename = ziwei.createPdf(query);
                console.log(pdfFilename);
				await new Promise(resolve => setTimeout(resolve, 1000));
	        	var img = fs.readFileSync(pdfFilename);
	            res.setHeader('Content-disposition', 'attachment; filename='+encodeURIComponent(pdfFilename));
	     		res.writeHead(200, {'Content-Type': 'application/pdf' });
	     		res.end(img);
		break;
        case "pizza":
            queryStatus = true;
            Object.getOwnPropertyNames(query).forEach(function(e){
                if(queryKeys.indexOf(e) == -1){
                    queryStatus = false;
                }
            });
            if(Object.getOwnPropertyNames(query).length > 0){
                var profile;
                res.writeHead(200, {'Content-Type': 'application/json;charset=utf-8'});
                if(queryStatus === true){
                    profile = ziwei.getProfile(query);
                }else{
                    profile = ziwei.getProfile({});
                }
                res.end(JSON.stringify(profile));
            }else{
                fs.readFile('index.html', 'UTF-8',function (err, data){
                    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                    if(segment.length == 9){
                        query = {
                            name : decodeURIComponent(segment[2]),
                            y : segment[3],
                            m : segment[4],
                            d : segment[5],
                            h : decodeURIComponent(segment[6]),
                            g : decodeURIComponent(segment[7]),
                            t : decodeURIComponent(segment[8])
                        };
                    }
                    profile = ziwei.getProfile(query);
                    data = data.replace("___JSON_PROFILE___", JSON.stringify(profile));
                    res.write(data);
                    res.end();
                });
            }
            break;
        case "favicon.ico":
            res.writeHead(200, {'Content-Type': 'image/x-icon'} );
            res.end();    
        break;
        default:
            fs.readFile('index.html', 'UTF-8',function (err, data){
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
                profile = ziwei.getProfile({});
                data = data.replace("___JSON_PROFILE___", JSON.stringify(profile));
                res.write(data);
                res.end();
            });
        break;
    }
    //當透過瀏覽器連接時，path除了顯示瀏覽器連的路徑外，還會顯示/favicon.ico(瀏覽器讀取icon的關係)
    
});

//啟動http server，監聽http行為
server.listen(port, ip);

console.log("Server running at "+host);