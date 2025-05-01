import videojs from 'video.js'
import MillicastWhepPlugin from '@millicast/videojs-whep-plugin'
import 'videojs-resolution-switcher/lib/videojs-resolution-switcher.css'
import 'videojs-resolution-switcher/lib/videojs-resolution-switcher'

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop)
})

const whepUrl = params.whepUrl ? params.whepUrl : import.meta.env.VITE_WHEP_URL
const whepTokenInput = params.whepToken ? params.whepToken : import.meta.env.VITE_WHEP_TOKEN
const whepToken = whepTokenInput ? whepTokenInput : null;

videojs.registerPlugin('MillicastWhepPlugin', MillicastWhepPlugin)

// Configure Video.js options
const options = {
  muted: true
}

// Initialize Video.js player
videojs('my-video', options, function onPlayerReady () {
  videojs.log('Your player is ready!')
  this.MillicastWhepPlugin({ url: whepUrl, token: whepToken })
})
