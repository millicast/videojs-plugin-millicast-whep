import videojs from 'video.js'
import './videojs-millicast-viewer'

// Configure Video.js options
var options = { muted: true };
// Initialize Video.js player
videojs('my-video', options, function onPlayerReady() {
  videojs.log('Your player is ready!');
  this.millicastViewer({ url: "https://director.millicast.com/api/whep/QYrKNJ/lddhd20d" })
});
