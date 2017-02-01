/**
 * The Layer Conversation List widget renders a scrollable, pagable list of Conversations.
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-conversations-list></layer-conversations-list>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var conversation = document.createElement('layer-conversations-list');
 * ```
 *
 * And then its properties can be set as:
 *
 * ```javascript
 * var list = document.querySelector('layer-conversations-list');
 * list.onConversationSelected = function(evt) {
 *    alert(evt.detail.item.id + ' has been selected');
 * }
 * ```
 *
 * ## Common Properties
 *
 * The most common property of this widget is layerUI.components.ConversationsListPanel.onConversationSelected, as typical use
 * of this widget is to prompt the user to select a Conversation, and use that selection elsewhere.
 *
 * Note that you can also listen for `layer-conversation-selected` to achieve the same result:
 *
 * ```
 * document.body.addEventListener('layer-conversation-selected', function(evt) {
 *    alert(evt.detail.item.id + ' has been selected');
 * });
 * ```
 *
 * You may also sometimes want to set which Conversation to mark as selected:
 *
 * ```javascript
 * conversationList.selectedConversationId = myConversation.id;
 * ```
 *
 * @class layerUI.components.ConversationsListPanel.List
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.MainComponent
 */
import * as Layer from 'layer-websdk';
import { registerComponent } from '../../../components/component';
import List from '../../../mixins/list';
import ListSelection from '../../../mixins/list-selection';
import MainComponent from '../../../mixins/main-component';
import '../layer-conversation-item/layer-conversation-item';
import '../layer-channel-item/layer-channel-item';

