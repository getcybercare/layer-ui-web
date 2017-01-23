/**
 * The Layer Delete widget renders a deletion button.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own deletion capability.
 *
 * Note that the `item` property can refer to any type of data that can be deleted, including layer.Message and layer.Conversation.
 *
 * ```
 * layerUI.registerComponent('layer-delete', {
 *    properties: {
 *      item: {}
 *    },
 *    methods: {
 *      onCreate: function() {
 *        this.addEventListener('click', this.onDeleteClick, this);
 *      },
 *      onDeleteClick: function() {
 *         alert('I'm sorry Dave, I can't do that');
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
 * @class layerUI.components.subcomponents.Delete
 * @extends layerUI.components.Component
 */
import * as Layer from 'layer-websdk';
import { registerComponent } from '../../../components/component';

registerComponent('layer-delete', {
  properties: {

    /**
     * Item to be deleted.
     *
     * @property {layer.Root} [item=null]
     */
    item: {},

    /**
     * Is deletion enabled for this item?
     *
     * @property {Boolean} [enabled=false]
     */
    enabled: {
      type: Boolean,
      set(value) {
        // Note that IE11 doesn't propetly support classList.toggle()
        this.classList[value ? 'add' : 'remove']('layer-delete-enabled');
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
      this.addEventListener('click', this.onDeleteClick, this);
    },

    /**
     * MIXIN HOOK: Called when the delete button is clicked..
     *
     * Triggers `layer-message-deleted` or `layer-conversation-deleted` allowing deletion to be handled elsewhere.
     *
     * @method
     * @param {Event} evt
     */
    onDeleteClick(evt) {
      evt.preventDefault();
      evt.stopPropagation();
      if (this.enabled) {
        if (this.item instanceof Layer.Message) {
          /**
           * A request has been made through the UI to delete a Message.
           *
           * This event can be canceled to prevent the default deletion behavior:
           *
           * ```javascript
           * document.body.addEventListener('layer-message-deleted', function(evt) {
           *    evt.preventDefault();
           *    var message = evt.item;
           *    message.delete(layer.Constants.DELETION_MODE.MY_DEVICES);
           * });
           * ```
           *
           * @event layer-message-deleted
           */
          if (this.trigger('layer-message-deleted', { item: this.item })) {
            if (window.confirm('Are you sure you want to delete this message?')) {
              this.item.delete(Layer.Constants.DELETION_MODE.ALL);
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
         *    var conversation = evt.item;
         *    conversation.delete(layer.Constants.DELETION_MODE.MY_DEVICES);
         * });
         * ```
         *
         * @event layer-conversation-deleted
         */
        else if (this.trigger('layer-conversation-deleted', { item: this.item })) {
          if (window.confirm('Are you sure you want to delete this conversation?')) {
            this.item.delete(Layer.Constants.DELETION_MODE.ALL);
          }
        }
      }
    },
  },
});
