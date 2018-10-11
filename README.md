

# 					  以太坊中心化钱包开发手册

|  修订日期  |   姓名    |          邮箱           |
| :--------: | :-------: | :---------------------: |
| 2018-10-10 | brucefeng | brucefeng@brucefeng.com |



## 前言

在之前的一篇文章[以太坊智能合约项目-Token合约开发与部署](http://blog.51cto.com/clovemfong/2170725)中，我们提到了钱包了钱包的概念以及主流的几种钱包，如**Mist**,**MyEtherWallet**,**MetaMask**等，之前我们主要将钱包作为一个开发工具使用，用于智能合约的开发与调试工作，使用较多的是浏览器插件钱包**MetaMask**。

在本文中，我们主要介绍**MyEtherWallet**以及如何实现一个简易版的**MyEtherWallet**网页版应用，在本文中，我们能够学习到如下内容

* node.js开发基础
* web3.js API使用
* 以太币转账实现
* Token转账实现

目前主流的钱包平台已经有太多了，而且有很多已经做得比较完善了，所以我们本文的开发工作只是为了学习以太坊开发技术，并非去设计一个新的钱包软件，重复造轮子几乎没有任何价值。





## 一. MyEtherWallet介绍

[MyEtherWallet](https://www.myetherwallet.com/) 是一个轻钱包，无需下载，所有操作在直接在网页上就可以完成



![](https://brucefeng-1251273438.cos.ap-shanghai.myqcloud.com/1.png)



**主要功能如下**

* Net Wallet : 新建钱包
* Send Ether && Tokens ：以太币或者Token转账
* Contract: 部署智能合约
* ENS：以太坊域名平台
* Check TX Status: 查看交易状态
* View Wallet Info: 查看钱包信息

由于操作比较简单，这里不做详细讲解，在下文中我们对其主要功能，如新建钱包，以太币或者Token转账，查看交易状态进行参照开发。



## 二.node.js与web.js

### 1.Node.js

Node.js是一个JS运行时环境，可以解析，执行JavaScript代码，在这个执行环境中，为JS提供了一些服务器级别的操作API,如文件读写，网络通信，Http服务器等，其使用事件驱动，非阻塞IO模型(异步)，轻量高效，大多数与JS相关的包都放在npm上，通过命令就可以下载不同的库跟框架，无需在去各个模块的官网上面单独下载，如安装koa直接通过`npm install koa`即可完成。

### 2. Web3.js

web3.js是一个库集合，允许使用HTTP或者RPC连接与本地或者远程以太坊节点进行交互，包含以太坊生态系统的特定功能，开发者利用web3模块主要连接以太坊的RPC层，从而与区块链进行交互

* web3-eth :  与以太坊区块链和智能合约之间的交互
* web3-ssh:   用于进行通信的p2p和广播
* web-bzz:     用于群协议，分散的文件存储
* web3-utils: 主要用于Dapp开发的辅助函数

> 官方文档: https://web3js.readthedocs.io/en/1.0/

(1) 账户相关

[web3.eth.accounts](https://web3js.readthedocs.io/en/1.0/web3-eth-accounts.html)

* 创建钱包账户

`web3.eth.accounts.create();`

* 生成钱包配置

`web3.eth.accounts.encrypt(privateKey, password);`



### 3. Koa中间件

Koa号称是基于Node.js平台的下一代web开发框架，Koa 是一个新的 web 框架，由 Express 幕后的原班人马打造， 致力于成为 web 应用和 API 开发领域中的一个更小、更富有表现力、更健壮的基石。 通过利用 async 函数，Koa 帮你丢弃回调函数，并有力地增强错误处理。 Koa 并没有捆绑任何中间件， 而是提供了一套优雅的方法，帮助您快速而愉快地编写服务端应用程序。

> 其使用方法可以参考https://koa.bootcss.com/

Koa的最大特色就是中间件，Koa中间件是简单的函数，调用app.user()传入，MiddlewareFunction函数带有两个参数(ctx,next),中间件作为HTTP Request和HTTP Reponse的桥梁，用来实现连接功能，如

```
app.use(async (ctx, next) =>{
    console.log(`Process ${ctx.request.method} ${ctx.request.url} ...`);
    await next();
});
```

ctx是一个请求的上下文，封装了传入的http消息，并对该消息进行响应，koa提供了一个Request/Response对象提供了Context的request/response属性与用于处理Http请求的方法。

next是被调用来执行上下游中间件的函数，必须手动调用next()运行下游中间件，否则下游中间件不会被正常执行。可以采用两种不同的方法来实现中间件

* async function
* common function

#### (1) 安装启动Koa服务

* 安装koa

```
$ mkdir koaTest ; cd koaTest
$ npm init -y
$ npm install koa
```

* 创建启动文件

```
$ vim index.js
```

```js
var Koa = require("koa") //导入Koa库
var app = new Koa();     //创建Koa应用对象，带有node http服务的koa接口
app.listen(3003); //启动服务的快捷方法
```

* 启动服务

```
$ node index.js
```

> 此时会监听3003端口，通过浏览器访问

#### (2) Context

context是一个请求的上下文，该对象封装了一个传入的http消息，context有request和response属性，我们可以通过涉案值两个属性来处理和相应不同的请求。

```
$ vim index.js
```

```js
var Koa = require("koa");
var app = new Koa();
//
app.use(function(ctx,next){
    console.log(ctx.request.path);
    //通过设置ctx的response的body值可以返回数据到客户端
    ctx.response.body = "my koa app";
    console.log(ctx.response.type);
});
app.listen("3003");
console.log("koa server is listening on port 3003");


```

* app.use(function)：将给定的function作为中间件加载到应用中。
* ctx: 每一个请求都会创建一段上下文，在控制业务逻辑的中间件中，上下文被寄存在ctx对象中，许多上线文属性和方法都被存在ctx.request和ctx.response中，比如访问ctx.type和ctx.length都被代理到reponse对象，ctx.path和ctx.method都被代理到request对象中。

#### (3) 网页模板

在实际开发中，返回给用户的网页都是通过模板文件进行返回的，可以让Koa先读取模板文件，然后将这个模板返回给用户，需要指定response的type为`text/html`类型

```js
var Koa = require("koa");
var app = new Koa();
var fs = require("fs");
app.use(ctx=>{
    console.log(ctx.path);
    //必须指定type
    ctx.type = "text/html";
 	ctx.body = fs.createReadStream("./views/teest.html");
 	console.log(ctx.type);
});
app.listen(3003);
console.log("koa server is listening on port 3003");
```

#### (4) 中间件

Koa所有的功能都是通过中间件实现的，中间件处于HTTP Request和HTTP Response之间。

Koa的中间件之间按照编码书序在栈内以此执行，允许执行操作并向下传递请求，之后过滤并必须返回响应，响应的测试代码与步骤如下

```
var Koa = require("koa");
var app = new Koa();
//es6新语法:
//函数名 =>(参数) =>{}


var one = (ctx,next) =>{
    console.log("1.1");
    next();
    console.log("1.2");
};

var two = (ctx,next) =>{
    console.log("2.1");
    next();
    console.log("2.2");
};

var three = (ctx, next) =>{
    console.log("3.1");
    next();
    console.log("3.2");
};

app.use(one);
app.use(two);
app.use(three);

app.listen(3003);
console.log("服务启动完毕");
```

返回结果

```
2.1
3.1
3.2
2.2
1.2
```

#### (5) 异步中间件

由async标记的函数被称为异步函数，在异步函数中，可以通过await调用另外一个异步函数，使用await时，其所在的方法必须使用关键字async

```js
var Koa = require("koa");
var app = new Koa();
app.use(async(ctx,next) =>{
    var start = Date.now();
    await next();
    console.log(`${ctx.url} ${Date.now - start}`);
});
app.use(async (ctx,next)=>{
    ctx.response.body = "async test"
});
app.listen(3003);
console.log("服务启动完毕");
```



#### (6) 原生路由

```js
var Koa = require("koa");
var app = new Koa();
//es6新语法:
//函数名 =>(参数) =>{}
app.use((ctx,next)=> {
    console.log("%s %s", ctx.method, ctx.url);
    next();
});

app.use((ctx,next) =>{
    if (ctx.request.path == '/'){
        ctx.response.body = 'index page';
    }else {
        next();
    }
});

app.use((ctx,next) =>{
    if (ctx.request.path == '/error'){
        ctx.response.body = 'error page';
    }
});



app.listen(3003);
console.log("服务启动完毕");
```



#### (7) koa-router路由

由于原生路由使用比较繁琐，所以可以通过封装好的koa-router模块，使用router.routers()绑定到中间件

**安装koa-router**

```
$ npm install koa-router
```

```js
var Koa = require("koa");
var app = new Koa();
//导入koa-router,注意要加上()才能生效
var router = require("koa-router")()
router.get("/hello",function(ctx,next){
    ctx.response.body = "hello,brucefeng";
});

router.get("/bye",function (ctx,next){
    ctx.response.body = "good bye brucefeng";
});

//将router路由注册到中间件
app.use(router.routes());

app.listen(3003);
console.log("服务启动完毕");
```

#### (8) 请求重定向

一般在如下情况下需要使用到重定向

* 后台系统升级，对之前的页面不在支持，此时需要使用重定向到新的API上满足用户的访问准确性
* 完成某个操作后自动跳转至其他页面，如注册成功，登录成功等等

```js
var Koa = require("koa");
var app = new Koa();
//导入koa-router,注意要加上()才能生效
var router = require("koa-router")()
router.get("/hello",function(ctx,next){
    ctx.response.body = "hello,brucefeng";
});

router.get("/hi",function (ctx,next){
   ctx.response.redirect("/hello")
});

//将router路由注册到中间件
app.use(router.routes());

app.listen(3003);
console.log("服务启动完毕");
```

> 通过 ctx.response.redirect("/hello")将"/hi"请求重定向到/hello对应的页面
>
> 在node.js中访问的url中有中文时，需要通过全局encodeURIComponent(string)进行编码

#### (9) 获取get请求参数

客户端在请求获取服务的数据时，获取的URL中通常会携带各种参数，服务端如何获取到get请求的参数呢？

* 格式1：`http://127.0.0.1:3003/hello/brucefeng`

获取方式: `ctx.params.name`

* 格式2：`http://127.0.0.1:3003/bye?name=brucefeng`

获取方式: `ctx.query.name`

> 调用params获取参数的时候，params不是request的属性，需要通过ctx直接调用获取。

#### (10) 获取post请求参数

Get请求的参数附带在了url上，Post请求的参数在请求体body里面，所以要获取body的数据，需要使用到插件`koa-body`,通过`ctx.request.body.name`获取参数.

```
$ npm install koa-router
```

```
var Koa = require("koa");
var app = new Koa();

//导入koa-router,注意要加上()才能生效
var router = require("koa-router")()
//引入koa-body
var koaBody = require("koa-body")


router.post("/hello",function(ctx,next){
    var body = ctx.request.body;
    ctx.response.body = "hello,bruce";
    console.log(body);
    console.log(body.username);
});

//设置multipart : true,支持多个参数
app.use(koaBody({
    multipart:true
}))

//将router路由注册到中间件
app.use(router.routes());

app.listen(3003);
console.log("服务启动完毕");
```

> //通过命令使用curl插件模拟调用一个Post请求
> //curl -H "Content-Type:application/json" -X POST --data '{"username":"brucefeng"}' http://localhost:3003/hello

```
brucefengdeMBP:ETHWalletDemo brucefeng$ node index.js
服务启动完毕
{ username: 'brucefeng' }
brucefeng
```

#### (11) 加载静态资源

加载静态资源，如图片，字体，样式表，脚本等，编码指定静态资源的路径是相对于./static的路径。

```
$ npm install koa-static
```

```
var Koa = require("koa");
var app = new Koa();

//导入koa-router,注意要加上()才能生效
var router = require("koa-router")();
var static = require("koa-static");
var path = require("path")

router.get("/hello",function (ctx,next){
    ctx.response.body = "<html> <a href='/0.png'>看我</html>"
})
//静态资源的路径是相对于./static的路径
app.use(static(path.join(__dirname,"./static")))

//将router路由注册到中间件
app.use(router.routes());

app.listen(3003);
console.log("服务启动完毕");
```

> 启动服务，通过浏览器访问测试

#### (12) 模板引擎

模板引擎ejs需要配上模板渲染中间件koa-views使用，如果需要支持其他后缀的文件，需要将文件扩展名映射到引擎中。

```shell
$ npm install ejs koa-views
```

`index.js`

```js
var Koa = require("koa");
var app = new Koa();

//导入koa-router,注意要加上()才能生效
var router = require("koa-router")();
var static = require("koa-static");
var path = require("path")
var views = require("koa-views")

router.get("/hello",async (ctx,next) =>{
    //将json里面的值替换为文件里面的变量
    var name = "brucefeng";
    await ctx.render("test.ejs",{
        name,
        "sex":"帅哥"
    }) 
})

router.get("/bye",async (ctx,next)=>{
    await ctx.render("home.html",{
        "name": "fengyingcong"
    })
})

app.use(views(
    //默认是views下面获取ejs后缀的文件，如果是其他类型的文件需要指定文件类型
    path.join(__dirname,"./static/views"),
    {extension:"ejs", map:{html: "ejs"}}
))


//静态资源的路径是相对于./static的路径
app.use(static(path.join(__dirname,"./static")))

//将router路由注册到中间件
app.use(router.routes());

app.listen(3003);
console.log("服务启动完毕");
```

`static/views/test.ejs `

```js
<!DOCTYPE <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Page Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" media="screen" href="main.css" />
    <script src="main.js"></script>
</head>
<body>
    <div>姓名: <%= name %> 性别: <%= sex %></div>
</body>
</html>
```

`static/views/home.html `

```js
<!DOCTYPE <!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Page Title</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="stylesheet" type="text/css" media="screen" href="main.css" />
    <script src="main.js"></script>
</head>
<body>
    <div>姓名: <%= name %> </div>
</body>
</html>
```





## 三.初始化项目环境

### 1.导入项目依赖

```
$ mkdir ETHWalletDemo ;cd ETHWalletDemo
$ npm init -y 
$ npm i web3 koa koa-body koa-static koa-views koa-router ejs
```

![](https://brucefeng-1251273438.cos.ap-shanghai.myqcloud.com/2.png)


### 2.创建路由文件

```
$ mkdir  router ; cd router
$ vim router.js
```

```
var router = require("koa-router")()
//定义路由newaccount
router.get("/newaccount",(ctx,next)=>{
    ctx.response.body = "创建钱包"
})

module.exports = router
```



### 3.创建入口文件

`ETHWalletDemo/index.js`

```js
//导入./router/router包
var router = require("./router/router.js")
//引入Koa库
var Koa = require("koa")
//通过koa创建一个应用程序
var app = new Koa()

app.use(router.routes())
app.listen(3003)
console.log("钱包启动成功，请访问http://127.0.0.1:3003/newaccount进行测试")
```



### 4.创建MVC框架

`ETHWalletDemo`下创建

```
$ mkdir models views controllers   #创建MVC框架目录
$ mkdir utils #创建帮助文件目录
$ mkdir -p static/{css,js,html}  #创建静态文件目录
```

### 5.完善项目框架

`ETHWalletDemo/index.js`

```js
//引入Koa库
var Koa = require("koa")
//通过koa创建一个应用程序
var app = new Koa()

//导入./router/router包
var router = require("./router/router.js")
var static = require("koa-static")
var path = require("path")
var views = require("koa-views")
var koaBody = require("koa-body")

//拦截获取网络请求,自定义的function需要使用next()
app.use(async (ctx,next)=>{
    console.log(`${ctx.url} ${ctx.method}...`)
    await next();
})

//注册中间件
//注册静态文件的库到中间件
app.use(static(path.join(__dirname,"static")))
//注册模板引擎的库到中间件
app.use(views(path.join(__dirname,"views"),{extension:"ejs", map:{html: "ejs"}}))
//针对于文件上传时，可以解析多个字段
app.use(koaBody({multipart:true})) 
app.use(router.routes())
app.listen(3003)
console.log("钱包启动成功，请访问http://127.0.0.1:3003/...进行测试")
```





## 四.创建钱包账户

### 1.创建钱包账户

#### (1) 封装web3库调用

`utils/myUtils.js`

```js
var web3 = require("../utils/myUtils").getWeb3()
module.exports = {
    getWeb3: ()=>{
        var Web3 = require("web3");
        var web3 = new Web3(Web3.givenProvider || 'http://127.0.0.1:8545');
        return web3;
    }
}
```



#### (2) 创建控制器

`controllers/newAccount.js`

```js
var web3 = require("../utils/myUtils").getWeb3()

module.exports = {
    //获取创建账号的页面
    newAccountHtml: async (ctx) =>{
        await ctx.render("newaccount.html")
    },
    //表单提交被触发的方法
    newAccount: (ctx) =>{
        console.log("newAccount");
        var password = ctx.request.body.password;
        //通过密码创建钱包账户
        var account = web3.eth.accounts.create(password);
        console.log(account.address);
        ctx.response.body = "钱包账户: "+account.address +" 创建成功";
    }
}
```

#### (3) 创建前端页面

`views/newaccount.html`

```js
<html>
<head>
    <title>创建钱包</title>
</head>
<body>
    <div id="main">
        <h1>创建一个新的钱包</h1>
        <form method="POST" action="/newaccount">
            <input type="text" placeholder="请输入密码" name="password">
            <button type="submit">创建钱包</button>
        </form>
    </div>
</body>
</html>

```



#### (4) 配置路由

`router/router.js`

```js
var router = require("koa-router")()
var newAccount = require("../controllers/newAccount")
//创建账号的页面
router.get("/newaccount",newAccount.newAccountHtml)
//提交创建账号表单
router.post("/newaccount",newAccount.newAccount)

module.exports = router
```





### 2.下载配置文件

#### (1) 创建目录保存配置文件

```
$ mkdir static/keystore
```

#### (2) 实现配置文件的保存

`controllers/newAccount.js`

```js
var web3 = require("../utils/myUtils").getWeb3()
var fs = require("fs")
var path = require("path")
module.exports = {
    //获取创建账号的页面
    newAccountHtml: async (ctx) =>{
        await ctx.render("newaccount.html")
    },
    //表单提交被触发的方法
    newAccount: async (ctx) =>{
        console.log("newAccount");
        var password = ctx.request.body.password;
        //通过密码创建钱包账户
        var account = web3.eth.accounts.create(password);
        console.log(account.address);
        //根据账号私钥跟密码生成keystore文件
        var keystore = web3.eth.accounts.encrypt(account.privateKey, password);
        //keystore文件保存到文件中,
       
        var keystoreString = JSON.stringify(keystore);
         //格式如下:UTC--Date--Adress
         //UTC--2018-09-26T05-07-57.260Z--937d091780693ab7f51331bb52797a9267bb9ed2
        var fileTime = new Date().toDateString()
        var fileName = 'UTC--' + fileTime + '--' + account.address.slice(2) ;
        var filePath = path.join(__dirname,"../static/keystore",fileName)
        fs.writeFileSync(filePath,keystoreString)
        await ctx.render("downloadkeystore.html",{
            "downloadurl":path.join("keystore",fileName),
            "privatekey":account.privateKey
        })
    }
}
```

> 此时生成的Keystore文件将会被保存至static/keystore目录中

#### (3) 创建前端页面

`view/downloadkeystore.html`

```js
<html>

<head>
    <title>保存KeyStore文件</title>
    <script src="js/lib/jquery-3.3.1.min.js"></script>
    <script src="js/lib/jquery.url.js"></script>
    <script src="js/wallet.js"></script>
</head>

<body>
    <div id="nav">
        <script>
            $("#nav").load("html/nav.html")
        </script>
    </div>

    <div id="main">

        <div id="save-keystore">
            <h1>保存KeyStore文件</h1>
            <a href="<%= downloadurl %>">保存KeyStore文件</a>
            <br>
            <button onclick="saveKeystoreNext()">Next Step</button>
        </div>
        <div id="save-privatekey" style="display:none">
            <h1>保存钱包私钥</h1>
            <div>
                <%= privatekey %>
                <span>请务必妥善保管!</span>
            </div>
        </div>
    </div>

</body>

</html>
```

> 由于涉及到了onclick，所以，我们现在需要创建js代码实现相关方法

(4) 实现`saveKeystoreNext`方法

* 导入jquery文件

```
$ mkdir js/lib
```

将`jquery.url.js`与`jquery-3.3.1.min.js`拷贝进lib目录中

* 实现方法

`static/js/wallet.js`

```js
function saveKeystoreNext(){
    //隐藏保存keystore页面
    $("#save-keystore").hide()
    //显示保存private页面
    $("#save-privatekey").show()
}
```



### 3.导航页设计

> 此处的导航页前端用的是蓝鲸智云的MagicBox组件，作为蓝鲸智云的忠实粉丝，推荐大家使用
>
> http://magicbox.bk.tencent.com/

`static/html/nav.html`

```js
<link href="https://magicbox.bk.tencent.com/static_api/v3/assets/bootstrap-3.3.4/css/bootstrap.min.css" rel="stylesheet">
<link href="https://magicbox.bk.tencent.com/static_api/v3/bk/css/bk.css" rel="stylesheet">

<div class="king-horizontal-nav4">
    <div class="logo_wrap">
        <a class="logo" title="" href="javascript:;">
            <img src="https://brucefeng-1251273438.cos.ap-shanghai.myqcloud.com/logo.png?q-sign-algorithm=sha1&q-ak=AKIDYFjjGyq715cLLr8ItDK35eMxJATk9icr&q-sign-time=1539248390;1539250190&q-key-time=1539248390;1539250190&q-header-list=&q-url-param-list=&q-signature=6cf940473a1fab25ae44c506fa6325d996ffd883&x-cos-security-token=4f20d4519684d02f931ecff3803970f090e08fe410001&response-content-disposition=attachment" alt="" class="logo mt10 ml20">
        </a>
    </div>
    <div class="nav_wrap tmp">
        <ul>
            <li>
                <a href="/home.html"><span>首页</span></a>
            </li>
            <li>
                <a href="/newaccount.html"><span>创建钱包</span></a>
            </li>
            <li>
                <a href="/transaction.html"><span>转账</span></a>
            </li>
            <li>
                <a href="/checktransaction"><span>查询交易</span></a>
            </li>
            <li >
                <a href="https://github.com/DiaboFong/ETHWalletDemo" target="_blank"><span>项目代码</span></a>
            </li>
            <li>
                <a href="http://blog.51cto.com/clovemfong" target="_blank"><span>我的博客</span></a>
            </li>
        </ul>
    </div>
</div>
```

> 将nav.html集成到所有相关网页中即可,如`newaccount.html`

```js
<html>

<head>
    <title>创建钱包</title>
    <script src="js/lib/jquery-3.3.1.min.js"></script>
    <script src="js/lib/jquery.url.js"></script>
    <script src="js/wallet.js"></script>
</head>

<body>
    <div id="nav">
        <script>
            $("#nav").load("html/nav.html")
        </script>
    </div>
    <div id="main">
        <h1>创建一个新的钱包</h1>
        <form method="POST" action="/newaccount">
            <input type="text" placeholder="请输入密码" name="password">
            <button type="submit">创建钱包</button>
        </form>
    </div>
</body>

</html>
```







## 五.解锁钱包账户

### 1. 通过私钥解锁账户



### 2. 通过配置文件解锁账户



## 六.实现交易转账

### 1. 以太币转账

### 2. Token转账



## 七.附录



