import videojs from 'video.js'
import { WHEPClient } from 'whip/whep'
import 'videojs-resolution-switcher'

const Plugin = videojs.getPlugin('plugin')
const ModalDialog = videojs.getComponent('ModalDialog')

const bitsUnitsStorage = ['bps', 'kbps', 'mbps', 'gbps']
const LABELS_BY_NUM_LAYERS = {
    2: ['High', 'Low'],
    3: ['High', 'Medium', 'Low'],
    4: (activeLayers) => activeLayers.map((layer) => {
            return formatBitsRecursive(layer.bitrate)
        })
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

        if (!this.url) {
            const modalContent = document.createElement('h2')
            modalContent.innerHTML = 'No Whep URL provided, use whepUrl query param'
            this.modal.content(modalContent)
            this.modal.open()

            return
        }
        
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
            default: 'auto',
            customSourcePicker: (p) => { return p },
            dynamicLabel: true
        });

        this.auto = {
            src: this.url,
            type: 'video/mp4',
            label: 'Auto',
            res: 'auto'
        }
    
        player.on('resolutionchange', () => {
            const encodingId = player.currentResolution().sources[0].res
            this.selectLayer(encodingId)
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

            await this.whep.view(this.pc, options.url);
            this.modal.close()

            // Add tracks transceiver receiver tracks to our Media Stream object
            this.pc.getReceivers().forEach((r) => {
                this.stream.addTrack(r.track)
            })

            player.play();
            
            // Listen for whep events
            await this.waitForEventSource().then( eventSource => {
                eventSource.addEventListener('layers', (event) => {
                    const layerEvent = JSON.parse(event.data).medias[0]
                    const currentActiveLayers = layerEvent.active
                    this.layers = layerEvent.layers
                    this.updateQualityMenu(currentActiveLayers)
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
        const qualityMenu = document.querySelector('[aria-label="Quality"] button');
        const length = activeLayers.length
  
        if (length <= 1) {
            qualityMenu.disabled = true;
            qualityMenu.style.opacity = 0.5;
            qualityMenu.title = 'Quality disabled';
          } else {
            qualityMenu.disabled = false;
            qualityMenu.style.opacity = 1;
            qualityMenu.title = 'Quality';
           
            let labels = length > 3 ? LABELS_BY_NUM_LAYERS[4](activeLayers) : LABELS_BY_NUM_LAYERS[length]
            const sources = [
                this.auto,
                ...activeLayers.map(({ id }, index) => ({            
                    src: this.url,
                    type: 'video/mp4',
                    label: labels[index],
                    res: id
                })),
            ]
            this.player.updateSrc(sources); 
        }
    }

    selectLayer = async (encodingId) => {
        // await this.whep.unselectLayer()
        const layerSelected = encodingId === 'auto' ? {} : this.layers.filter(l => l.encodingId === encodingId)[0]
        await this.whep.selectLayer(layerSelected);
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

const formatBitsRecursive = (value, unitsStoragePosition = 0) => {
    const newValue = value / 1000
    if ((newValue < 1) || (newValue > 1 && (unitsStoragePosition + 1) > bitsUnitsStorage.length)) {
      return `${Math.round(value * 100) / 100} ${bitsUnitsStorage[unitsStoragePosition]}`
    } else if (newValue > 1) {
      return formatBitsRecursive(newValue, unitsStoragePosition + 1)
    }
}
// All that's left is to register the plugin with Video.js:
videojs.registerPlugin('millicastViewer', MillicastWhepPlugin);