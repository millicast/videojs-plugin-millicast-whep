import videojs from 'video.js'
import { WHEPClient } from 'whip/whep'

// A basic plugin is a plain JavaScript function:
function millicastViewer({ url }) {

    const playbackStartedLog = () => {
        videojs.log('playback began!');
        this.off('play', playbackStartedLog);
    }

    this.on('play', playbackStartedLog);

    // Initialize empty media stream object
    const stream = new MediaStream();

    // Create Peer Connection
    const pc = new RTCPeerConnection();

    // Add audio and video transceivers to the Peer Connection
    pc.addTransceiver('video', {
        direction: 'recvonly'
    })
    pc.addTransceiver('audio', {
        direction: 'recvonly'
    })

    //Create whip client
    const whip = new WHEPClient();

    videojs.log('Before WHEP connection')
    //Start publishing
    whip.view(pc, url);

    // Add tracks transceiver receiver tracks to our Media Stream object
    pc.getReceivers().forEach((r) => {
        stream.addTrack(r.track)
    })

    var vid = this.tech().el();
    vid.srcObject = stream;
    this.play = () => {
        vid.play()
      }
    this.pause = () => {
        vid.pause()
    }
    vid.play();

}

// All that's left is to register the plugin with Video.js:
videojs.registerPlugin('millicastViewer', millicastViewer);
