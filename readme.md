## 跨域请求技术 代码实现
1. 跨域资源共享CORS（Cross-Origin Resource Sharing）------**xhr  需要服务端返回带有  `Access-Control-Allow-Origin` 的响应头**
2. 图像Ping------**动态生成img标签**
3. JSONP------**动态生成script标签**
4. Comet `['kɒmɪt]`------**长链接   http 流**
5. 服务器发送事件------**EventSource 对象**
6. Web Socket------**WebSocket 对象**

#### 跨域资源共享CORS（Cross-Origin Resource Sharing）
- 请求地址： http://localhost:3000/

- server1服务器（localhost:3000） CORS.html


    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Document</title>
    </head>
    <body>
        <h1>CORS(Cross Origin Resource Sharing)</h1>
        <p></p>
        <script>
            function createCORSRequest(method, url){
                var xhr = new XMLHttpRequest();
                if("withCredentials" in xhr){
                    xhr.open(method, url, true);
                } else if (typeof XDomainRequest != "undefined"){
                    xhr = new XDomainRequest();
                    xhr.open(method, url);
                } else {
                    xhr = null;
                }
                return xhr;
            }
    
            var request = createCORSRequest("get", "http://localhost:4000/CORS");
            if (request){
                request.onload = function(){
                    if (request.readyState == 4){
                        //console.log(request.status, request.responseText);	
                        document.getElementsByTagName("p")[0].innerHTML = "request.status: " + request.status + ", request.responseText: " + request.responseText;
                    }
                    
                };
                request.send();
            }
        </script>
    </body>
    </html>

- server2服务器（localhost:4000） /page页 controller


    var express = require('express');
    var router = express.Router();
    
    /* GET home page. */
    router.get('/', function(req, res, next) {
    
    if(req.hostname == "localhost"){
         res.set('Access-Control-Allow-Origin',"http://localhost:3000");
         res.send({cnt: "success"});
    }
    
    });
    
    module.exports = router;


#### 图像Ping
- 动态创建图像经常用于图像Ping。图像Ping是与服务器进行简单、单向的跨域通信的一种方式。请求的数据是通过查询字符串形式发送的，而响应可以是任意内容，但通常是像素图或204响应。通过图像Ping，浏览器得不到任何具体的数据，但通过侦听load和error事件，它能知道响应是什么时候接收到的。

- 请求地址： http://localhost:3000/imgPing

- server1服务器（localhost:3000） imgPing.html


    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Document</title>
    </head>
    <body>
        <h1>image Ping</h1>
        <script>
            var img = new Image();
            
            img.onload = img.onerror = function(){
                 console.log("Done!");
            }
            
            img.src = "http://localhost:4000/imgPing?name=imgPing";
        </script>
    </body>
    </html>

- 这里创建了一个Image的实例，然后将onload和onerror事件处理程序指定为同一个函数。这样无论是什么响应，只要请求完成，就能得到通知。请求从设置src属性那一刻开始，而这个例子在请求中发送了一个name参数。

- 图像Ping最常用于跟踪用户点击页面或动态广告曝光次数。图像Ping有两个主要的缺点：
    - 只能发送GET请求；
    - 无法访问服务器的响应文本。

- 因此， 图像Ping只能用于浏览器与服务器间的单向通信。


#### JSONP
- JSONP是JSON with padding (填充式JSON或参数式JSON) 的简写，是应用JSON的一种新方法。 被包含在函数调用中的JSON。

- JSONP之所以在开发人员中极为流行， 主要原因是它非常简单易用。 与图像Ping相比， 它的优点在于能够直接访问响应文本，支持在浏览器与服务器之间的双向通信。

- 不过，JSONP也有两点不足：
    - 首先，JSONP是从其他域中加载代码执行。如果其他域不安全，很可能会在响应中夹带一些恶意代码， 而此时除了完全弃用JSONP调用之外， 没有办法追究。
    - 其次，要确定JSONP请求是否失败并不容易。虽然HTML5给`<script>`元素新增了一个onerror事件处理程序， 但目前还没有得到任何浏览器的支持。为此，开发人员不得不使用计时器检测指定时间内是否接收到了响应。但就算这样也不能尽如人意， 毕竟不是每个用户上网的速度和带宽都一样。

- 请求地址： http://localhost:3000/jsonp

- server1 中的  jsonp.html


    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Document</title>
    
    </head>
    <body>
        <h1>JSONP</h1>
        <h3></h3>
        
        <script>
            function handleResponse(response){
                document.getElementsByTagName("h3")[0].innerHTML = "You're at IP address " + response.ip + ", which is in " +
                response.city + ", " + response.region_name;
            }
            
            var script = document.createElement("script");
            script.src = "http://localhost:4000/jsonp?callback=handleResponse";
            document.body.insertBefore(script, document.body.firstChild);
        
        </script>
    
    </body>
    </html>

