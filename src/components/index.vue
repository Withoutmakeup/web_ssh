<template>
    <div class="container">
        <h1>SSH Client</h1>
        <p style="font-size: 14px;line-height: 1;color: #909393;margin: 0 0 20px;">
            {{ this.containerName }}
        </p>
        <div ref="xtermContainer" class="xtermContainer"></div>
    </div>
</template>

<script>
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";//使窗口自适应
import { AttachAddon } from "xterm-addon-attach";
export default {
    name: 'NodejsWebsocketVueIndex',

    data() {
        return {
            containerName:"",
            xterm:null,
            rows:50,
            input:""
        };
    },

    mounted() {
       this.initWebsocket()
       this.initXterm();//初始化窗口
    },
    beforeDestroy(){
        //组件注销时销毁xterm对象
        if(this.xterm){
            this.xterm = null
        }
    },

    methods: {
        initXterm(){
            this.xterm = new Terminal({
            rendererType: "canvas", //渲染类型
            rows: this.rows, //行数
            // cols: this.cols,// 设置之后会输入多行之后覆盖现象
            convertEol: true, //启用时，光标将设置为下一行的开头
            // scrollback: 10,//终端中的回滚量
            fontSize: 14, //字体大小
            disableStdin: false, //是否应禁用输入。
            cursorStyle: "block", //光标样式
            // cursorBlink: true, //光标闪烁
            scrollback: 30,
            tabStopWidth: 4,
            theme: {
            foreground: "white", //字体
            background: "#060101", //背景色
            cursor: "help" //设置光标
            }
        })
            const fitAddon = new FitAddon();
            this.xterm.loadAddon(fitAddon);
            this.xterm.open(this.$refs.xtermContainer)//将实例化容器挂载到dom元素上
            this.xterm.focus()
            
        },
        initWebsocket(){
            const ws = new WebSocket('ws://10.18.8.199:8088/');
            ws.addEventListener('open', () => {
                console.log('WebSocket连接已经打开');
                // const input = 'dir';
                // ws.send(input);

                this.xterm.onData(e => {
                    // 在终端输入字符时触发
                    this.input+=e
                    this.xterm.write(e);
                });

                this.xterm.onKey(e => {
                    // 在终端输入特殊按键时触发
                    if(e.domEvent.code == "Enter"){
                       ws.send(this.input)
                    }
                });
            });

            ws.addEventListener('message', event => {
                console.log("客户端端接收到了消息");
                this.input = ""
                console.log(event.data)
                this.write(event.data)//接收到服务端的返回 映射到窗口上
            });

            ws.addEventListener('error', error => {
                console.log('WebSocket发生错误', error);
            });

            ws.addEventListener('close', event => {
                console.log('WebSocket连接已经关闭', event);
            });
        },
         // 向终端窗口中输出文本
        write(text) {
            this.xterm.write(text);
        },
    },
};
</script>

<style scoped>
.container{
    display: flex;
    flex-direction: column;
    height: 100%;
}
.xtermContainer{
    flex: 1;
}

</style>