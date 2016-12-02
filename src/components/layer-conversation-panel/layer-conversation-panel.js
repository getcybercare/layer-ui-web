/**
 * The Layer Conversation Panel includes a Message List, Typing Indicator Panel, and a Compose bar.
 *
 * Note that its up to the developer to tell this panel what its showing by setting the `conversationId` property.
 * This property affects what messages are rendered, what typing indicators are sent and rendered, and what Conversations messages are
 * sent to when your user types into the compose bar.
 *
 * Changing the `conversationId` is as simple as:
 *
 * ```javascript
 *  function selectConversation(conversation) {
 *    conversationPanel.conversationId = conversation.id;
 *  }
 * ```
 *
 * or if using a templating engine, something like this would also work for setting the `conversationId`:
 *
 * ```
 * <layer-conversation-panel conversation-id={selectedConversationId}></layer-conversation-panel>
 * ```
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-conversation-panel></layer-conversation-panel>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var conversation = document.createElement('layer-conversation-panel');
 * ```
 *
 * ## Key Properties
 *
 * * layerUI.components.ConversationPanel.conversationId (attribute-name: `conversation-id`): Set what conversation is being viewed
 * * layerUI.components.ConversationPanel.queryId (attribute-name: `query-id`): If your app already has a layer.Query, you can provide it to this widget to render and page through its Messages.  If you don't have a layer.Query instance, this widget will generate one for you.
 *
 * NOTE: If you provide your own Query, you must update its predicate when changing Conversations.
 *
 * ## Events
 *
 * Events listed here come from either this component, or its subcomponents.
 *
 * * {@link layerUI.components.subcomponents.Composer#layer-send-message layer-send-message}: User has requested their Message be sent
 * * {@link layerUI.components.subcomponents.Delete#layer-message-deleted layer-message-deleted}: User has requested a Message be deleted
 * * {@link layerUI.components.subcomponents.TypingIndicator#layer-typing-indicator-change layer-typing-indicator-change}: Someone in the Conversation has started/stopped typing
 *
 * @class layerUI.components.ConversationPanel
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.MainComponent
 */
import { layer as LayerAPI } from '../../base';
import LUIComponent from '../../components/component';
import MainComponent from '../../mixins/main-component';

