/**
 * The Layer Message Item widget renders a single Message synopsis.
 *
 * This is designed to go inside of the layerUI.MessageList widget.  This widget renders the framework of information that goes around a Message,
 * but leaves it up to custom handlers to render the contents and assorted MIME Types of the messages.
 *
 * This Component has two named templates:
 *
 * * `layer-message-item-sent`: Rendering for Messages sent by the owner of this Session
 * * `layer-message-item-received`: Rendering for Messages sent by other users
 *
 * ## Advanced Customization
 *
 * The simple way to customize the widget is to modify its template.
 * For more advanced customizations where the Message Item widget needs new properties, methods and capabilities, you have two options:
 *
 * 1. Define a custom `<layer-message-item/>` widget; this works but your now entirely responsible for all of its
 *    behaviors, and can not easily integrate fixes and enhancements added to this repo. This is discussed in more
 *    detail at [docs.layer.com](https://docs.layer.com).
 * 2. Enhance the provided widget with Mixins.  Below illustrates an example of a mixin.
 *
 * A Custom Mixin can be used to add Properties and Methods to this class.
 * Any method of this class can be enhanced using a Custom Mixin, however the following methods are recommended
 * as sufficient for most solutions:
 *
 * * layerUI.components.MessagesListPanel.List.onCreate: Your widget has just been created; it has a DOM node, it has child
 *   nodes, *it has no properties*, nor does not yet have a `parentNode`.
 *   Provide an `onCreate` if there is any DOM manipulation you want to do any initialization.  (DOM Manipulation here should NOT depend
 *   upon property values).
 * * layerUI.components.MessagesListPanel.List.onAttach: Your widget now has a `parentNode`.  This is solely for initialization
 *   code that depends upon looking at the `parentNode`, and is not commonly used.
 * * layerUI.components.MessagesListPanel.List.onRender: Your Message Item widget has just been rendered for the first time.
 *   Your widget should have an `item` at this point and any property-based dom manipulation can be done at this time.
 *
 * The following example adds a search bar to the Message List
 * ```
 * layerUI.init({
 *   appId: 'my-app-id',
 *   mixins: {
 *     'layer-messages-item': {
 *       properties: {
 *         selected: {
 *           value: false,
 *           set: function(value) {
 *             if (this.nodes.checkbox) this.nodes.checkbox.checked = value;
 *           },
 *           get: function() {
 *             return this.nodes.checkbox ? this.nodes.checkbox.checked : this.properties.selected;
 *           }
 *         }
 *       },
 *       methods: {
 *         onCreate: function() {
 *           this.nodes.checkbox = document.createElement('input');
 *           this.nodes.checkbox.type = 'checkbox';
 *           this.nodes.checkbox.classList.add('custom-checkbox');
 *           this.nodes.checkbox.addEventListener('click', this._handleCustomCheckboxEvent.bind(this));
 *           this.appendChild(this.nodes.checkbox);
 *         },
 *
 *         // When the widget has been rendered is a good time to do any property based dom manipulation
 *         onRender: function() {
 *          this.nodes.checkbox.checked = this.selected;
 *         },
 *
 *         // Search is run whenver the user changes the search text, app changes the search text,
 *         // or new messages arrive that need to be searched
 *         _handleCustomCheckboxEvent(evt) {
 *           this.trigger('custom-message-checkbox-change', {
 *             isChecked: this.selected,
 *             item: this.item
 *           });
 *         }
 *       }
 *     }
 *   }
 * });
 * ```
 *
 * @class layerUI.components.MessagesListPanel.Item
 * @mixins layerUI.mixins.ListItem
 * @extends layerUI.components.Component
 */
import * as Layer from 'layer-websdk';

module.exports = {
  properties: {

    // Every List Item has an item property, here it represents the Conversation to render
    item: {},

    /**
     * Deletion of this Message is enabled.
     *
     * ```
     * widget.getDeleteEnabled = function(message) {
     *    return message.sender.sessionOwner;
     * }
     * ```
     *
     * @property {Function}
     */
    getDeleteEnabled: {
      type: Function,
    },

    /**
     * HTML Tag to generate for the current content
     *
     * @private
     * @property {String}
     */
    _contentTag: {
      set(newTag, oldTag) {
        if (oldTag) this.removeClass(this._contentTag);
        if (newTag) this.addClass(newTag);
        if (this.nodes.itemNode) this.nodes.itemNode._contentTag = this.properties._contentTag;
      },
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageItem.dateRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function}
     */
    dateRenderer: {},

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageItem.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * @property {Function}
     */
    messageStatusRenderer: {},
  },
  methods: {
    onRender: function onRender() {
      try {

        // Setup the layer-sender-name
        if (this.nodes.sender) {
          this.nodes.sender.innerHTML = this.item.sender.displayName;
        }

        if (this.nodes.avatar) {
          this.nodes.avatar.users = [this.item.sender];
        }

        // Setup the layer-date
        if (this.nodes.date) {
          if (this.dateRenderer) this.nodes.date.dateRenderer = this.dateRenderer;
          this.nodes.date.date = this.item.sentAt;
        }

        // Setup the layer-message-status
        if (this.nodes.status && this.messageStatusRenderer) this.nodes.status.messageStatusRenderer = this.messageStatusRenderer;

        // Setup the layer-delete
        if (this.nodes.delete) {
          this.nodes.delete.enabled = this.getDeleteEnabled ? this.getDeleteEnabled(this.properties.item) : true;
        }

        // Generate the renderer for this Message's MessageParts.
        this._applyContentTag();

        // Render all mutable data
        this.onRerender();
      } catch (err) {
        console.error('layer-message-item.render(): ', err);
      }
    },

    onRerender() {
      const readStatus = this.properties.item.readStatus;
      const deliveryStatus = this.properties.item.deliveryStatus;
      const statusPrefix = 'layer-message-status';
      this.toggleClass('layer-unread-message', !this.properties.item.isRead);
      this.toggleClass(`${statusPrefix}-read-by-all`, readStatus === Layer.Constants.RECIPIENT_STATE.ALL);
      this.toggleClass(`${statusPrefix}-read-by-some`, readStatus === Layer.Constants.RECIPIENT_STATE.SOME);
      this.toggleClass(`${statusPrefix}-read-by-none`, readStatus === Layer.Constants.RECIPIENT_STATE.NONE);

      this.toggleClass(`${statusPrefix}-delivered-to-all`, deliveryStatus === Layer.Constants.RECIPIENT_STATE.ALL);
      this.toggleClass(`${statusPrefix}-delivered-to-some`, deliveryStatus === Layer.Constants.RECIPIENT_STATE.SOME);
      this.toggleClass(`${statusPrefix}-delivered-to-none`, deliveryStatus === Layer.Constants.RECIPIENT_STATE.NONE);

      this.toggleClass(`${statusPrefix}-pending`, this.properties.item.isSaving());
    },

    /**
     * The parent component sets the _contentTag property, and now its time to use it.
     *
     * Use that tagName to create a DOM Node to render the MessageParts.
     *
     * @method
     * @private
     */
    _applyContentTag() {
      const messageHandler = document.createElement(this._contentTag);
      messageHandler.parentContainer = this;
      messageHandler.message = this.item;
      this.nodes.messageHandler = messageHandler;

      this.nodes.content.appendChild(messageHandler);
      if (messageHandler.style.height) {
        this.nodes.content.style.height = messageHandler.style.height;
      }
    },
  },
};
