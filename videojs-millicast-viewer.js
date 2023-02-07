import videojs from 'video.js'
import { WHEPClient } from 'whip/whep'



const Plugin = videojs.getPlugin('plugin')
const ModalDialog = videojs.getComponent('ModalDialog')


export default class MillicastWhepPlugin extends Plugin {
    constructor(player, options) {
        super(player, options);

        this.modal = new ModalDialog(player, {
            temporary: false,
            label: 'Offline',
            uncloseable: true
        })
        player.addChild(this.modal)

        this.vid = player.tech().el();
        player.play = () => {
            this.vid.play()
        }
        this.pause = () => {
            this.vid.pause()
        }
        console.log(options);

        this.stream = new MediaStream();
        this.vid.srcObject = this.stream;

        // Initialize empty media stream object

        // Create Peer Connection
        this.pc = new RTCPeerConnection();

        // Add audio and video transceivers to the Peer Connection
        this.pc.addTransceiver('video', {
            direction: 'recvonly'
        })
        this.pc.addTransceiver('audio', {
            direction: 'recvonly'
        })

        videojs.log('Before WHEP connection')
        //Start publishing
        this.millicastView(player, options)
    }
    millicastView = async (player, options) => {
        //Create whip client
        var whep = new WHEPClient();
        try {
            await whep.view(this.pc, options.url);
            this.modal.close()
            // Add tracks transceiver receiver tracks to our Media Stream object
            this.pc.getReceivers().forEach((r) => {
                this.stream.addTrack(r.track)
            })
            player.play();
        } catch (error) {
            const modalContent = document.createElement('h1')
            modalContent.innerHTML = error
            this.modal.content(modalContent)
            this.modal.open()
            player.pause()
        }
    }
}

// All that's left is to register the plugin with Video.js:
videojs.registerPlugin('millicastViewer', MillicastWhepPlugin);
