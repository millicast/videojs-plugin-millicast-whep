import videojs from 'video.js'
import { WHEPClient } from 'whip/whep'
import 'videojs-resolution-switcher'

const Plugin = videojs.getPlugin('plugin')
const ModalDialog = videojs.getComponent('ModalDialog')

const LABELS_BY_NUM_LAYERS = {
    2: ['High', 'Low'],
    3: ['High', 'Medium', 'Low']
};

export default class MillicastWhepPlugin extends Plugin {
    constructor(player, options) {
        super(player, options);

        // Work around to avoid using src method instead of srcObject  
        player.src = () => {}

        this.url = options.url

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

        videojs.log('Before WHEP connection')
        //Start publishing
        this.millicastView(player, options)

        player.videoJsResolutionSwitcher( {
            ui: true,
            default: 'high',
            customSourcePicker: (p) => { return p },
            dynamicLabel: true,
        });

        player.on('resolutionchange', () => {
            const encodingId = player.currentResolution().sources[0].res;
            this.selectLayer(encodingId);
        });
    }

    millicastView = async (player, options) => {
        //Create whip client
        this.whep = new WHEPClient();
        try {
            this.stream = new MediaStream();
            this.vid.srcObject = this.stream;
    
            // Create Peer Connection
            this.pc = new RTCPeerConnection();
    
            // Add audio and video transceivers to the Peer Connection
            this.pc.addTransceiver('video', {
                direction: 'recvonly'
            })
            this.pc.addTransceiver('audio', {
                direction: 'recvonly'
            })

            const whepResponse = await this.whep.view(this.pc, options.url);
            this.modal.close()

            // Add tracks transceiver receiver tracks to our Media Stream object
            this.pc.getReceivers().forEach((r) => {
                this.stream.addTrack(r.track)
            })

            player.play();
            
            let previousActiveLayers = []
            // Listen for whep events
            await this.waitForEventSource().then( eventSource => {
                eventSource.addEventListener('layers', (event) => {
                    const layerEvent = JSON.parse(event.data).medias[0]
                    const currentActiveLayers = layerEvent.active
                    if (previousActiveLayers.length !== currentActiveLayers.length) {
                        this.layers = layerEvent.layers
                        this.updateQualityMenu(currentActiveLayers)
                        previousActiveLayers = currentActiveLayers
                    }
                })
            })
        }
         catch (error) {
            const modalContent = document.createElement('h2')
            modalContent.innerHTML = error
            this.modal.content(modalContent)
            this.modal.open()
            
            player.pause()

            // Add retries every 2 seconds if connection fails
            setTimeout(() => {
                this.millicastView(player, options)
            }, 2000);
        }
    }

    updateQualityMenu(activeLayers) {
        const labels = LABELS_BY_NUM_LAYERS[activeLayers.length] || [];
        const sources = activeLayers.map((layer, index) => {
            return {
                src: this.url,
                type: 'video/mp4',
                label: labels[index],
                res: layer.id
            };
        });

        const qualityMenu = document.querySelector('[aria-label="Quality"] button');
        if (activeLayers.length > 1){ 
            this.player.updateSrc(sources); 
            qualityMenu.disabled = false 
            qualityMenu.style.opacity = 1
            qualityMenu.title = 'Quality'
        }
        else {
            qualityMenu.disabled = true
            qualityMenu.style.opacity = 0.5
            qualityMenu.title = 'Quality disabled'
        }
    }

    selectLayer = async (encodingId) => {
        const layerSelected = this.layers.filter(l => l.encodingId === encodingId)
        await this.whep.unselectLayer()
        await this.whep.selectLayer(layerSelected[0]);
    }

    waitForEventSource = async () => {
        return new Promise((resolve) => {
            if (this.whep.eventSource) {
                resolve(this.whep.eventSource)
            } else {
            setTimeout(() => {
                resolve(this.waitForEventSource())
            }, 1000)
            }
        })
    }
}

// All that's left is to register the plugin with Video.js:
videojs.registerPlugin('millicastViewer', MillicastWhepPlugin);