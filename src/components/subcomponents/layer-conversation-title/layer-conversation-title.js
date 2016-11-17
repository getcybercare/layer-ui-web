/**
 * The Layer widget renders a title for a layer.Conversation.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own Conversation titles:
 *
 * ```
 * <script>
 * window.layerUI = {customComponents: ['layer-conversation-title']};
 * document.registerElement('layer-conversation-title', {
 *   prototype: Object.create(HTMLElement.prototype, {
 *     createdCallback: {
 *       this.innerHTML = this.item.metadata.myCustomTitle;
 *     }
 *   })
 * });
 * </script>
 * <script src='layer-websdkui-standard.js'></script>
 * ```
 *
 * @class layerUI.components.subcomponents.ConversationTitle
 * @extends layerUI.components.Component
 */
import LUIComponent from '../../../components/component';

LUIComponent('layer-conversation-title', {
  properties: {

    /**
     * layer.Conversation to be rendered
     *
     * @property {layer.Conversation}
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
      if (!evt || evt.hasProperty('metadata') || evt.hasProperty('participants')) {
        const conversation = this.item;
        if (!conversation) {
          this.innerHTML = '';
        } else {
          let title = conversation.metadata.conversationName ||
            conversation.metadata.title;
          if (!title) {
            const userNames = conversation.participants
              .filter(user => !user.sessionOwner) // don't show the user their own name
              .filter(user => user.displayName)   // don't show users who lack a name
              .map(user => user.displayName);     // replace identity object with the name

            if (userNames.length) {
              title = userNames.join(', ').replace(/, ([^,]*)$/, ' and $1');
            } else {
              title = 'No Title';
            }
          }
          if (title !== this.innerHTML) this.innerHTML = title;
        }
      }
    },
  },
});
