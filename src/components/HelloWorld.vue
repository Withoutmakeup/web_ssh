<template>
 <div id="log" style="margin-top:20px;">
      <div class="console" id="terminal"></div>
    </div>
</template>

<script>
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";//使窗口自适应
import { AttachAddon } from "xterm-addon-attach";

export default {
  name: "Xterm",
  props: {
    socketURI: {
      type: String,
      default: ""
    }
  },
  data () {
    return {
      term: null,
      socket: null,
      rows: 40,
      // cols: 10,
      SetOut: false,
      isKey: false
    };
  },
  mounted () {
    this.initSocket();

  },
  beforeDestroy () {
    this.socket.close();
    // this.term.dispose();
  },
  methods: {
    //Xterm主题
    initTerm () {
      const term = new Terminal({
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
      });
      const attachAddon = new AttachAddon(this.socket);
      const fitAddon = new FitAddon();
      term.loadAddon(attachAddon);
      term.loadAddon(fitAddon);
      term.open(document.getElementById("terminal"));
      // fitAddon.fit();
      term.focus();
      let _this = this;
      //限制和后端交互，只有输入回车键才显示结果
      term.prompt = () => {
        term.write("\r\n$ ");
      };
      term.prompt();
      function runFakeTerminal (_this) {
        if (term._initialized) {
          return;
        }
        // 初始化
        term._initialized = true;
        term.writeln();//控制台初始化报错处
        term.prompt();
        // 支持输入与粘贴方法
        term.onData(function (key) {
          let order = {
            Data: key,
            Op: "stdin"
          };
          _this.onSend(order);
        });
        _this.term = term;
      }
      runFakeTerminal(_this);
    },
    //webShell主题
    initSocket () {
      const WebSocketUrl = "ws://10.18.8.199:8181"
      this.socket = new WebSocket(
        WebSocketUrl
      );
      this.socketOnClose(); //关闭
      this.socketOnOpen(); //
      this.socketOnError();
    },
    //webshell链接成功之后操作
    socketOnOpen () {
      this.socket.onopen = () => {
        // 链接成功后
        this.initTerm();
      };
    },
    //webshell关闭之后操作
    socketOnClose () {
      this.socket.onclose = () => {
        console.log("close socket");
      };
    },
    //webshell错误信息
    socketOnError () {
      this.socket.onerror = () => {
        console.log("socket 链接失败");
      };
    },
    //特殊处理
    onSend (data) {
      data = this.base.isObject(data) ? JSON.stringify(data) : data;
      data = this.base.isArray(data) ? data.toString() : data;
      data = data.replace(/\\\\/, "\\");
      this.shellWs.onSend(data);
    },
    //删除左右两端的空格
    trim (str) {
      return str.replace(/(^\s*)|(\s*$)/g, "");
    }
  }
};
</script>

<style lang="scss" scoped>

</style>