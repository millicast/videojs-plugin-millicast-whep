# VideoJS Plugin Millicast WHEP
This project is a demonstration of integrating the popular [video.js](https://videojs.com/) web video player with the standardized [WHEP (WebRTC-HTTP Egress Protocol)](https://www.ietf.org/id/draft-murillo-whep-01.html) for WebRTC Playback.
## Setup
1. Clone this project and install the dependencies with
    ```bash
    yarn
    ```
1. Create a Dolby.io account and create a publish token from the "Live Broadcast" section.
1. edit `main.js` and replace the millicastViewer `url` with a WHEP URL from the [dolby.io Real-time streaming dashboard](https://streaming.dolby.io/#/tokens).  Find this in the "API" tab once you have selected your publish token.
## Run the example
1. start your stream to Dolby.io Real-time streaming
1. start the example
    ```bash
    yarn dev
    ```
### Known Issues:
Video.js does not seem to have a proper handling of MediaStream's as media input. As it needs to be set using the video.srcObject. This cuses the play/stop buttons to missbehave on the Video.JS player.
Some useful links regarding this issue in case you want to investigate:
* https://github.com/videojs/video.js/issues/7159
* https://codepen.io/exlord-the-styleful/pen/oNWjBjR?editors=1000
* https://github.com/videojs/video.js/issues/7304#issuecomment-876220163
* https://gist.github.com/Exlord/c0029012278674865eb026d2e5b60f32
