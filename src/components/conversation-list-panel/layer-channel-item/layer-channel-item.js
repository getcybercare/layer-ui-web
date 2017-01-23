/**
 * The Layer Channel Item widget renders a single Channel, typically for use representing a
 * channel within a list of channels.
 *
 * This is designed to go inside of the layerUI.components.ConversationsListPanel.List widget, and be a
 * concise enough summary that it can be scrolled through along
 * with hundreds of other Conversations Item widgets.
 *
 * Future Work:
 *
 * * Badges for unread messages (currently just adds a css class so styling can change if there are any unread messages)
 *
 * @class layerUI.components.ConversationsListPanel.Item.Channel
 * @extends layerUI.components.Component
 */
import LUIComponent from '../../../components/component';
import ListItem from '../../../mixins/list-item';

LUIComponent('layer-channel-item', {
  mixins: [ListItem],
  properties: {

    // Every List Item has an item property, here it represents the Conversation to render
    item: {
      set(newConversation, oldConversation) {
        this.nodes.title.innerHTML = newConversation.name;
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
  },
  methods: {

    onRender() {
      this.onRerender();
    },

    onRerender() {
      this.nodes.title.innerHTML = this.item.name;
    },

    /**
     * Run a filter on this item; not match => hidden; match => shown.
     *
     * @method _runFilter
     * @param {String|Regex|Function} filter
     */
    _runFilter(filter) {

    },
  },
});

