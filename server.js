var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2]

if(!port){
  console.log('请指定端口号好不啦？\nnode server.js 8888 这样不会吗？')
  process.exit(1)
}

var server = http.createServer(function(request, response){
var parsedUrl = url.parse(request.url, true)
var pathWithQuery = request.url 
var queryString = ''
if(pathWithQuery.indexOf('?') >= 0){ queryString = pathWithQuery.substring(pathWithQuery.indexOf('?')) }
var path = parsedUrl.pathname
var query = parsedUrl.query
var method = request.method

  /******** 从这里开始看，上面不要看 ************/













console.log('HTTP 路径为\n' + path)
if(path == '/style.css'){
  response.setHeader('Content-Type','text/css; charset=utf-8')
  response.write('body{background-color:gray;}h1{color:red;}')
  response.end()
}else if(path === '/'){
  var string = fs.readFileSync('./index.html','utf8');
  //let cookies = request.headers.cookie.split(';')
  response.setHeader('Content-Type','text/html; charset=utf-8');
  let cookies = request.headers.cookie.split('; ')
  let hash = {}
  for(let i =0;i<cookies.length;i++){
    let parts = cookies[i].split('=')
    let key = parts[0]
    let value = parts[1]
    hash[key]=value
  }
  let email = hash.sign_in_email
  let users = fs.readFileSync('./db/users','utf8')
  users = JSON.parse(users)
  for(let i =0;i<users.length;i++){
    if(users[i].email === email){
      string = string.replace('__password__',users[i].password)
    }else{
      string = string.replace('__password__','不知道')
    }
  }
  console.log(string)
  response.write(string)
  response.end()
}else if(path === '/sign_up' && method ==='GET'){
  var string = fs.readFileSync('./sign_up.html','utf8');
  response.setHeader('Content-Type','text/html; charset=utf-8');
  response.write(string);
  response.end()
}else if(path === '/sign_up' && method === 'POST'){
  readBody(request).then((body)=>{
    let strings = body.split('&') //['email=1002325418@qq.com', 'password=aaa', 'password_confirmation=aaa']
    let hash = {}
    strings.forEach((string)=>{
      let parts = string.split('=') //['email', '1002325418@qq.com']
      let key = parts[0]
      let value = parts[1]
      hash[key] = decodeURIComponent(value)
    })
    let {email, password, password_confirmation} = hash
    if(email.indexOf('@') === -1){
      response.statusCode = 400
      response.setHeader('Content-Type','application/json;charset=utf-8')
      //当邮箱错误的时候给页面一个json格式的响应
      response.write(`{
        "errors": {
          "email": "invalid"
        }
      }`)
    }else if(password !== password_confirmation){
      response.statusCode = 400
      response.write('password is error')
    }else{
      //将文件users里面的内容赋值给users变量
      var users = fs.readFileSync('./db/users','utf8')
      try{
        //这里之所以JSON.parse()方法会报错是因为users变量里的内容读取的是文件users里的，
        //而users文件可能会被用户修改，比如改成var a=1...，而JSON.parse()方法只能将json格式的
        //字符串转成对象，所以对于不确定性这里会报错
        users = JSON.parse(users)
      }catch(exception){
        //将users变量的值替换为一个空的数组
        users = []
      }
      //设置一个中间变量inUse
      let inUse = false;
      //遍历你users这个数组，
      for(let i = 0; i<users.length; i++){
        //如果users里面其中有一项的email等于你传入的email
        if(users[i].email === email){
          //就让inUse=true
          inUse = true;
          //然后退出循环
          break;
        }
      }
      //如果inUse是true响应一个400请求
      if(inUse){
        response.statusCode = 400
        response.write('email is exist')
      }else{
        users.push({email: email, password: password})
        var usersString = JSON.stringify(users)
        //将userString变量里的内容写入文件users里(会将原来users里面的内容替换掉)
        //文件里只能写入字符串所以要将对象转为字符串存入文件
        fs.writeFileSync('./db/users', usersString)
        response.statusCode = 200
      }
    }
    response.end()
  })
}else if(path === '/sign_in' && method === 'GET'){
  var string = fs.readFileSync('./sign_in.html','utf8');
  response.setHeader('Content-Type','text/html; charset=utf-8');
  response.write(string);
  response.end()
}else if(path === '/sign_in' && method === 'POST'){
  readBody(request).then((body)=>{
    let strings = body.split('&') //['email=1002325418@qq.com', 'password=aaa', 'password_confirmation=aaa']
    let hash = {}
    strings.forEach((string)=>{
      let parts = string.split('=') //['email', '1002325418@qq.com']
      let key = parts[0]
      let value = parts[1]
      hash[key] = decodeURIComponent(value)
    })
    let {email, password} = hash
    var users = fs.readFileSync('./db/users','utf8');
    users = JSON.parse(users)
    let found
    for(let i = 0;i<users.length;i++){
      if(users[i].email === email && users[i].password === password){
        found = true
        break
      }
    }
    if(found){
      response.setHeader('Set-Cookie',`sign_in_email=${email}`)
      response.statusCode = 200;
    }else{
      response.statusCode = 401
    }
    response.end()
  })
}else{
  response.statusCode = 404
  response.end()
}

  /******** 代码结束，下面不要看 ************/
})

function readBody(request){
    return new Promise((resolve, reject)=>{
        let body = []
        request.on('data',(chunk)=>{
            body.push(chunk)
        }).on('end',()=>{
            body = Buffer.concat(body).toString();
            resolve(body)
        })
    })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用电饭煲打开 http://localhost:' + port)

 