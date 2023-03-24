import videojs from 'video.js'
import './videojs-millicast-viewer'
import MillicastWhepPlugin from './videojs-millicast-viewer';
import 'videojs-resolution-switcher-webpack/lib/videojs-resolution-switcher.css'

const url = 'https://director-dev.millicast.com/api/whep/CacWx8/s'

videojs.registerPlugin('MillicastWhepPlugin', MillicastWhepPlugin)

// Configure Video.js options
var options = { 
  muted: true
};

// Initialize Video.js player
let player = videojs('my-video', options, function onPlayerReady() {
  videojs.log('Your player is ready!');
  this.MillicastWhepPlugin({ url })
});

player.fluid(true);