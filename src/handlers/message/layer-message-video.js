/**
 * The Layer Video MessageHandler renders a single MessagePart Video, or an Atlas 3-message-part Video.
 *
 * As with all Message Handling, Message Height should be fixed at rendering time, and should not change asynchrnously
 * except in response to a user action.  Otherwise scroll positions get mucked and users get lost.
 * As a result, video heights should be fixed before any asynchronously loaded video or preview has loaded.
 *
 * @class layerUI.handlers.message.Video
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import normalizeSize from '../../utils/sizing';
import layerUI, { settings as UISettings } from '../../base';
import MessageHandler from '../../mixins/message-handler';

registerComponent('layer-message-video', {
  mixins: [MessageHandler],
  template: '<video layer-id="video"></video>',
  properties: {

    /**
     * The Message property provides the MessageParts we are going to render.
     *
     * @property {layer.Message} [message=null]
     */
    message: {
      set(value) {

        // Extract our video, preview and metadata message parts
        this.properties.video = value.parts.filter(part => part.mimeType === 'video/mp4')[0];
        this.properties.preview = value.parts.filter(part => part.mimeType === 'image/jpeg+preview')[0];
        const meta = value.parts.filter(part => part.mimeType === 'application/json+imageSize')[0];
        if (meta) this.properties.meta = JSON.parse(meta.body);

        this.properties.sizes = normalizeSize(this.properties.meta, {
          width: UISettings.maxSizes.width,
          height: UISettings.maxSizes.height,
        });

        if (!this.properties.video.url) this.properties.video.fetchStream();
        if (!this.properties.preview.url) this.properties.preview.fetchStream();

        this.properties.preview.on('url-loaded', this._render, this);
        this.properties.video.on('url-loaded', this._render, this);
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
    onRender() {
      this.nodes.video.width = this.properties.sizes.width;
      this.nodes.video.height = this.properties.sizes.height;
      this.nodes.video.src = this.properties.video.url;
      if (this.properties.preview) {
        this.nodes.video.poster = this.properties.preview.url;
      }
      this.nodes.video.controls = true;
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