- server2 中的 controller


    var express = require('express');
    var router = express.Router();
    
    /* GET home page. */
    router.get('/', function(req, res, next) {
         console.log(req.query.callback);
         res.send(req.query.callback + "({ip:'192.168.68.144',city:'hz',region_name:'zj'})");
    });
    
    module.exports = router;

#### Comet

- Comet是一种服务器向页面推送数据的技术。Comet能够让信息近乎实时地被推送到页面上，非常适合处理体育比赛的分数和股票报价。

- 有两种实现Comet的方式：长轮询和流。
##### **长轮询**
- 页面发起一个到服务器的请求， 然后服务器一直保持连接打开，直到有数据可发送。发送完数据之后， 浏览器关闭连接， 随即又发起一个到服务器的新请求。这一过程在页面 打开期间一直持续不断。
      
  长连接、长轮询一般应用与WebIM、ChatRoom和一些需要及时交互的网站应用中。其真实案例有：WebQQ、Hi网页版、Facebook IM等。

- 请求地址： http://localhost:3000/longPolling

- longPolling.html


    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Document</title>
    </head>
    <body>
        <h1>Long Polling</h1>
        <ul>
        
        </ul>
        <script>
            var count = 0;
            function LongPolling(){
                var xhr = new XMLHttpRequest();
                var url = 'http://localhost:4000/longPolling';
                xhr.open('get', url, true); // async
                xhr.onreadystatechange = function(){
                    if (xhr.readyState == 4){
                        console.log(xhr.status, xhr.responseText);
                        if(xhr.status == 200){
                            var li = document.createElement("li");
                            li.innerHTML = xhr.responseText;
                            document.getElementsByTagName("ul")[0].appendChild(li);
                        }
                    
                        count++;
                        if(count < 5){
                            LongPolling();
                        }
                    
                    }
                
                }
                
                xhr.send();
            }
            
            LongPolling();
        </script>
    </body>
    </html>

- server2 long polling controller


    var express = require('express');
    var router = express.Router();
    
    var count = 0;
    /* GET home page. */
      router.get('/', function(req, res, next) {
          if(req.hostname == "localhost"){
              setTimeout(function(){
                  count++;
                  res.set('Access-Control-Allow-Origin',"http://localhost:3000");
                  res.send("access success: " + count);
              }, 5000);
        
          }
      });
    
    module.exports = router;


##### 流
- 所有服务器端语言都支持打印到输出缓存，然后刷新的功能。这正是实现HTTP流的关键所在。
      
- 在浏览器中，通过侦听readyStateChange事件及检测 readyState 的值是否为 3， 就可以利用XHR对象实现HTTP流。
      
- 请求地址： http://localhost:3000/httpStreaming
      
- httpStream.html


    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Document</title>
    </head>
    <body>
        <h1>HTTP Stream</h1>
        <ul>
            
        </ul>
        <script>
            function createStreamingClient(url, progress, finished){
                var xhr = new XMLHttpRequest();
                var received = 0;
                xhr.open("get", url, true);
                xhr.onreadystatechange = function(){
                    var result;
    
                    if (xhr.readyState == 3){
                        //只取得最新数据并调整计数器
                        result = xhr.responseText.substring(received);
                        received += result.length;
                        //调用progress回调函数
                        progress(result);
                    } else if (xhr.readyState == 4){
                        finished(xhr.responseText);
                    }
                };
                xhr.send(null);
                return xhr;
            }
    
            var client = createStreamingClient("http://localhost:4000/httpStreaming",function(data){
                    var li = document.createElement("li");
                    li.innerHTML = "Received: " + data;
                    document.getElementsByTagName("ul")[0].appendChild(li);
                }, function(data){
                    var li = document.createElement("li");
                    li.innerHTML = data;
                    document.getElementsByTagName("ul")[0].appendChild(li);
                });
        </script>
    </body>
    </html>

- server2 http streaming controller


    var express = require('express');
    var router = express.Router();
    
    /* GET home page. */
    router.get('/', function(req, res, next) {
        
        if(req.hostname == "localhost"){
            res.set('Access-Control-Allow-Origin',"http://localhost:3000");
        res.set('Content-Type','text/html');  // html格式 可以边下载边解析
            //res.send({cnt: "success"});
    
            var count = 0;
            function resWrite(){
                res.write("server2 data: " + count + "\n");
                count ++;
                if(count <5){
                    delay(5000, resWrite);		
                }else {
                    resEnd();
                }
                
            }
    
            function resEnd(){
                res.end("server2 end");
            }
    
            delay(5000, resWrite);
            
        }
        
    });
    
    
    function delay(time, ResWrite){
        setTimeout(function(){
            ResWrite();
        }, time);
    }
    
    module.exports = router;

