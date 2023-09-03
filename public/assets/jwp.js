class RunApp {
  async init() {
    const n = document.getElementById("load-vdo");
    this.slug = n.getAttribute("slug");
    this.status = "";
    this.data = await this.getSource();
    if (this.data) {
      this.player = jwplayer("player");
      this.setupPlayer();
    }
  }
  async getSource() {
    const rawResponse = await fetch(`../source/${this.slug}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      //body: JSON.stringify({ slug: this.slug }),
    });
    const { jwplayer } = await rawResponse.json();

    return jwplayer;
  }

  async setupPlayer() {
    this.player.setup(this.data);
    
    this.player.on("bufferChange", (e) => {
      console.log(e);
    });
    this.player.on("play", () => {
      this.status = "play";
    });

    this.player.on("pause", () => {
      this.status = "pause";
    });

    this.player.on("ready", () => {
      this.status = "ready";
    });

    this.player.on("complete", () => {
      this.status = "complete";
    });

    /*jwplayer_hls_provider.attach();

    if (this.isP2PSupported) {
      p2pml.hlsjs.initJwPlayer(this.player, {
        liveSyncDurationCount: 7,
        loader: this.engine.createLoaderClass(),
      });
    }*/
  }
}

const start = new RunApp();
start.init();
