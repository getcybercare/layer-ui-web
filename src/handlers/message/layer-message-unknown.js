/**
 * The Unknown MessageHandler renders unhandled content with a placeholder politely
 * suggesting that a developer should probably handle it.
 *
 * @class layerUI.handlers.message.Unknown
 * @extends layerUI.components.Component
 */
import { registerComponent } from '../../components/component';
import MessageHandler from '../../mixins/message-handler';

registerComponent('layer-message-unknown', {
  mixins: [MessageHandler],
  methods: {
    /**
     * Render a message that is both polite and mildly annoying.
     *
     * @method
     * @private
     */
    onRender() {
      const mimeTypes = this.message.parts.map(part => part.mimeType)
      .join(', ');
      this.innerHTML = `Message with mimeTypes ${mimeTypes} has been received but has no renderer`;
    },
  },
});

// Do not register this handler