LUIComponent('layer-conversation-panel', {
  mixins: [MainComponent],

  /**
   * This event is triggered before any Message is sent.
   *
   * You can use this event to provide your own logic for sending the Message.
   *
   * ```javascript
   * conversationPanel.onSendMessage = function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.message;
   *   myAsyncLookup(function(result) {
   *     var part = new layer.MessagePart({
   *       mimeType: 'application/json',
   *       body: result
   *     });
   *     message.addPart(part);
   *     message.send();
   *   });
   * };
   * ```
   *
   * @method onSendMessage
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message
   */

  /**
   * This event is triggered before any Message is sent.
   *
   * You can use this event to provide your own logic for sending the Message.
   *
   * ```javascript
   * document.body.addEventListener('layer-send-message', function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.message;
   *   myAsyncLookup(function(result) {
   *     var part = new layer.MessagePart({
   *       mimeType: 'application/json',
   *       body: result
   *     });
   *     message.addPart(part);
   *     message.send();
   *   });
   * });
   * ```
   *
   * @event layer-send-message
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message
   * @param {Object} evt.detail.notification
   */

  /**
   * This event is triggered before the Message is deleted.
   *
   * You can use this event to provide your own logic for deleting the Message, or preventing it from being deleted.
   *
   * ```javascript
   * conversationPanel.onMessageDeleted = function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.message;
   *   message.delete(layer.Constants.DELETION_MODES.MY_DEVICES);
   * };
   * ```
   *
   * @method onMessageDeleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message
   */

  /**
   * This event is triggered before the Message is deleted.
   *
   * You can use this event to provide your own logic for deleting the Message, or preventing it from being deleted.
   *
   * ```javascript
   * document.body.addEventListener('layer-message-deleted', function(evt) {
   *   evt.preventDefault();
   *   var message = evt.detail.message;
   *   message.delete(layer.Constants.DELETION_MODES.MY_DEVICES);
   * });
   * ```
   *
   * @event layer-message-deleted
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message
   */

  /**
   * Custom handler to use for rendering typing indicators.
   *
   * By calling `evt.preventDefault()` on the event you can provide your own custom typing indicator text to this widget:
   *
   * ```javascript
   * conversationPanel.onTypingIndicator = function(evt) {
   *    evt.preventDefault();
   *    var widget = evt.target;
   *    var typingUsers = evt.detail.typing;
   *    var pausedUsers = evt.detail.paused;
   *    var text = '';
   *    if (typingUsers.length) text = typingUsers.length + ' users are typing';
   *    if (pausedUsers.length && typingUsers.length) text += ' and ';
   *    if (pausedUsers.length) text += pausedUsers.length + ' users have paused typing';
   *    widget.value = text;
   * };
   * ```
   *
   * Note that as long as you have called `evt.preventDefault()` you can also just directly manipulate child domNodes of `evt.detail.widget`
   * if a plain textual message doesn't suffice.
   *
   * @method onTypingIndicatorChange
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity[]} evt.detail.typing
   * @param {layer.Identity[]} evt.detail.paused
   */

  /**
   * Custom handler to use for rendering typing indicators.
   *
   * By calling `evt.preventDefault()` on the event you can provide your own custom typing indicator text to this widget:
   *
   * ```javascript
   * document.body.addEventListener('layer-typing-indicator-change', function(evt) {
   *    evt.preventDefault();
   *    var widget = evt.target;
   *    var typingUsers = evt.detail.typing;
   *    var pausedUsers = evt.detail.paused;
   *    var text = '';
   *    if (typingUsers.length) text = typingUsers.length + ' users are typing';
   *    if (pausedUsers.length && typingUsers.length) text += ' and ';
   *    if (pausedUsers.length) text += pausedUsers.length + ' users have paused typing';
   *    widget.value = text;
   * });
   * ```
   *
   * Note that as long as you have called `evt.preventDefault()` you can also just directly manipulate child domNodes of `evt.detail.widget`
   * if a plain textual message doesn't suffice.
   *
   * @event layer-typing-indicator-change
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity[]} evt.detail.typing
   * @param {layer.Identity[]} evt.detail.paused
   */
  events: ['layer-message-deleted', 'layer-send-message', 'layer-typing-indicator-change'],

  properties: {

    /**
     * A Query ID identifies the layer.Query that provides the Messages we are to render and page through.
     *
     * You may use the layerUI.components.ConversationPanel.query property instead of layerUI.components.ConversationPanel.queryId,
     * however, if putting the value within an HTML attribute
     * rather than doing DOM manipulation, only string values work.
     *
     * Leaving this and the query properties empty will cause a Query to be generated for you.
     *
     * @property {String} [queryId='']
     */
    queryId: {
      set(value) {
        if (value && value.indexOf('layer:///queries') !== 0) this.properties.queryId = '';
        if (this.properties.client && this.queryId) {
          this.query = this.properties.client.getQuery(this.queryId);
        }
      },
    },

    /**
     * A Query identifies the layer.Query that provides the Messages we are to render and page through.
     *
     * You may use the layerUI.components.ConversationPanel.queryId property instead of layerUI.components.ConversationPanel.query,
     * however, if putting the value within an HTML attribute
     * rather than doing DOM manipulation, only string values work.
     *
     * Leaving this and the queryId properties empty will cause a Query to be generated for you.
     *
     * @property {layer.Query} [query=null]
     */
    query: {
      set(value, oldValue) {
        if (value instanceof LayerAPI.Query) {
          if (this.hasGeneratedQuery) {
            this.hasGeneratedQuery = false;
            oldValue.destroy();
          }
          this.nodes.list.query = value;
        } else {
          this.properties.query = null;
        }
      },
    },

    /**
     * ID of the Conversation being shown by this panel.
     *
     * This Conversation ID specifies what conversation to render and interact with.
     * This property needs to be changed any time you change to view a different Conversation.
     *
     * Alternative: See layerUI.components.LayerConversation.conversation property.  Strings however are easier to stick
     * into html template files.
     *
     * ```
     * function selectConversation(selectedConversation) {
     *   // These two lines are equivalent:
     *   widget.conversation = selectedConversation;
     *   widget.conversationId = selectedConversation.id;
     * }
     * ```
     *
     * @property {String} [conversationId='']
     */
    conversationId: {
      set(value) {
        if (value && value.indexOf('layer:///conversations') !== 0) this.properties.conversationId = '';
        if (this.client && this.conversationId) {
          if (this.client.isReady) {
            this.conversation = this.client.getConversation(this.conversationId, true);
          } else {
            this.client.once('ready', () => {
              if (this.conversationId) this.conversation = this.client.getConversation(this.conversationId, true);
            });
          }
        }
      },
    },

    /**
     * The Conversation being shown by this panel.
     *
     * This Conversation ID specifies what conversation to render and interact with.
     * This property needs to be changed any time you change to view a different Conversation.
     *
     * Alternative: See layerUI.components.LayerConversation.conversationId property for an easier property to use
     * within html templates.
     *
     * ```
     * function selectConversation(selectedConversation) {
     *   // These two lines are equivalent:
     *   widget.conversationId = selectedConversation.id;
     *   widget.conversation = selectedConversation;
     * }
     * ```
     *
     * @property {String}
     */
    conversation: {
      set(value) {
        if (value && !(value instanceof LayerAPI.Conversation)) this.properties.conversation = '';
        if (this.client && this.conversation) this._setupConversation();
      },
    },

    // Docs in mixins/main-component.js
    hasGeneratedQuery: {
      set(value) {
        if (value && this.conversationId && this.client) this._setupConversation();
      },
      type: Boolean,
    },

    /**
     * Refocus on the Conversation Panel any time the Conversation ID changes.
     *
     * So, the user clicked on a Conversation in a Conversation List, and focus is no longer on this widget?
     * Automatically refocus on it.
     *
     * @property {Boolean} [autoFocusConversation=true]
     */
    autoFocusConversation: {
      value: true,
      type: Boolean,
    },

    // Docs in mixins/main-component.js
    client: {
      set(value) {
        if (value) {
          if (!this.conversation && this.conversationId) this.conversation = value.getConversation(this.conversationId, true);
          if (this.conversation) this._setupConversation();
          if (this.queryId) {
            this.query = value.getQuery(this.queryId);
          } else {
            this._scheduleGeneratedQuery();
          }
        }
      },
    },

    /**
     * Function allows for additional dom nodes to be generated and inserted before/after messages
     *
     * ```
     * conversationPanel.onRenderListItem = function(widget, messages) {
     *   var message = widget.item;
     *   if (message.sentAt.toDateString() !== messages[index - 1].sentAt.toDateString()) {
     *     widget.customNodeAbove = document.createElement('hr');
     *     widget.customNodeBelow = document.createElement('hr');
     *   }
     *  });
     * ```
     *
     * @property {Function} onRenderListItem
     * @property {layerUI.components.MessagesListPanel.Item} onRenderListItem.widget
     *    One row of the list
     * @property {layer.Message[]} onRenderListItem.items
     *    full set of messages in the list
     * @property {Number} onRenderListItem.index
     *    index of the message in the items array
     * @property {Boolean} onRenderListItem.isTopItemNew
     *    If the top item is index 0, and its newly added rather than just affected by changes
     *    around it, this is often useful to know.
     */
    onRenderListItem: {
      type: Function,
      set(value) {
        this.nodes.list.onRenderListItem = value;
      },
      get() {
        return this.nodes.list.onRenderListItem;
      },
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not rerender the list.
     *
     * ```javascript
     * conversationPanel.dateRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function} [dateRenderer=null]
     */
    dateRenderer: {
      type: Function,
      set(value) {
        this.nodes.list.dateRenderer = value;
      },
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not rerender the list.
     *
     * ```javascript
     * conversationPanel.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * See layer.Message for more information on the properties available to determine a message's status.
     *
     * @property {Function} [messageStatusRenderer=null]
     */
    messageStatusRenderer: {
      type: Function,
      set(value) {
        this.nodes.list.messageStatusRenderer = value;
      },
    },

    emptyMessageListNode: {
      set(value) {
        this.nodes.list.emptyNode = value;
      },
      get(value) {
        return this.nodes.list.emptyNode;
      },
    },

    /**
     * An array of buttons (dom nodes) to be added to the Compose bar.
     *
     * ```
     * widget.composeButtons = [
     *     document.createElement('button'),
     *     document.createElement('button')
     * ];
     * ```
     *
     * @property {HTMLElement[]} [composeButtons=[]]
     */
    composeButtons: {
      set(value) {
        this.nodes.composer.buttons = value;
      },
    },

    /**
     * Use this to get/set the text in the Compose bar.
     *
     * ```
     * widget.composeText = 'This text will appear in the editor within the compose bar';
     * var message = conversation.createMessage(widget.composeText);
     * ```
     *
     * @property {String} [composeText='']
     */
    composeText: {
      get() {
        return this.nodes.composer.value;
      },
      set(value) {
        this.nodes.composer.value = value;
      },
    },

    /**
     * Use this to get/set the text in the Compose bar.
     *
     * ```
     * widget.composePlaceholder = 'Enter a message. Or dont. It really doesnt matter.';
     * ```
     *
     * @property {String} [composePlaceholder='']
     */
    composePlaceholder: {
      get() {
        return this.nodes.composer.placeholder;
      },
      set(value) {
        this.nodes.composer.placeholder = value;
      },
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=layer.Query.Message]
     */
    _queryModel: {
      value: LayerAPI.Query.Message,
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
      this.addEventListener('keydown', this._onKeyDown.bind(this));

      // Typically the defaultIndex is -1, but IE11 uses 0.
      const defaultIndex = document.head ? document.head.tabIndex : null;
      if (this.tabIndex === '' || this.tabIndex === -1 || this.tabIndex === defaultIndex) this.tabIndex = -1;
    },

    /**
     * Focus on compose bar if key is pressed within this panel.
     *
     * Unless the focus is on an input or textarea, in which case, let the user type.
     *
     * @method _onKeyDown
     * @param {Event} evt
     * @private
     */
    _onKeyDown(evt) {
      const keyCode = evt.keyCode;
      const metaKey = evt.metaKey;
      const ctrlKey = evt.ctrlKey;
      if (metaKey || ctrlKey) return;

      if (keyCode >= 65 && keyCode <= 90 || // a-z
          keyCode >= 48 && keyCode <= 57 || // 0-9
          keyCode >= 97 && keyCode <= 111 || // NUMPAD
          keyCode >= 186 && keyCode <= 191 || // Puncuation
          [32, 219, 220, 222].indexOf(keyCode) !== -1) {  // Punctuation
        if (['INPUT', 'TEXTAREA'].indexOf(document.activeElement.tagName) === -1) {
          this.focusText();
        }
      }
    },

    /**
     * Place focus on the text editor in the Compose bar.
     *
     * ```
     * widget.focusText();
     * ```
     *
     * @method
     */
    focusText() {
      this.nodes.composer.focus();
    },

    /**
     * Given a Conversation ID and a Client, setup the Composer and Typing Indicator
     *
     * @method _setupConversation
     * @private
     */
    _setupConversation() {
      const conversation = this.properties.conversation;

      // No Conversation? Not much to do... except if not yet authenticated,
      // in which case retry once authenticated.
      if (!conversation) {
        if (this.client && !this.client.isReady) {
          this.client.once('ready', this._setupConversation.bind(this));
        }
        return;
      }
      this.nodes.composer.conversation = conversation;
      this.nodes.typingIndicators.conversation = conversation;
      if (this.hasGeneratedQuery) {
        this.query.update({
          predicate: `conversation.id = "${conversation.id}"`,
        });
      }
      if (this.autoFocusConversation) this.focusText();
    },
  },
});

