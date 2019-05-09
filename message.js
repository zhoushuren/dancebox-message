//消息服务

const WebSocket = require('ws')
const redis = require('./redis')
const ws = new WebSocket.Server({ noServer: true })

const ConnectionList = {} //连接的闭包

ws.on('connection', function connection(connection,req, user_info) {

  let user_id = user_info.user_id //这个用户建立连接

  ConnectionList[ 'function_' +user_id] = function(data) {
    connection.send(JSON.stringify(data))
  }

  connection.on('message', function incoming(message) {

  })
  connection.on('close', function(reasonCode, description) {

  })

});

//消息类型
/*
*
* 1 帖子评论
* 2 收到回复
* 3 赞
* */

//给哪个userid发消息
async function setMessage(message, user_id) {
  let obj = {
    type: message.type,
    content: message.content,
    time: Date.now(),
  }
  await redis.lpush('message:' +user_id , JSON.stringify(obj))

  if(ConnectionList[ 'function_' +user_id]) {
    let len = await redis.llen('message:' +user_id)
    console.log(len)
    ConnectionList[ 'function_' +user_id](len)
  }
}

module.exports = {
  ws,
  setMessage
}