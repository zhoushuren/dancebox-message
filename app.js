
const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const url = require('url')
const {ws,setMessage} = require('./message')
const redis = require('./redis')
const app = new Koa()

app.use(async(ctx,next)=>{

  try{
    await next()
  }catch (e){
    console.error(e)
    ctx.body = {
      success: false,
      error: '服务器错误'
    }
  }
})

app.use(bodyParser())

app.use(async (ctx,next) => {
  if(ctx.path.indexOf('/message') >=0) {
    //这个服务是向外暴露的，搞个简单的密码即可
    if(!ctx.request.body.user_id) {
      return
    }
    if(ctx.query.password = 'dancebox') {
      await setMessage(ctx.request.body, ctx.request.body.user_id)
      ctx.body = {
        success: true
      }
    }
  }else {
    await next()
  }
})

const port = process.env.PORT || 3001
const host = process.env.HOST || '0.0.0.0'
const server = app.listen(port,host)


server.on('upgrade', async function upgrade(request, socket, head) {
  const pathname = url.parse(request.url).pathname;
  if (pathname === '/ws') {
    console.log(request.headers)

    if(!request.headers['sessiontoken']) {
      socket.destroy();
    }

    let user_info = redis.hgetall('session:' + request.headers['sessiontoken'])

    if(!user_info) {
      socket.destroy();
    }

    ws.handleUpgrade(request, socket, head, function done(connection) {
      ws.emit('connection', connection, request, user_info);
    })
  } else {
    socket.destroy();
  }
})
