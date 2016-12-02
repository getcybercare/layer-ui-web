/**
 * The Layer Image MessageHandler renders a single MessagePart image, or an Atlas 3-message-part Image.
 *
 * One of the challenges in rendering images is that browser `<img />` tags do not follow EXIF data
 * for orientation, which results in sideways and upside down photos.  Furthermore, CSS rotation of the dom,
 * results in offsets and margins that vary based on the exact dimensions of the image, resulting
 * in some very ugly code to get anything remotely consistent.  This Component uses `blueimp-load-image`
 * to write the image to a Canvas, parse its EXIF data and orient it appropriately.
 *
 * As with all Message Handling, Message Height should be fixed at rendering time, and should not change asynchrnously
 * except in response to a user action.  Otherwise scroll positions get mucked and users get lost.
 * As a result, image heights should be fixed before any asynchronously loaded image has loaded.
 *
 * @class layerUI.handlers.message.Image
 * @extends layerUI.components.Component
 */
import ImageManager from 'blueimp-load-image/js/load-image';
import 'blueimp-load-image/js/load-image-orientation';
import 'blueimp-load-image/js/load-image-meta';
import 'blueimp-load-image/js/load-image-exif';

import layerUI, { settings as UISettings } from '../../../base';
import LUIComponent from '../../../components/component';
import normalizeSize from '../../../utils/sizing';

LUIComponent('layer-message-image', {
  properties: {

    /**
     * The Message property provides the MessageParts we are going to render.
     *
     * @property {layer.Message} [message=null]
     */
    message: {
      set(value) {

        // Extract our image, preview and metadata message parts
        this.properties.image = value.parts.filter(part => ['image/png', 'image/gif', 'image/jpeg'].indexOf(part.mimeType) !== -1)[0];
        this.properties.preview = value.parts.filter(part => part.mimeType === 'image/jpeg+preview')[0];
        const meta = value.parts.filter(part => part.mimeType === 'application/json+imageSize')[0];
        if (meta) this.properties.meta = JSON.parse(meta.body);

        // If there is a preview and it doesn't have a body, fetch the preview body so we can pass it into the ImageManager.
        if (this.properties.preview && this.properties.image) {
          if (!this.properties.preview.body) {
            this.properties.preview.fetchContent();
            this.properties.preview.on('content-loaded', this._render, this);
          }
          // TODO: remove body test once all websdk changes are merged and url is gaurenteed to have a value if body has a value
          // If image does not have a url, call fetchStream to get an updated url
          if (!this.properties.image.url && !this.properties.image.body) this.properties.image.fetchStream();
        }

        // If there is no preview, only an image, we're going to pass it into the ImageManager so fetch its body
        else if (!this.properties.image.body) {
          this.properties.image.fetchContent();
          this.properties.image.on('content-loaded', this._render, this);
        }

        // Render the Message
        this._render();
      },
    },

    parentContainer: {},

  },
  methods: {

    /**
     * Constructor.
     *
     * @method _created
     * @private
     */
    _created() {
      this.addEventListener('click', this._handleClick.bind(this));
    },

    /**
     * If the user clicks the image, and we have a full image part with a url, open it.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    _handleClick(evt) {
      // Don't open images clicked within the Conversations List
      if (this.parentNode.tagName !== 'LAYER-CONVERSATION-LAST-MESSAGE') {
        evt.preventDefault();
        if (this.properties.image && this.properties.image.url) window.open(this.properties.image.url);
      }
    },

    /**
     * Render the Message.
     *
     * Primarily, this method determines whether to call _renderCanvas on the preview or the image.
     *
     * @method
     * @private
     */
    _render() {
      let maxSizes = UISettings.maxSizes;
      // TODO: Need to be able to customize this height, as well as the conditions (parentContainers) under which different sizes are applied.
      if (this.parentContainer.tagName === 'LAYER-NOTIFIER') maxSizes = { height: 140, width: maxSizes.width };
      this.properties.sizes = normalizeSize(this.properties.meta, { width: maxSizes.width, height: maxSizes.height });
      this.style.height = (UISettings.verticalMessagePadding + this.properties.sizes.height) + 'px';
      if (this.properties.preview && this.properties.preview.body) {
        this._renderCanvas(this.properties.preview.body);
      } else if (this.properties.image && this.properties.image.body) {
        this._renderCanvas(this.properties.image.body);
      }
    },


    /**
     * Parse the EXIF data, determine the orientation and then generate a Canvas with a correctly oriented Image.
     *
     * Canvas is added as a child node.
     *
     * @method
     * @private
     * @param {Blob} blob
     */
    _renderCanvas(blob) {
      // Read the EXIF data
      ImageManager.parseMetaData(
        blob, (data) => {
          const options = {
            canvas: true,
          };

          if (data.imageHead && data.exif) {
            options.orientation = data.exif[0x0112] || 1;
          }
          options.maxWidth = options.minWidth = this.properties.sizes.width;
          options.maxHeight = options.minHeight = this.properties.sizes.height;

          // Write the image to a canvas with the specified orientation
          ImageManager(blob, (canvas) => {
            while (this.firstChild) this.removeChild(this.firstChild);
            if (canvas instanceof HTMLElement) {
              this.appendChild(canvas);
            } else {
              console.error(canvas);
            }
          }, options);
        },
      );
    },
  },
});

/*
 * Handle any Message that contains an IMage + Preview + Metadata or is just an Image
 */
layerUI.registerMessageHandler({
  tagName: 'layer-message-image',
  label: '<i class="fa fa-file-image-o" aria-hidden="true"></i> Image message',
  handlesMessage(message, container) {
    // Get the Image Parts
    const imageParts = message.parts.filter(part =>
      ['image/png', 'image/gif', 'image/jpeg'].indexOf(part.mimeType) !== -1).length;

    // Get the Preview Parts
    const previewParts = message.parts.filter(part =>
      part.mimeType === 'image/jpeg+preview').length;

    // Get the Metadata Parts
    const metaParts = message.parts.filter(part =>
      part.mimeType === 'application/json+imageSize').length;

    // We handle 1 part images or 3 part images.
    return (message.parts.length === 1 && imageParts ||
      message.parts.length === 3 && imageParts === 1 && previewParts === 1 && metaParts === 1);
  },
});


