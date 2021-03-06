/**
 * The Layer file upload button widget allows users to select a File to send.
 *
 * Its assumed that this button will be used within the layerUI.components.subcomponents.ComposeButtonPanel.
 * If using it elsewhere, note that it triggers a `layer-file-selected` event that you would listen for to do your own processing.
 * If using it in the ComposeButtonPanel, this event will be received by the Composer and will not propagate any further.
 *
 * ```
 * document.body.addEventListener('layer-file-selected', function(evt) {
 *    var messageParts = evt.custom.parts;
 *    conversation.createMessage({ parts: messageParts }).send();
 * }
 * ```
 *
 * @class layerUI.components.subcomponents.FileUploadButton
 * @extends layerUI.components.Component
 */
import * as Layer from 'layer-websdk';
import layerUI from '../../../base';
import { registerComponent } from '../../../components/component';

registerComponent('layer-file-upload-button', {
  properties: {

  },
  methods: {

    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate() {
      this.nodes.input.id = Layer.Util.generateUUID();
      this.nodes.label.setAttribute('for', this.nodes.input.id);
      this.nodes.input.addEventListener('change', this.onChange.bind(this));
      this.addEventListener('click', evt => this.nodes.input.click());
    },

    /**
     * MIXIN HOOK: When the file input's value has changed, gather the data and trigger an event.
     *
     * If adding a mixin here to change behaviors on selecting a file, you can use `this.nodes.input.files` to access
     * the selected files.
     *
     * @method
     */
    onChange() {
      const files = this.nodes.input.files;
      const inputParts = Array.prototype.map.call(files, file => new Layer.MessagePart(file));

      /**
       * This widget triggers a `layer-file-selected` event when the user selects files.
       * This event is captured and stopped from propagating by the layerUI.components.subcomponents.Composer.
       * If using it outside of the composer, this event can be used to receive the MessageParts generated
       * for the selected files.
       *
       * @event layer-file-selected
       * @param {Object} evt
       * @param {Object} evt.detail
       * @[aram {layer.MessagePart[]} evt.detail.parts
       */
      layerUI.files.processAttachments(inputParts, (parts) => {
        this.trigger('layer-file-selected', { parts });
      });
    },
  },
});
