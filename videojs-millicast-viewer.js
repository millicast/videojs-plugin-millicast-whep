import videojs from 'video.js'
import { WHEPClient } from './whep'

// A basic plugin is a plain JavaScript function:
function millicastViewer({ url }) {
    
    this.on('play', function () {
        videojs.log('playback began!');
    });
    
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
    vid.play();
    this.trigger('playing');
}

// All that's left is to register the plugin with Video.js:
videojs.registerPlugin('millicastViewer', millicastViewer);
