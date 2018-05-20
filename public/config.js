//config host , port

var connectApp =
  {

    protocol: "",
    host: "",
    port: "",
    urlCas: '',
    urlCasTarget: '',
    hostWebsocket: '',
    API_MOIP_CHAVE_PUBLICA: '',
    CLIENT_SECRET_VR: '',
    CLIENT_ID_VR: '',
    urlNodeServer: "http:/10.238.34.59:8080/get-session",

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
