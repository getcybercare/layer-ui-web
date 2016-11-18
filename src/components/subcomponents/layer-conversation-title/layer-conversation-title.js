/**
 * The Layer widget renders a title for a layer.Conversation.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own Conversation titles:
 *
 * ```
 * layerUI.init({
 *   layer: window.layer,
 *   appId:  'layer:///apps/staging/UUID',
 *   customComponents: ['layer-conversation-title']
 * });
 *
 * document.registerElement('layer-conversation-title', {
 *   prototype: Object.create(HTMLElement.prototype, {
 *     createdCallback: {
 *       value: function() {
 *         this.innerHTML = this.item.metadata.myCustomTitle;
 *       }
 *     }
 *   })
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.ConversationTitle
 * @extends layerUI.components.Component
 */
import LUIComponent from '../../../components/component';

LUIComponent('layer-conversation-title', {
  properties: {

    /**
     * The layer.Conversation to be rendered.
     *
     * @property {layer.Conversation} [item=null]
     */
    item: {
      set(newConversation, oldConversation) {
        if (oldConversation) oldConversation.off(null, null, this);
        if (newConversation) newConversation.on('conversations:change', this._rerender, this);
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

    /**
     * Rerender the widget any time a new conversation is assigned or that conversation has a relevant change event.
     *
     * @method
     * @private
     * @param {Event} evt
     */
    _rerender(evt) {
      if (!evt || evt.hasProperty('metadata') || evt.hasProperty('participants')) {
        const conversation = this.item;

        // If no conversation, empty the widget
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