#### 服务器发送事件

- SSE(Server-Sent Events, 服务器发送事件) 是围绕只读Comet交互推出的API或者模式。SSE API用于创建到服务器的单向连接， 服务器通过这个连接可以发送任意数量的数据。 服务器响应的MIME类型必须是 text/event-stream， 而且是浏览器中的 Javascript API能解析格式输出。

- SSE支持短轮询，长轮询和HTTP流， 而且能在断开连接时自动确定何时重新连接。

- [tutorial](http://javascript.ruanyifeng.com/htmlapi/eventsource.html)

- 请求地址： http://localhost:3000/sse

- sse.html


    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Document</title>
    </head>
    <body>
        <h1>Server-Sent Events(SSE), 服务器发送事件</h1>
        <ul>
            
        </ul>
        <script>
            var source = new EventSource("http://localhost:4000/SSE");
            source.onmessage = function(event){
                var data = event.data;
                //console.log(data);
                // 处理数据
                var li = document.createElement("li");
                li.innerHTML = "Received: " + data;
                document.getElementsByTagName("ul")[0].appendChild(li);
    
                //source.close();
            }
    
            setTimeout(function(){
                source.close();
            }, 20 * 1000);
        </script>
        
    </body>
    </html>


- server2 sse controller


    var express = require('express');
    var router = express.Router();
    
    var count = 0;
    var arrayData =["this","is","a","server","sent","event"];
    var aDL = arrayData.length;
    /* GET home page. */
    router.get('/', function(req, res, next) {
      if(req.hostname == "localhost"){
            count++;
            res.set('Access-Control-Allow-Origin',"http://localhost:3000");
            res.set('Content-Type','text/event-stream'); 
            res.set('Cache-Control','no-cache');
            res.set('Connection','keep-alive');
            //data字段后必须有空行
            res.send("data: " + arrayData[count%aDL] + "\n\n id: " + count); 
            
        }
    });
    
    module.exports = router;


#### Web Socket

- Web Sockets 的目标是在一个单独的持久连接上提供全双工、双向通信。在JavaScript中创建了Web Socket之后，会有一个HTTP请求发送到浏览器以发起连接。在取得服务器响应后，建立的连接会使用HTTP升级，从HTTP协议交换为Web Socket协议。

- 使用标准的HTTP服务器无法实现 Web Sockets， 只有支持这种协议的专门服务器才能正常工作。

- 请求地址： http://localhost:3000/WebSocket

- server1 WebSocket.html


    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Document</title>
    </head>
    <body>
        <h1>Web Sockets</h1>
        <ul>
            
        </ul>
        <script>
            var socket = new WebSocket("ws://localhost:4000/WebSocket");
            var message = { text: "hello server2", id: 1};
            
    
            socket.onopen = function(){
                socket.send(JSON.stringify(message)); // 发送字符串
            }
    
            socket.onmessage = function(event){
                // MessageEvent 对象中的属性: 
                //{isTrusted: true, data: "{"data":"hello client"}", origin: "ws://localhost:4000", lastEventId: "", .... }
                //console.log(event);
                var data = JSON.parse(event.data);
    
                //处理数据
                var li = document.createElement("li");
                li.innerHTML = "Received: " + data.data;
                document.getElementsByTagName("ul")[0].appendChild(li);
    
                socket.close();
    
            }
    
            socket.onclose = function(){
                console.log("Connection closed.");
            }
    
            socket.onerror = function(){
                console.log("Connection error.");	
            }
        </script>
    </body>
    </html>

- server2  web socket controller


    var app = require('../app');
    var debug = require('debug')('server2:server');
    var http = require('http');
    var url = require('url');
    var WebSocketServer = require('ws').Server;
    
    /**
     * Get port from environment and store in Express.
     */
    
    var port = normalizePort(process.env.PORT || '4000');
    app.set('port', port);
    
    /**
     * Create HTTP server.
     */
    
    var server = http.createServer(app);
    var wss = new WebSocketServer({ server: server })
    
    
    wss.on('connection', function connection(ws) {
      var location = url.parse(ws.upgradeReq.url, true);
      // you might use location.query.access_token to authenticate or share sessions 
      // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312) 
    
      //console.log(location);
      if(location.path == "/WebSocket"){
    
          ws.on('message', function incoming(message) {
            //console.log(typeof message); // string
            var msg = JSON.parse(message);
            console.log('received: %s', msg.text);
            ws.send(JSON.stringify({data:'hello client',id:msg.id}));
          });
      }
    
    });


#### 备注
 
- 本文参考《JavaScript 高级程序设计》第三版  21.4 ， 21.5   这两节， 并 对每种跨域请求技术 做了实践。

