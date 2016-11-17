/**
 * The Layer Delete widget renders a deletion button.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own deletion capability.
 *
 * @class layerUI.components.subcomponents.Delete
 * @extends layerUI.components.Component
 */
import { layer as LayerAPI } from '../../../base';
import LUIComponent from '../../../components/component';

LUIComponent('layer-delete', {
  properties: {

    /**
     * Item to be deleted.
     *
     * @property {Date}
     */
    item: {},

    /**
     * Is deletion enabled for this item?
     *
     * @property {Boolean}
     */
    enabled: {
      type: Boolean,
      set(value) {
        this.classList[value ? 'add' : 'remove']('layer-delete-enabled');
      },
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
      this.addEventListener('click', this.onDeleteClick, this);
    },

    /**
     * If the Delete button was clicked, delete the Message.
     *
     * Triggers `layer-message-deleted` or `layer-conversation-deleted` allowing deletion to be handled elsewhere.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    onDeleteClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      if (this.enabled) {
        if (this.item instanceof LayerAPI.Message) {
          /**
           * A request has been made through the UI to delete a Message.
           *
           * This event can be canceled to prevent the default deletion behavior:
           *
           * ```javascript
           * document.body.addEventListener('layer-message-deleted', function(evt) {
           *    evt.preventDefault();
           *    var message = evt.message;
           *    message.delete(layer.Constants.DELETION_MODE.MY_DEVICES);
           * });
           * ```
           *
           * @event layer-message-deleted
           */
          if (this.trigger('layer-message-deleted', { message: this.item })) {
            if (window.confirm('Are you sure you want to delete this message?')) {
              this.item.delete(LayerAPI.Constants.DELETION_MODE.ALL);
            }
          }
        }

        /**
         * A request has been made through the UI to delete a Conversation.
         *
         * This event can be canceled to prevent the default deletion behavior:
         *
         * ```javascript
         * document.body.addEventListener('layer-conversation-deleted', function(evt) {
         *    evt.preventDefault();
         *    var conversation = evt.conversation;
         *    conversation.delete(layer.Constants.DELETION_MODE.MY_DEVICES);
         * });
         * ```
         *
         * @event layer-conversation-deleted
         */
        else if (this.trigger('layer-conversation-deleted', { conversation: this.item })) {
          if (window.confirm('Are you sure you want to delete this conversation?')) {
            this.item.delete(LayerAPI.Constants.DELETION_MODE.ALL);
          }
        }
      }
    },
  },
});
