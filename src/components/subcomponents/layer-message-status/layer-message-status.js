/**
 * The Layer Message Status widget renders a Message's sent/delivered/read status.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.  Note that most customization of message status rendering can be accomplished instead
 * using layerUI.components.ConversationPanel.messageStatusRenderer.
 *
 * ```
 * layerUI.registerComponent('layer-message-status', {
 *    properties: {
 *      message: {
 *        set: function(value) {
 *          if (newMessage) newMessage.on('messages:change', this.onRerender, this);
 *          this.onRerender();
 *        }
 *      }
 *    },
 *    methods: {
 *      onRerender: function() {
 *          var message = this.properties.message;
 *          this.innerHTML = 'Nobody wants to read your message';
 *      }
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.MessageStatus
 * @extends layerUI.components.Component
 */
import * as Layer from 'layer-websdk';
import { registerComponent } from '../../../components/component';

registerComponent('layer-message-status', {
  properties: {

    /**
     * Message whose status is to be rendered
     *
     * @property {layer.Message} [message=null]
     */
    item: {
      set(newMessage, oldMessage) {
        if (oldMessage) oldMessage.off(null, null, this);
        if (newMessage) newMessage.on('messages:change', this.onRerender, this);
        this.onRender();
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
    messageStatusRenderer: {},
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

    onRender() {
      this.onRerender();
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
    onRerender(evt) {
      if (this.item && (!evt || evt.hasProperty('recipientStatus') || evt.hasProperty('syncState'))) {
        const message = this.item;
        if (this.messageStatusRenderer) {
          this.innerHTML = this.messageStatusRenderer(message);
        } else {
          let text = '';
          if (message.isNew()) {
            text = '';
          } else if (message.isSaving() || message.isNew()) {
            text = 'pending';
          } else if (message instanceof Layer.Message.ChannelMessage ||
            message.deliveryStatus === Layer.Constants.RECIPIENT_STATE.NONE) {
            text = 'sent';
          } else if (message.readStatus === Layer.Constants.RECIPIENT_STATE.NONE) {
            text = 'delivered';
          } else if (message.readStatus === Layer.Constants.RECIPIENT_STATE.ALL) {
            text = 'read';
          } else {
            const sessionOwnerId = message.getClient().user.id;
            const status = message.recipientStatus;
            const count = Object.keys(status).filter(identityId =>
              identityId !== sessionOwnerId && status[identityId] === Layer.Constants.RECEIPT_STATE.READ).length;
            text = `read by ${count} participants`;
          }
          this.innerHTML = text;
        }
      }
    },
  },
});
