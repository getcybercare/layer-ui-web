/**
 * The Layer Conversation Item widget renders a single Conversation, typically for use representing a
 * conversation within a list of conversations.
 *
 * This is designed to go inside of the layerUI.components.ConversationsListPanel.List widget, and be a
 * concise enough summary that it can be scrolled through along
 * with hundreds of other Conversations Item widgets.
 *
 * Future Work:
 *
 * * Badges for unread messages (currently just adds a css class so styling can change if there are any unread messages)
 *
 * @class layerUI.components.ConversationsListPanel.Item
 * @extends layerUI.components.Component
 */
import LUIComponent from '../../../components/component';
import ListItem from '../../../mixins/list-item';

LUIComponent('layer-conversation-item', {
  mixins: [ListItem],
  properties: {

    // Every List Item has an item property, here it represents the Conversation to render
    item: {
      set(newConversation, oldConversation) {
        this._render();
        if (oldConversation) oldConversation.off(null, null, this);

        if (newConversation) {
          newConversation.on('conversations:change', this._rerender, this);
        }
        if (this.nodes.delete) this.nodes.delete.item = newConversation;
        if (this.nodes.title) this.nodes.title.item = newConversation;
        if (this.nodes.lastMessage) {
          this.nodes.lastMessage.canFullyRenderLastMessage = this.canFullyRenderLastMessage;
          this.nodes.lastMessage.item = newConversation;
        }
      },
    },

    /**
     * Enable deletion of this Conversation.
     *
     * This property is currently assumed to be settable at creation time only,
     * and does not rerender if changed.
     *
     * This property does nothing if you remove the `delete` node from the template.
     *
     * @property {Boolean} [deleteConversationEnabled=false]
     */
    deleteConversationEnabled: {
      type: Boolean,
      set(value) {
        if (this.nodes.delete) this.nodes.delete.enabled = value;
      },
    },

    /**
     * Provide a function to determine if the last message is rendered in the Conversation List.
     *
     * By default, only text/plain last-messages are fully rendered in the Conversation List.
     *
     * All other messages are rendered using the `label` passed in with their layerUI.registerMessageHandler call.
     *
     * ```javascript
     * listItem.canFullyRenderLastMessage = function(message) {
     *     return true; // Render the current Messages
     * }
     * ```
     *
     * @property {Function} [canFullyRenderLastMessage=null]
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

    /**
     * Render this Conversation Item.
     *
     * @method _render
     * @private
     */
    _render() {
      this._rerender();
    },

    /**
     * Update the rendering with new properties.
     *
     * @method _rerender
     * @private
     */
    _rerender() {
      const users = this.item.participants.filter(user => !user.sessionOwner);
      const isRead = !this.item.lastMessage || this.item.lastMessage.isRead;

      this.nodes.avatar.users = users;
      this.classList[isRead ? 'remove' : 'add']('layer-conversation-unread-messages');
    },

    /**
     * Run a filter on this item; not match => hidden; match => shown.
     *
     * @method _runFilter
     * @param {String|Regex|Function} filter
     */
    _runFilter(filter) {
      const conversation = this.properties.item;
      let match;
      if (!filter) {
        match = true;
      } else if (typeof filter === 'function') {
        match = filter(conversation);
      } else {
        const values = [];
        if (conversation.metadata.conversationName) values.push(conversation.metadata.conversationName);
        conversation.participants.forEach((identity) => {
          values.push(identity.displayName);
          values.push(identity.firstName);
          values.push(identity.lastName);
          values.push(identity.emailAddress);
        });
        if (filter instanceof RegExp) {
          match = values.filter(value => filter.test(value)).length;
        } else {
          filter = filter.toLowerCase();
          match = values.filter((value) => {
            if (value) {
              return value.toLowerCase().indexOf(filter) !== -1;
            } else {
              return false;
            }
          }).length;
        }
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    },
  },
});

