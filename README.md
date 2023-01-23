# VideoJS Plugin Millicast WHEP

In order to test this example, run:

```bash
yarn
yarn dev
```

## Known Issues:

Video.js does not seem to have a proper handling of MediaStream's as media input. As it needs to be set using the video.srcObject. This cuses the play/stop buttons to missbehave on the Video.JS player.

Some useful links regarding this issue in case you want to investigate:
* https://github.com/videojs/video.js/issues/7159
* https://codepen.io/exlord-the-styleful/pen/oNWjBjR?editors=1000
* https://github.com/videojs/video.js/issues/7304#issuecomment-876220163
* https://gist.github.com/Exlord/c0029012278674865eb026d2e5b60f32
