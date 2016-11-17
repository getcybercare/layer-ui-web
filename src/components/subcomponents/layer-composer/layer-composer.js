/**
 * The Layer Composer widget provides the text area for the layerUI.Conversation widget.
 *
 * It provides a self-resizing text area that resizes to the size of the entered text, and sends typing indicators as the user types.
 *
 * Note that this widget is not designed to be used outside of the LayerUI.Conversation widget; to simplify such use cases, we'd want to accept
 * `appId` and `conversationId` instead of `client` and `conversation`.
 *
 * TODO: Support file attachments
 * TODO: Refactor out a resizable-text-area Component
 *
 * @class layerUI.components.subcomponents.Composer
 * @extends layerUI.components.Component
 */
import layerUI, { layer as LayerAPI } from '../../../base';
import LUIComponent from '../../../components/component';

const ENTER = 13;
const TAB = 9;

LUIComponent('layer-composer', {
  properties: {

    /**
     * What Conversation are we sending messages and typing indicators to?
     *
     * @property {layer.Conversation}
     */
    conversation: {
      set(value) {
        this.client = value.getClient();
        this.updateTypingIndicator();
      },
    },

    /**
     * The Client are we using to communicate.
     *
     * @property {layer.Client}
     */
    client: {
      set(value) {
        if (!this.nodes.input) console.error('NO INPUT FOR COMPOSER');
        this.properties.typingListener = this.properties.client.createTypingListener(this.nodes.input);
        this.updateTypingIndicator();
      },
    },

    /**
     * Custom buttons to put in the panel.
     *
     * @property {HTMLElement[]}
     */
    buttons: {
      set(value) {
        this.nodes.buttonPanel.buttons = value;
      },
    },

    /**
     * The text shown in the editor; editor value.
     *
     * @property {String}
     */
    value: {
      set(value) {
        this.nodes.input.value = value;
        this.resizeNode();
      },
      get() {
        return this.nodes.input.value;
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
      this.classList.add('layer-composer-one-line-of-text');

      // Setting this in the template causes errors in IE 11.
      this.nodes.input.placeholder = 'Enter a message';
      this.nodes.input.addEventListener('keydown', this._onKeyDown.bind(this));

      // Event handlers
      this.addEventListener('layer-file-selected', this.handleAttachments.bind(this));
    },

    /**
     * Focus on the textarea.
     *
     * @method
     */
    focus() {
      this.nodes.input.focus();
    },

    /**
     * Update the Conversation that our Typing Listener is using to send typing indicator events.
     *
     * @method
     * @private
     */
    updateTypingIndicator() {
      this.properties.typingListener.setConversation(this.conversation);
    },

    /**
     * Send the Message that the user has typed in.
     *
     * @method
     * @param {layer.MessagePart[]} optionalParts
     */
    send(optionalParts) {
      let parts = [];
      if (optionalParts) {
        parts = optionalParts;
      } else if (this.nodes.input.value) {
        parts.push(new LayerAPI.MessagePart({
          type: 'text/plain',
          body: this.nodes.input.value,
        }));
        this.nodes.input.value = '';
      }

      if (parts.length === 0) return;

      const message = this.conversation.createMessage({ parts });

      /**
       * This event is triggered before any Message is sent; used to control notifications and override sending.
       *
       * You can use this event to control the notifications by modifying the `evt.detail.notification` object.
       * Note that you should modify the object but not try to replace the object.
       *
       * ```javascript
       * document.body.addEventListener('layer-send-message', function(evt) {
       *   var message = evt.detail.message;
       *   var notification = evt.detail.notification;
       *   notification.title = 'You have a new Message from ' + message.sender.displayName;
       *   notification.sound = 'sneeze.aiff';
       *   if (message.parts[0].mimeType === 'text/plain') {
       *     notification.text = evt.detail.message.parts[0].body;
       *   } else {
       *     notification.text = 'You have received a file';
       *   }
       * }
       * ```
       *
       * You can also use this event to provide your own logic for sending the Message.
       *
       * ```javascript
       * document.body.addEventListener('layer-send-message', function(evt) {
       *   evt.preventDefault();
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
       * @param {String} evt.detail.notification.text
       * @param {String} evt.detail.notification.title
       * @param {String} evt.detail.notification.sound
       */
      const textPart = message.parts.filter(part => part.mimeType === 'text/plain');
      const notification = {
        text: textPart ? textPart.body : 'File received',
        title: `New Message from ${message.sender.displayName}`,
      };
      if (this.trigger('layer-send-message', { message, notification })) {
        message.send(notification);
      }
    },

    /**
     * On ENTER call `send()`; on TAB enter some spacing rather than leaving the text area.
     *
     * @method
     * @private
     */
    _onKeyDown(event) {
      if (event.keyCode === ENTER) {
        if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault();
          this.send();
        } else {
          event.target.value += '\n';
        }
      } else if (!layerUI.settings.disableTabAsWhiteSpace && event.keyCode === TAB && !event.shiftKey) {
        event.preventDefault();
        event.target.value += '\t  ';
      }
      this.resizeNode();
    },

    /**
     * On any change in value, recalculate our height and lineHeight to fit the contents.
     *
     * @method
     * @private
     */
    resizeNode() {
      setTimeout(() => {
        this.nodes.resizer.innerHTML = this.nodes.input.value.replace(/\n/g, '<br/>') || '&nbsp;';
        this.nodes.lineHeighter.innerHTML = this.nodes.input.value.replace(/\n/g, '<br/>') || '&nbsp;';
        const willBeOneLine = this.nodes.resizer.clientHeight - this.nodes.lineHeighter.clientHeight < 10;

        // Prevent scrollbar flickering in and then out
        if (willBeOneLine) {
          this.nodes.input.style.overflow = 'hidden';
          setTimeout(() => { this.nodes.input.style.overflow = ''; }, 1);
        }
        this.classList[willBeOneLine ? 'add' : 'remove']('layer-composer-one-line-of-text');
      }, 10);
    },

    /**
     * If a file event was detected, send some attachments.
     *
     * @method
     * @private
     */
    handleAttachments(evt) {
      this.send(evt.detail.parts);
    },
  },
});

