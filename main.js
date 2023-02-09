import videojs from 'video.js'
import './videojs-millicast-viewer'
import MillicastWhepPlugin from './videojs-millicast-viewer';

videojs.registerPlugin('MillicastWhepPlugin', MillicastWhepPlugin)

// Configure Video.js options
var options = { muted: true };

// Initialize Video.js player
videojs('my-video', options, function onPlayerReady() {
  videojs.log('Your player is ready!');
  this.MillicastWhepPlugin({ url: "https://director.millicast.com/api/whep/QYrKNJ/ldunu74i" })
});
