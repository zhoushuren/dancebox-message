//消息服务

const WebSocket = require('ws')
const redis = require('./redis')
const ws = new WebSocket.Server({ noServer: true })

const ConnectionList = {} //连接的闭包

ws.on('connection',async function connection(connection,req, user_info) {

  let user_id = user_info.user_id //这个用户建立连接
  ConnectionList[ 'function_' +user_id] = function(data) {
    connection.send(JSON.stringify(data))
  }

  let len = await redis.llen('message:' +user_id)
  if (len>0) {
      connection.send(JSON.stringify(len))
  }
  connection.on('message', function incoming(message) {

  })
  connection.on('close', function(reasonCode, description) {
    // delete  ConnectionList[ 'function_' +user_id]
    console.log('-----连接断开')
    console.log(reasonCode)
    console.log(description)
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
  // console.log(user_id)
  if(ConnectionList[ 'function_' +user_id]) {
    let len = await redis.llen('message:' +user_id)
    // console.log(len)
    ConnectionList[ 'function_' +user_id](len)
  }else{
    console.log('没有这个函数')
  }
}

module.exports = {
  ws,
  setMessage
}