registerComponent('layer-conversations-list', {
  mixins: [List, ListSelection, MainComponent],

  /**
   * Configure a custom action when a Conversation is selected;
   *
   * Use `evt.preventDefault()` to prevent default handling from occuring.
   *
   * ```javascript
   *    document.body.addEventListener('layer-conversation-selected', function(evt) {
   *      var conversation = evt.detail.item;
   *
   *      // To prevent the UI from proceding to select this conversation:
   *      evt.preventDefault();
   *    });
   * ```
   *
   * OR
   *
   * ```javascript
   *    converationList.onConversationSelected = function(evt) {
   *      var conversation = evt.detail.item;
   *
   *      // To prevent the UI from proceding to select this conversation:
   *      evt.preventDefault();
   *    });
   * ```
   *
   * @property {Function} onConversationSelected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Conversation} evt.detail.item   The selected Conversation
   * @param {Event} evt.detail.originalEvent               The click event that selected the Conversation
   */

  /**
   * See layerUI.components.ConversationsListPanel.onConversationSelected.
   *
   * @event layer-conversation-selected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Conversation} evt.detail.item   The selected Conversation
   * @param {Event} evt.detail.originalEvent               The click event that selected the Conversation
   */

  /**
   * The user has clicked to delete a conversation.
   *
   * ```javascript
   *    conversationListNode.onConversationDeleted = function(evt) {
   *      var conversation = evt.detail.item;
   *
   *      // To prevent the UI from proceding to delete this conversation (perhaps you want
   *      // to leave the Conversation instead of delete it):
   *      evt.preventDefault();
   *      conversation.leave();
   *    };
   * ```
   *
   *  OR
   *
   * ```javascript
   *    document.body.addEventListener('layer-conversation-deleted', function(evt) {
   *      var conversation = evt.detail.item;
   *
   *      // To prevent the UI from proceding to delete this conversation (perhaps you want
   *      // to leave the Conversation instead of delete it):
   *      evt.preventDefault();
   *      conversation.leave();
   *    });
   * ```
   *
   * @property {Function} onConversationDeleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Conversation} evt.detail.item
   */

  /**
   * See layerUI.components.ConversationsListPanel.List.onConversationDeleted.
   *
   * @event layer-conversation-deleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Conversation} evt.detail.item
   */

  events: ['layer-conversation-selected', 'layer-conversation-deleted'],
  properties: {

    /**
     * Get/Set the selected Conversation by ID.
     *
     * ```javascript
     * conversationList.selectedConversationId = myConversation.id;
     * ```
     *
     * Or if using a templating engine:
     *
     * ```html
     * <layer-conversations-list selected-conversation-id={{selectedConversation.id}}></layer-conversations-list>
     * ```
     *
     * The above code will set the selected Conversation and render the conversation as selected.
     *
     * @property {String} [selectedConversationId='']
     * @deprecated see layerUI.components.ConversationsListPanel.ListSelection.selectedId
     */
    selectedConversationId: {
      set(value) {
        this.selectedId = value;
      },
      get() {
        return this.selectedId;
      },
    },

    /**
     * Function allows for control over which Conversations can be deleted and which can not.
     *
     * Return true means enabled, false is disabled.
     *
     *  ```javascript
     * conversationPanel.deleteConversationEnabled = function(conversation) {
     *     return conversation.metadata.category !== 'adminStuff';
     * });
     * ```
     *
     * If delete is enabled, the layerUI.components.misc.Delete.enabled property is changed, causing
     * the `layer-delete-enabled` css class to be added/removed on that widget.
     *
     * @property {Function} [deleteConversationEnabled=null]
     * @property {layer.Conversation} deleteConversationEnabled.conversation
     * @property {Boolean} deleteConversationEnabled.return
     */
    deleteConversationEnabled: {
      type: Function,
    },

    /**
     * Set a filter to control which Conversations should be listed.
     *
     * NOTE: This filters the data that the query has retreived, it does not change the query,
     * so you may filter out all results, even though there are matching results waiting on the server.
     * Take control of the layerUI.components.ConversationsListPanel.query property if you need complete results.
     *
     * Accepted values for the filter property include:
     *
     * * A function that looks at each Conversation and returns a Boolean
     * * A Regular Expression that will be tested against each
     * layer.Conversation's `metadata.conversationName` property, and each particpants
     * `displayName`, `firstName`, `lastName` and `emailAddress` properties.
     * * A string to compare against the same list of properties as the RegEx.
     *
     * ```
     * conversationListWidget.filter = function(conversation) {
     *   return conversation.metadata.priority === 'important';
     * }
     * ```
     *
     * @property {String|RegEx|Function} [filter='']
     */
    filter: {
      set(value) {
        this._runFilter();
      },
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=layer.Query.Conversation]
     */
    _queryModel: {
      value: Layer.Query.Conversation,
    },

    /**
     * The event name to trigger on selecting a Conversation.
     *
     * @readonly
     * @private
     * @property {String} [_selectedItemEventName=layer-conversation-selected]
     */
    _selectedItemEventName: {
      value: 'layer-conversation-selected',
    },

    /**
     * Provide a function to determine if the last message is rendered in the Conversation List.
     *
     * By default, only text/plain last-messages are rendered in the Conversation List.
     *
     * ```javascript
     * list.canFullyRenderLastMessage = function(message) {
     *     return message.parts[0].mimeType === 'text/mountain' ||
     *            message.parts[0].mimeType === 'text/plain';
     * }
     * ```
     *
     * If you enable rendering of images for example, you would be enabling the handler that renders image messages
     * in the Message List to render that same image in the Conversation List.
     *
     * If you prevent rendering of a Message, it will instead render the `label` attribute for that message handler;
     * see layerUI.registerMessageHandler for more info on the `label`.
     *
     * @property {Function} canFullyRenderLastMessage
     */
    canFullyRenderLastMessage: {
      type: Function,
      value(message) {
        return (message.parts.length === 1 && message.parts[0].mimeType === 'text/plain');
      },
    },
  },
  methods: {
    /**
     * Generate a `layer-conversation-item` widget.
     *
     * @method _generateItem
     * @private
     * @param {layer.Conversation} conversation
     */
    _generateItem(conversation) {
      const isChannel = conversation instanceof Layer.Channel;
      const conversationWidget = document.createElement(`layer-${isChannel ? 'channel' : 'conversation'}-item`);
      conversationWidget.id = this._getItemId(conversation.id);
      conversationWidget.deleteConversationEnabled = typeof this.deleteConversationEnabled === 'function' ?
        this.deleteConversationEnabled(conversation) : true;
      conversationWidget.canFullyRenderLastMessage = this.canFullyRenderLastMessage;
      conversationWidget.item = conversation;
      if (this.filter) conversationWidget._runFilter(this.filter);
      return conversationWidget;
    },

    /**
     * Run the filter on all Conversation Items.
     *
     * @method _runFilter
     * @private
     */
    _runFilter() {
      // If the filter has been reset, remove all filtering
      if (!this.filter) {
        this.querySelectorAllArray('.layer-item-filtered').forEach(item => item.removeClass('layer-item-filtered'));
      }

      // Run all filtering
      else {
        for (let i = 0; i < this.childNodes.length; i++) {
          const listItem = this.childNodes[i];
          if (listItem.item instanceof Layer.Root) {
            listItem._runFilter(this.filter);
          }
        }
      }
    },
  },
});
