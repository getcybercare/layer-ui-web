/**
 * The Unknown MessageHandler renders unhandled content with a placeholder politely
 * suggesting that a developer should probably handle it.
 *
 * @class layerUI.handlers.message.Unknown
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';

registerComponent('layer-message-unknown', {
  properties: {

    /**
     * The Message property provides the MessageParts we are going to render.
     *
     * @property {layer.Message} [message=null]
     */
    message: {
      set(value) {
        this.render();
      },
    },
  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate() {
    },

    /**
     * Render a message that is both polite and mildly annoying.
     *
     * @method
     * @private
     */
    render() {
      const mimeTypes = this.message.parts.map(part => part.mimeType)
      .join(', ');
      this.innerHTML = `Message with mimeTypes ${mimeTypes} has been received but has no renderer`;
    },
  },
});

// Do not register this handler

