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
 * @class layerUI.components.MessagesListPanel.Item
 * @mixins layerUI.mixins.ListItem
 * @extends layerUI.components.Component
 */
import { layer as LayerAPI } from '../../../base';
import LUIComponent from '../../../components/component';
import ListItem from '../../../mixins/list-item';

LUIComponent('layer-message-item', {
  mixins: [ListItem],
  properties: {

    // Every List Item has an item property, here it represents the Conversation to render
    item: {
      set(newMessage, oldMessage) {
        // Disconnect from any previous Message we were rendering; not currently used.
        if (oldMessage) {
          oldMessage.off(null, null, this);
          if (oldMessage.sender.sessionOwner) {
            this.removeClass('layer-message-item-sent');
          } else {
            this.removeClass('layer-message-item-received');
          }
        }

        if (newMessage) {
          // Any changes to the Message should trigger a rerender
          newMessage.on('messages:change', this._rerender, this);

          // Setup the proper sent/received class
          if (newMessage.sender.sessionOwner) {
            this.addClass('layer-message-item-sent');
          } else {
            this.addClass('layer-message-item-received');
          }
          this._render();
        }
      },
    },

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
    /**
     * Constructor.
     *
     * @method _created
     * @private
     */
    _created() {

    },

    /**
     * Initial rendering of static properties of the Message (sender)
     *
     * Rendering of MessageParts is handled via layerUI.MessageItem.setContentTag().
     *
     * @method
     * @private
     */
    _render() {
      if (!this.properties.item) return;
      this.innerHTML = '';
      try {

        // Select and apply the correct template
        const isOwner = this.properties.item.sender.sessionOwner;
        let template = this.getTemplate(isOwner ? 'layer-message-item-sent' : 'layer-message-item-received');
        if (!template) {
          template = this.getTemplate();
        }
        const clone = document.importNode(template.content, true);
        this.appendChild(clone);
        this.setupDomNodes();
        this.innerNode = this.nodes.innerNode;

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
        if (this.nodes.status) {
          if (this.messageStatusRenderer) this.nodes.status.messageStatusRenderer = this.messageStatusRenderer;
          this.nodes.status.message = this.item;
        }

        // Setup the layer-delete
        if (this.nodes.delete) {
          this.nodes.delete.item = this.properties.item;
          this.nodes.delete.enabled = this.getDeleteEnabled ? this.getDeleteEnabled(this.properties.item) : true;
        }

        // Generate the renderer for this Message's MessageParts.
        this._applyContentTag();

        // Render all mutable data
        this._rerender();
      } catch (err) {
        console.error('layer-message-item.render(): ', err);
      }
    },

    /**
     * Render dynamic properties of the Message (message status)
     *
     * @method
     * @private
     */
    _rerender() {
      const readStatus = this.properties.item.readStatus;
      const deliveryStatus = this.properties.item.deliveryStatus;
      const statusPrefix = 'layer-message-status';
      this.toggleClass('layer-unread-message', !this.properties.item.isRead);
      this.toggleClass(`${statusPrefix}-read-by-all`, readStatus === LayerAPI.Constants.RECIPIENT_STATE.ALL);
      this.toggleClass(`${statusPrefix}-read-by-some`, readStatus === LayerAPI.Constants.RECIPIENT_STATE.SOME);
      this.toggleClass(`${statusPrefix}-read-by-none`, readStatus === LayerAPI.Constants.RECIPIENT_STATE.NONE);

      this.toggleClass(`${statusPrefix}-delivered-to-all`, deliveryStatus === LayerAPI.Constants.RECIPIENT_STATE.ALL);
      this.toggleClass(`${statusPrefix}-delivered-to-some`, deliveryStatus === LayerAPI.Constants.RECIPIENT_STATE.SOME);
      this.toggleClass(`${statusPrefix}-delivered-to-none`, deliveryStatus === LayerAPI.Constants.RECIPIENT_STATE.NONE);

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

      this.nodes.content.appendChild(messageHandler);
      if (messageHandler.style.height) {
        this.nodes.content.style.height = messageHandler.style.height;
      }
    },
  },
});
