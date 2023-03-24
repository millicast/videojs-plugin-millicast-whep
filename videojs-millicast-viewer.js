import videojs from 'video.js'
import { WHEPClient } from 'whip/whep'
import 'videojs-resolution-switcher-webpack'

const Plugin = videojs.getPlugin('plugin')
const ModalDialog = videojs.getComponent('ModalDialog')

// const videojsres = videojs.getComponent('videoJsResolutionSwitcher')

export default class MillicastWhepPlugin extends Plugin {
    constructor(player, options) {
        super(player, options);

        // Work around to avoid using src method instead of srcObject  
        player.src = () => null

        this.url = options.url

        this.modal = new ModalDialog(player, {
            temporary: false,
            label: 'Offline',
            uncloseable: true
        })
        
        this.isLayersLoaded = false
        this.layersAvailable = [] 

        player.addChild(this.modal)

        this.vid = player.tech().el();
        player.play = () => {
            this.vid.play()
        }
        this.pause = () => {
            this.vid.pause()
        }

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

        videojs.log('Before WHEP connection')
        //Start publishing
        this.millicastView(player, options)

        player.videoJsResolutionSwitcher( {
            ui: true,
            customSourcePicker: (p) => { return p },
            dynamicLabel: false
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
            const whepResponse = await this.whep.view(this.pc, options.url);
            this.modal.close()
            // Add tracks transceiver receiver tracks to our Media Stream object
            this.pc.getReceivers().forEach((r) => {
                this.stream.addTrack(r.track)
            })
            player.play();
            // Listen for whep events
            await this.waitForEventSource().then( eventSource => {
                eventSource.addEventListener('layers', (event) => {
                    this.layersAvailable = JSON.parse(event.data).medias[0].layers
                    if (!this.isLayersLoaded) {
                        this.initQualityMenu(event)
                        this.isLayersLoaded = true    
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

    initQualityMenu(event) {
        const data = JSON.parse(event.data)
        const layers = data['medias'][0].layers
        const sources = layers.map(layer => ({
            src: this.url,
            type: 'video/mp4',
            label: layer.encodingId === '2' ? 'High' : layer.encodingId === '1' ? 'Medium' : 'Low',
            res: layer.encodingId,
        }));
        this.player.updateSrc(sources);
    }

    selectLayer = async (encodingId) => {
        const layerSelected = this.layersAvailable.filter(l => l.encodingId === encodingId)
        await this.whep.unselectLayer()
        await this.whep.selectLayer(layerSelected[0]);
    }

    waitForEventSource = async () => {
        return new Promise((resolve) => {
            if ( this.whep.eventSource ) {
                resolve(this.whep.eventSource)
            } else {
                const checkEventSource = setInterval(() => {
                        if ( this.whep.eventSource ) {
                            clearInterval(checkEventSource)
                            resolve(this.whep.eventSource)
                        }   
                }, 100)
            }    
        })
    }
}

// All that's left is to register the plugin with Video.js:
videojs.registerPlugin('millicastViewer', MillicastWhepPlugin);