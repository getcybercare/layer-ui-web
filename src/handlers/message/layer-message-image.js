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
 * @class layerUI.handlers.message.Image
 * @extends layerUI.components.Component
 */
import ImageManager from 'blueimp-load-image/js/load-image';
import 'blueimp-load-image/js/load-image-orientation';
import 'blueimp-load-image/js/load-image-meta';
import 'blueimp-load-image/js/load-image-exif';

import layerUI from '../../base';
import LUIComponent from '../../components/component';
import normalizeSize from '../../utils/sizing';

// TODO: Investigate if this is still needed, but I think the dependency on this is baked into the ImageManager.
window.loadImage = ImageManager;

LUIComponent('layer-message-image', {
  properties: {

    /**
     * The Message property provides the MessageParts we are going to render.
     *
     * @property {layer.Message}
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
            this.properties.preview.on('content-loaded', this.render, this);
          }
          // TODO: remove body test once all websdk changes are merged and url is gaurenteed to have a value if body has a value
          // If image does not have a url, call fetchStream to get an updated url
          if (!this.properties.image.url && !this.properties.image.body) this.properties.image.fetchStream();
        }

        // If there is no preview, only an image, we're going to pass it into the ImageManager so fetch its body
        else if (!this.properties.image.body) {
          this.properties.image.fetchContent();
          this.properties.image.on('content-loaded', this.render, this);
        }

        // Render the Message
        this.render();
      },
    },

    /**
     * Knowing the height of the list will help us determine a suitable size for the Image.
     *
     * @property {Number}
     */
    listHeight: {},

    /**
     * Knowing the width of the list will help us determine a suitable size for the Image.
     *
     * @property {Number}
     */
    listWidth: {},

    /**
     * Optional parameter to use for rendering images.
     *
     * @property {Boolean}
     */
    noPadding: {},
  },
  methods: {

    /**
     * Constructor.
     *
     * @method created
     * @private
     */
    created() {
      this.addEventListener('click', this.handleClick.bind(this));
    },

    /**
     * If the user clicks the image, and we have a full image part with a url, open it.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    handleClick(evt) {
      if (this.parentNode.tagName !== 'LAYER-CONVERSATION-LAST-MESSAGE') {
        evt.preventDefault();
        if (this.properties.image && this.properties.image.url) window.open(this.properties.image.url);
      }
    },

    /**
     * Render the Message.
     *
     * Primarily, this method determines whether to call renderCanvas on the preview or the image.
     *
     * @method
     * @private
     */
    render() {
      // TODO: Need something better than hardcoded in sizes.
      this.properties.sizes = normalizeSize(this.properties.meta, { width: 256, height: 256, noPadding: this.noPadding });
      this.style.width = this.properties.sizes.width + 'px';
      this.style.height = this.properties.sizes.height + 'px';
      if (this.properties.preview && this.properties.preview.body) {
        this.renderCanvas(this.properties.preview.body);
      } else if (this.properties.image && this.properties.image.body) {
        this.renderCanvas(this.properties.image.body);
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
    renderCanvas(blob) {
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
    const imageParts = message.parts.filter(part =>
      ['image/png', 'image/gif', 'image/jpeg'].indexOf(part.mimeType) !== -1).length;
    const previewParts = message.parts.filter(part =>
      part.mimeType === 'image/jpeg+preview').length;
    const metaParts = message.parts.filter(part =>
      part.mimeType === 'application/json+imageSize').length;
    return (message.parts.length === 1 && imageParts ||
      message.parts.length === 3 && imageParts === 1 && previewParts === 1 && metaParts === 1);
  },
});


