//config host , port

var connectApp =
  {

    protocol: "",
    host: "",
    port: "",

    toUrl: function () {
      if (this.protocol)
        return this.protocol + "://" + this.host + ':' + this.port;
      else
        return "http://" + this.host + ':' + this.port;
    },

    toUrlWebsocket: function () {
      return (this.protocol == 'https' ? 'wss://' : "wss://") + this.hostWebsocket;
    }
  };
