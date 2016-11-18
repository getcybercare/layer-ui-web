/**
 * The Layer Message Status widget renders a Message's sent/delivered/read status.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.  Note that most customization of message status rendering can be accomplished instead
 * using layerUI.components.ConversationPanel.messageStatusRenderer.
 *
 * ```
 * layerUI.init({
 *   layer: window.layer,
 *   appId:  'layer:///apps/staging/UUID',
 *   customComponents: ['layer-message-status']
 * });
 *
 * layerUI.registerComponent('layer-message-status', {
 *    properties: {
 *      message: {
 *        set: function(value) {
 *          if (newMessage) newMessage.on('messages:change', this._rerender, this);
 *          this._rerender();
 *        }
 *      }
 *    },
 *    methods: {
 *      _rerender: function() {
 *          var message = this.properties.message;
 *          this.innerHTML = 'Nobody wants to read your message';
 *      }
 *    }
 * });
 * ```
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
     * @property {layer.Message} [message=null]
     */
    message: {
      set(newMessage, oldMessage) {
        if (oldMessage) oldMessage.off(null, null, this);
        if (newMessage) newMessage.on('messages:change', this._rerender, this);
        this._rerender();
      },
    },

    /**
     * Provide property to override the function used to render a message status for each Message Item.
     *
     * Note that changing this will not trigger a rerender; this should be set during initialization.
     *
     * ```javascript
     * statusItem.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * @property {Function} [messageStatusRenderer=null]
     */
    messageStatusRenderer: {
      order: 100, // make sure this is set before setting the message property
    },
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

    /**
     * There are many ways to render the status of a Message.
     *
     * See layerUI.components.ConversationPanel.messageStatusRenderer to customize this.
     *
     * @method
     * @private
     * @param {Event} evt
     */
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

