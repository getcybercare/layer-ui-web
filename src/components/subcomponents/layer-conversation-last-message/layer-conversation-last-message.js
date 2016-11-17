/**
 * The Layer widget renders a Last Message for a layer.Conversation.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own Conversation Last Message rendering:
 *
 * ```
 * <script>
 * window.layerUI = {customComponents: ['layer-conversation-last-message']};
 * document.registerElement('layer-conversation-last-message', {
 *   prototype: Object.create(HTMLElement.prototype, {
 *     createdCallback: {
 *       this.innerHTML = this.item.lastMessage.parts[0].body;
 *     }
 *   })
 * });
 * </script>
 * <script src='layer-websdkui-standard.js'></script>
 * ```
 *
 * @class layerUI.components.subcomponents.ConversationLastMessage
 * @extends layerUI.components.Component
 */
import layerUI from '../../../base';
import LUIComponent from '../../../components/component';

LUIComponent('layer-conversation-last-message', {
  properties: {

    /**
     * layer.Message to be rendered
     *
     * @property {layer.Message}
     */
    item: {
      set(value) {
        // This component is not currently being used in a way where items change, so this block isn't
        // currently used, but is here as "best practice"
        if (this.properties.oldConversation) {
          this.properties.oldConversation.off(null, null, this);
          this.properties.oldConversation = null;
        }
        if (value) {
          this.properties.oldConversation = value;
          value.on('conversations:change', this._rerender, this);
        }
        this._rerender();
      },
    },

    /**
     * Provide a function to determine if the last message is rendered in the Conversation List.
     *
     * By default, only text/plain last-messages are rendered in the Conversation List.
     *
     * ```javascript
     * listItem.canFullyRenderLastMessage = function(message) {
     *     return true; // Render all Last Messages
     * }
     * ```
     *
     * @property {Function}
     */
    canFullyRenderLastMessage: {},
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
      if (!evt || evt.hasProperty('lastMessage')) {
        const conversation = this.item;
        const message = conversation ? conversation.lastMessage : null;
        if (!message) {
          this.innerHTML = '';
        } else {
          if (this.firstChild) this.removeChild(this.firstChild);

          let handler;
          if (message) {
            handler = layerUI.getHandler(message, this);
          }

          if (handler) {
            this.classList.add(handler.tagName);
            if (!this.canFullyRenderLastMessage || this.canFullyRenderLastMessage(message)) {
              const messageHandler = document.createElement(handler.tagName);

              messageHandler.parentContainer = this;
              messageHandler.message = message;
              this.appendChild(messageHandler);
            } else if (handler.label) {
              this.innerHTML = `<div class="layer-custom-mime-type">${handler.label}</div>`;
            }
          }
        }
      }
    },
  },
});
