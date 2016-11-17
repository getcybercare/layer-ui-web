/**
 * The Layer Date widget renders a date.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.
 *
 * @class layerUI.components.subcomponents.MessageStatus
 * @extends layerUI.components.Component
 */
import { layer as LayerAPI } from '../../../base';
import LUIComponent from '../../../components/component';

LUIComponent('layer-message-status', {
  properties: {

    /**
     * Message whose status is to be rendered
     *
     * @property {layer.Message}
     */
    message: {
      set(value) {
        if (this.properties.oldMessage) {
          this.properties.oldMessage.off(null, null, this);
          this.properties.oldMessage = null;
        }
        if (value) {
          this.properties.oldMessage = value;
          value.on('messages:change', this._rerender, this);
          this._rerender();
        }
      },
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * statusItem.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * @property {Function}
     */
    messageStatusRenderer: {},
  },
  methods: {

    /**
     * Constructor.
     *
     * @method _created
     * @private
     */
    _created() {
    },

    _rerender(evt) {
      if (!evt || evt.hasProperty('recipientStatus')) {
        const message = this.message;
        if (this.messageStatusRenderer) {
          this.innerHTML = this.messageStatusRenderer(message);
        } else {
          let text = '';
          if (message.isSaving()) {
            text = 'pending';
          } else if (message.deliveryStatus === LayerAPI.Constants.RECIPIENT_STATE.NONE) {
            text = 'sent';
          } else if (message.readStatus === LayerAPI.Constants.RECIPIENT_STATE.NONE) {
            text = 'delivered';
          } else if (message.readStatus === LayerAPI.Constants.RECIPIENT_STATE.ALL) {
            text = 'read';
          } else {
            const sessionOwnerId = message.getClient().user.id;
            const status = message.recipientStatus;
            const count = Object.keys(status).filter(identityId =>
              identityId !== sessionOwnerId && status[identityId] === LayerAPI.Constants.RECEIPT_STATE.READ).length;
            text = `read by ${count} participants`;
          }
          this.innerHTML = text;
        }
      }
    },
  },
});

