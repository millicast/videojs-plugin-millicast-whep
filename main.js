import videojs from 'video.js'
import './videojs-millicast-viewer'
import MillicastWhepPlugin from './videojs-millicast-viewer';
import 'videojs-resolution-switcher/lib/videojs-resolution-switcher.css'


const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

let whepUrl = params.whepUrl ? params.whepUrl : import.meta.env.VITE_WHEP_URL;

videojs.registerPlugin('MillicastWhepPlugin', MillicastWhepPlugin)

// Configure Video.js options
var options = { 
  muted: true
};

// Initialize Video.js player
let player = videojs('my-video', options, function onPlayerReady() {
  videojs.log('Your player is ready!');
  this.MillicastWhepPlugin({ url: whepUrl })
});