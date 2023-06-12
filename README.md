# VideoJS Plugin Millicast WHEP
This project is a demonstration of integrating the popular [video.js](https://videojs.com/) web video player with the standardized [WHEP (WebRTC-HTTP Egress Protocol)](https://datatracker.ietf.org/doc/draft-murillo-whep/) for WebRTC Playback.

## Setup
1. Clone this project and install the dependencies with
    ```bash
    npm i
    ```
2. [Create a Dolby.io account](https://streaming.dolby.io/signup) and create a publish token from the "Live Broadcast" menu.
3. Set the environment variable `VITE_WHEP_URL` to a WHEP URL from the [Dolby.io Real-time streaming dashboard](https://streaming.dolby.io/#/tokens).  Find this in the "API" tab once you have selected your publish token.

## Run the example
1. Ensure you are in the `examples` folder.
2. Start your Dolby.io Real-time streaming broadcast. The simplest way to do this is [via the dashboard](https://docs.dolby.io/streaming-apis/docs/how-to-broadcast-in-dashboard).
3. Start the example with:
    ```bash
    npm run dev
    ```
