import videojs from 'video.js'
import MillicastWhepPlugin from 'videojsplugin'
import 'videojs-resolution-switcher/lib/videojs-resolution-switcher.css'

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop)
})

const whepUrl = params.whepUrl ? params.whepUrl : import.meta.env.VITE_WHEP_URL

videojs.registerPlugin('MillicastWhepPlugin', MillicastWhepPlugin)

// Configure Video.js options
const options = {
  muted: true
}

// Initialize Video.js player
videojs('my-video', options, function onPlayerReady () {
  videojs.log('Your player is ready!')
  this.MillicastWhepPlugin({ url: whepUrl })
})
