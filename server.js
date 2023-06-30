// const ws = require('nodejs-websocket')
// ws.createServer(function (conn) {
//     conn.on('text', function (data) { // 收到客户端数据的回调方法 
//         conn.sendText(data) // 把客服端发送过来的信息再发回去
//     })
//     conn.on('close', function (e) { // 关闭服务器的回调方法
//         console.log(e, '服务端连接关闭')
//     })
//     conn.on('error', function (e) { // 服务端连接异常的回调方法
//         console.log(e, '服务端异常')
//     })
// }).listen(8181) // 监听8181端口，跟客户端连接端口对应
// console.log('服务端已开启')

/**
 *---------------------------------------------------------------------------------------------------- 
 */

 const WebSocket = require("ws");
 const { spawn } = require('child_process');
 const wss = new WebSocket.Server({ port: 8088 });
 const os = require('os');
const shellPath = os.platform() === 'win32' ? 'cmd.exe' : 'bash';
 wss.on('connection', function connection(ws, req) {
    console.log('客户端已连接');

    // 创建子进程
    const shell = spawn(shellPath, [], { stdio: 'pipe' });
    //  const shell =  spawn('docker', ['-H', config.endpoint, 'exec', '-it', "8244bf358813", '/bin/bash'], {cwd: '/'})
  
    // 向客户端发送终端输出数据
    shell.stdout.on('data', data => ws.send(data.toString('utf-8')));
    shell.stderr.on('data', data => ws.send(data.toString('utf-8')));  

    // 接收客户端输入数据并处理
    ws.on('message', function incoming(message) {
      shell.stdin.write(message + '\n');
      console.log(message)
    });
  
    // 断开连接时销毁子进程
    ws.on('close', () => {
      shell.kill();
    });
  });
  
  console.log('WebSocket服务器已启动');

