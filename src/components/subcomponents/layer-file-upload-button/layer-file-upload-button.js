/**
 * The Layer Date widget renders a date.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.
 *
 * @class layerUI.components.subcomponents.Date
 * @extends layerUI.components.Component
 */
import layerUI, { layer as LayerAPI } from '../../../base';
import LUIComponent from '../../../components/component';

LUIComponent('layer-file-upload-button', {
  properties: {

  },
  methods: {

    /**
     * Constructor.
     *
     * @method _created
     * @private
     */
    _created() {
      this.nodes.input.id = LayerAPI.Util.generateUUID();
      this.nodes.label.setAttribute('for', this.nodes.input.id);
      this.nodes.input.addEventListener('change', this.onChange.bind(this));
      this.addEventListener('click', evt => this.nodes.input.click());
    },

    /**
     * When the file input's value has changed, gather the data and trigger an event
     */
    onChange() {
      const files = this.nodes.input.files;
      const inputParts = Array.prototype.map.call(files, file => new LayerAPI.MessagePart(file));

      // TODO: where do these dimensions come from?  How to customize? What are best practices?
      layerUI.files.processAttachments(inputParts, (parts) => {
        this.trigger('layer-file-selected', { parts });
      });
    },
  },
});
