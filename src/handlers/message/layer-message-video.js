/**
 * The Layer Image MessageHandler renders a single image, or an Atlas 3-message-part Image.
 *
 * One of the challenges in rendering images is that browser `<img />` tags do not follow EXIF data
 * for orientation, which results in sideways and upside down photos.  This Component uses `blueimp-load-image`
 * to write the image to a Canvas, parse its EXIF data and orient it appropriately.
 *
 * Image heights should be fixed; any change in height of the image will cause our scroll position to be shifted
 * (i.e. the numeric value of `scrollTop` will remain unchanged, but what is visible to the user at that position may change)
 *
 * @class layerUI.handlers.message.Video
 * @extends layerUI.components.Component
 */
import LUIComponent from '../../components/component';
import normalizeSize from '../../utils/sizing';
import layerUI, { settings as UISettings } from '../../base';

LUIComponent('layer-message-video', {
  properties: {

    /**
     * The Message property provides the MessageParts we are going to render.
     *
     * @property {layer.Message}
     */
    message: {
      set(value) {

        // Extract our video, preview and metadata message parts
        this.properties.video = value.parts.filter(part => part.mimeType === 'video/mp4')[0];
        this.properties.preview = value.parts.filter(part => part.mimeType === 'image/jpeg+preview')[0];
        const meta = value.parts.filter(part => part.mimeType === 'application/json+imageSize')[0];
        if (meta) this.properties.meta = JSON.parse(meta.body);

        // TODO: Investigate better defaults or better way to get defaults
        this.properties.sizes = normalizeSize(this.properties.meta, {
          width: UISettings.maxSizes.width,
          height: UISettings.maxSizes.height,
        });

        if (!this.properties.video.url) this.properties.video.fetchStream();
        if (!this.properties.preview.url) this.properties.preview.fetchStream();

        this.properties.preview.on('url-loaded', this.render, this);
        this.properties.video.on('url-loaded', this.render, this);

        // Render the Message
        this.render();
      },
    },

    parentContainer: {},
  },
  methods: {


    /**
     * Render the Message.
     *
     * Primarily, this method determines whether to call renderCanvas on the preview or the image.
     *
     * @method
     * @private
     */
    render() {
      const videoPlayer = document.createElement('video');
      videoPlayer.width = this.properties.sizes.width;
      videoPlayer.height = this.properties.sizes.height;
      videoPlayer.src = this.properties.video.url;
      if (this.properties.preview) {
        videoPlayer.poster = this.properties.preview.url;
      }
      videoPlayer.controls = true;
      while (this.firstChild) this.removeChild(this.firstChild);
      this.appendChild(videoPlayer);
    },
  },
});

/*
  * Handle any Message that contains a Video + Preview + Metadata or is just an Video
  */
layerUI.registerMessageHandler({
  tagName: 'layer-message-video',
  label: '<i class="fa fa-file-video-o" aria-hidden="true"></i> Video message',
  handlesMessage(message, container) {
    const videoParts = message.parts.filter(part => part.mimeType === 'video/mp4').length;
    const previewParts = message.parts.filter(part => part.mimeType === 'image/jpeg+preview').length;
    const metaParts = message.parts.filter(part => part.mimeType === 'application/json+imageSize').length;
    return (message.parts.length === 1 && videoParts ||
      message.parts.length === 3 && videoParts === 1 && previewParts === 1 && metaParts === 1);
  },
});

