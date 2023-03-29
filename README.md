# VideoJS Plugin Millicast WHEP
This project is a demonstration of integrating the popular [video.js](https://videojs.com/) web video player with the standardized [WHEP (WebRTC-HTTP Egress Protocol)](https://www.ietf.org/id/draft-murillo-whep-01.html) for WebRTC Playback.
## Setup
1. Clone this project and install the dependencies with
    ```bash
    npm i
    ```
1. Create a Dolby.io account and create a publish token from the "Live Broadcast" section.
1. edit `main.js` and replace the millicastViewer `url` with a WHEP URL from the [dolby.io Real-time streaming dashboard](https://streaming.dolby.io/#/tokens).  Find this in the "API" tab once you have selected your publish token.
## Run the example
1. start your stream to Dolby.io Real-time streaming
1. start the example
    ```bash
    npm run dev
    ```
