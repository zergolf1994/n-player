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
    let slug = this.slug,
      player = this.player.setup(this.data);
    //เปิดเล่นต่อจากเดิม
    player.once("ready", (e) => {
      let resumeAt = localStorage.getItem(`time_${slug}`) || 0;
      if (!resumeAt) return null;
      const modalHTML = `
      <div class="popup">
        <div class="body">
          <span class="h1"> เล่นต่อจากเดิม </span>
          <span class="h2"> คุณต้องการเล่นต่อจากเดิมไหม ? </span>
          <span class="h2"> ${this.SecondsConvert(resumeAt)} </span>

        </div>
        <div class="footer">
          <button class="continue_submit">เล่นต่อจากเดิม</button>
          <button class="continue_cancel">ไม่, ขอบคุณ</button>
        </div>
      </div>
    `;
      document
        .querySelector("body")
        .insertAdjacentHTML("afterbegin", modalHTML);

      // เพิ่มการฟังเหตุการณ์คลิก
      document
        .querySelector(".continue_submit")
        .addEventListener("click", function () {
          // การดำเนินการเมื่อคลิกที่ปุ่ม "Continue"
          player.seek(resumeAt).play();
          document.querySelector(".popup").remove();
        });

      document
        .querySelector(".continue_cancel")
        .addEventListener("click", function () {
          // การดำเนินการเมื่อคลิกที่ปุ่ม "Cancel"
          player.play();
          document.querySelector(".popup").remove();
        });
    });

    player.once("play", (e) => {
      const popupElement = document.querySelector(".popup");
      if (popupElement) {
        popupElement.remove();
      }
    });
    player.once("displayClick", (e) => {
      const popupElement = document.querySelector(".popup");
      if (popupElement) {
        popupElement.remove();
      }
    });
    //บันทึกเวลา
    player.on("time", function (e) {
      if (!slug) return null;
      localStorage?.setItem(`time_${slug}`, e.position);
    });

    /*this.player.on("bufferChange", (e) => {
      //console.log(e);
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
    });*/
    let levelQ,
      clientSide = {
        qualitySwitch: function (b) {
          let item = levelQ[b];
          if (this.svgLabel(item?.label) == undefined) {
            player.removeButton("qSwitch");
          } else {
            player.addButton(
              this.svgLabel(item?.label),
              item?.label,
              function () {
                /*document.querySelector('.jw-controls').classList.add("jw-settings-open");
            document.querySelector('.jw-settings-menu').setAttribute('aria-expanded', false);
            document.querySelector('.jw-settings-submenu:last-child').classList.add("jw-settings-submenu-active");
            document.querySelector('.jw-settings-submenu:last-child').setAttribute('aria-expanded', true);
            document.querySelector('.jw-settings-quality').setAttribute('aria-checked', true)*/
              },
              "qSwitch"
            );
          }
        },
        removeBtn: function () {
          player.removeButton("share");
        },
        forwardBtn: function () {
          // display icon
          let iconForward = `<svg xmlns="http://www.w3.org/2000/svg" class="jw-svg-icon jw-svg-icon-rewind" viewBox="0 0 240 240" focusable="false"> <path d="M185,135.6c-3.7-6.3-10.4-10.3-17.7-10.6c-7.3,0.3-14,4.3-17.7,10.6c-8.6,14.2-8.6,32.1,0,46.3c3.7,6.3,10.4,10.3,17.7,10.6 c7.3-0.3,14-4.3,17.7-10.6C193.6,167.6,193.6,149.8,185,135.6z M167.3,182.8c-7.8,0-14.4-11-14.4-24.1s6.6-24.1,14.4-24.1 s14.4,11,14.4,24.1S175.2,182.8,167.3,182.8z M123.9,192.5v-51l-4.8,4.8l-6.8-6.8l13-13c1.9-1.9,4.9-1.9,6.8,0 c0.9,0.9,1.4,2.1,1.4,3.4v62.7L123.9,192.5z M22.7,57.4h130.1V38.1c0-5.3,3.6-7.2,8-4.3l41.8,27.9c1.2,0.6,2.1,1.5,2.7,2.7 c1.4,3,0.2,6.5-2.7,8l-41.8,27.9c-4.4,2.9-8,1-8-4.3V76.7H37.1v96.4h48.2v19.3H22.6c-2.6,0-4.8-2.2-4.8-4.8V62.3 C17.8,59.6,20,57.4,22.7,57.4z"> </path> </svg>`;
          const rewindContainer = document.querySelector(
            ".jw-display-icon-rewind"
          );
          const forwardContainer = rewindContainer.cloneNode(true);
          const forwardDisplayButton =
            forwardContainer.querySelector(".jw-icon-rewind");
          forwardDisplayButton.style.transform = "scaleX(-1)";
          forwardDisplayButton.ariaLabel = "Forward 10 Seconds";
          const nextContainer = document.querySelector(".jw-display-icon-next");
          nextContainer.parentNode.insertBefore(
            forwardContainer,
            nextContainer
          );

          // control bar icon
          document.querySelector(".jw-display-icon-next").style.display =
            "none"; // hide next button
          const buttonContainer = document.querySelector(
            ".jw-button-container"
          );
          const rewindControlBarButton =
            buttonContainer.querySelector(".jw-icon-rewind");
          const forwardControlBarButton =
            rewindControlBarButton.cloneNode(true);
          forwardControlBarButton.style.transform = "scaleX(-1)";
          forwardControlBarButton.ariaLabel = "Forward 10 Seconds";
          rewindControlBarButton.parentNode.insertBefore(
            forwardControlBarButton,
            rewindControlBarButton.nextElementSibling
          );
          // add onclick handlers
          [forwardDisplayButton, forwardControlBarButton].forEach((button) => {
            button.onclick = () => {
              player.seek(player.getPosition() + 10);
            };
          });
        },
        svgLabel: function (a) {
          let data = {
            "360p": `<svg class="jw-svg-icon jw-svg-icon-qswitch" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 24"><path d="M7 15v-1.5A1.5 1.5 0 0 0 5.5 12 1.5 1.5 0 0 0 7 10.5V9a2 2 0 0 0-2-2H1v2h4v2H3v2h2v2H1v2h4a2 2 0 0 0 2-2M10 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2V9h4V7h-4m0 6h2v2h-2v-2zM17 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m0 2h2v6h-2V9zM28 7v10h2v-4h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4m2 2h2v2h-2V9m-6-6h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>`,
            "480p": `<svg class="jw-svg-icon jw-svg-icon-qswitch" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 24"><path d="M1 7v6h4v4h2V7H5v4H3V7H1zM10 13h2v2h-2m0-6h2v2h-2m0 6h2a2 2 0 0 0 2-2v-1.5a1.5 1.5 0 0 0-1.5-1.5 1.5 1.5 0 0 0 1.5-1.5V9a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1.5A1.5 1.5 0 0 0 9.5 12 1.5 1.5 0 0 0 8 13.5V15a2 2 0 0 0 2 2M17 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m0 2h2v6h-2V9zM28 7v10h2v-4h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4m2 2h2v2h-2V9m-6-6h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>`,
            "720p": `<svg class="jw-svg-icon jw-svg-icon-qswitch" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 24"><path d="M3 17l4-8V7H1v2h4l-4 8M8 7v2h4v2h-2a2 2 0 0 0-2 2v4h6v-2h-4v-2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H8zM17 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m0 2h2v6h-2V9zM28 7v10h2v-4h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4m2 2h2v2h-2V9m-6-6h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H24a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>`,
            "1080p": `<svg class="jw-svg-icon jw-svg-icon-qswitch" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 24"><path d="M2 7v2h2v8h2V7H2zM10 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m0 2h2v6h-2V9zM17 13h2v2h-2m0-6h2v2h-2m0 6h2a2 2 0 0 0 2-2v-1.5a1.5 1.5 0 0 0-1.5-1.5 1.5 1.5 0 0 0 1.5-1.5V9a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1.5a1.5 1.5 0 0 0 1.5 1.5 1.5 1.5 0 0 0-1.5 1.5V15a2 2 0 0 0 2 2M24 7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m0 2h2v6h-2V9zM36 7v10h2v-4h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4m2 2h2v2h-2V9m-6-6h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H32a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/></svg>`,
          };
          return data[a];
        },

        addLogo: function (a, b) {
          player.addButton(
            "favicon.ico",
            "zembed",
            function () {
              try {
                var tab = window.open("https://zembed.xyz/", "_blank");
                if (tab) {
                  tab.focus();
                } else {
                  window.location.href = "https://zembed.xyz/";
                }
              } catch (e) {
                window.location.href = "https://zembed.xyz/";
              }
            },
            "logo"
          );
        },
      };

    player.on("ready", function (evt) {
      clientSide.addLogo();
      clientSide.removeBtn();
      clientSide.forwardBtn();
    });

    player.on("levels", function (e) {
      levelQ = e?.levels;
    });
    player.on("levelsChanged", function (e) {
      clientSide.qualitySwitch(e.currentQuality);
    });
    player.on("visualQuality", function (e) {
      clientSide.qualitySwitch(e.level.index);
    });
  }

  SecondsConvert(sec) {
    let totalSeconds = Math.floor(sec);
    let hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;

    minutes = String(minutes).padStart(2, "0");
    hours = String(hours).padStart(2, "0");
    seconds = String(seconds).padStart(2, "0");

    return hours + ":" + minutes + ":" + seconds;
  }
}

const start = new RunApp();
start.init();
