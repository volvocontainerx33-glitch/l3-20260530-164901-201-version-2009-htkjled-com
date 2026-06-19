import { H as Hls } from '../vendor/hls-vendor.js';

var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

boxes.forEach(function (box) {
  var video = box.querySelector('video');
  var cover = box.querySelector('[data-start]');
  var stream = box.getAttribute('data-stream');
  var hls = null;

  function attach() {
    if (!video || !stream) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.getAttribute('src')) {
        video.setAttribute('src', stream);
      }
    } else if (Hls.isSupported()) {
      if (!hls) {
        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, function (event, data) {
          if (data.fatal && data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          }
          if (data.fatal && data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      }
    }
  }

  function start() {
    attach();
    if (cover) {
      cover.hidden = true;
    }
    video.play().catch(function () {});
  }

  if (cover) {
    cover.addEventListener('click', start);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
  }
});
