/**
 * The Layer Composer widget provides the textarea for layerUI.components.ConversationPanel.
 *
 * It provides a self-resizing text area that resizes to the size of the entered text, and sends typing indicators as the user types.
 *
 * Special behaviors to know about:
 *
 * * CSS Class `layer-composer-one-line-of-text`: If there is only a single line's worth of text, then this CSS class is applied to
 *   help center the text
 * * Event `layer-file-selected`: This widget listens for this event, and if it receives it, uses that event to retrieve a file to send in
 *   the Conversation.  Event comes from layerUI.components.subcomponents.FileUploadButton or from your custom widgets.
 * * Keyboard Handling: ENTER: Sends message unless its accompanied by a modifier key.  TAB: Enters a \t character unless you
 *   set `layerUI.settings.disableTabAsWhiteSpace` to true
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
     * Specify which Conversation we are sending messages and typing indicators to.
     *
     * @property {layer.Conversation} [conversation=null]
     */
    conversation: {
      set(value) {
        this.client = value.getClient();
        this._setTypingListenerConversation();
      },
    },

    /**
     * The Client are we using to communicate.
     *
     * @property {layer.Client} [client=null]
     */
    client: {
      set(value) {
        if (!this.nodes.input) console.error('NO INPUT FOR COMPOSER');
        this.properties.typingListener = this.properties.client.createTypingListener(this.nodes.input);
        this._setTypingListenerConversation();
      },
    },

    /**
     * Custom buttons to put in the panel.
     *
     * @property {HTMLElement[]} [buttons=[]]
     */
    buttons: {
      set(value) {
        this.nodes.buttonPanel.buttons = value;
      },
    },

    /**
     * The text shown in the editor; this is the editor's value.
     *
     * @property {String} [value='']
     */
    value: {
      set(value) {
        this.nodes.input.value = value;
        this._resizeNode();
      },
      get() {
        return this.nodes.input.value;
      },
    },
    /**
     * The text shown in the editor; this is the editor's placeholder.
     *
     * @property {String} [placeholder='']
     */
    placeholder: {
      set(value) {
        this.nodes.input.placeholder = value;
        this._resizeNode();
      },
      get() {
        return this.nodes.input.placeholder;
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
      this.properties.buttons = [];

      // Setting this in the template causes errors in IE 11.
      this.nodes.input.placeholder = 'Enter a message';
      this.nodes.input.addEventListener('keydown', this._onKeyDown.bind(this));

      // Event handlers
      this.addEventListener('layer-file-selected', this._handleAttachments.bind(this));
    },

    /**
     * Focus on the textarea so keyboard actions enter text into it.
     *
     * @method
     */
    focus() {
      this.nodes.input.focus();
    },

    /**
     * Update the Typing Listener's `conversation` property so that it reports typing activity
     * to the correct Conversation.
     *
     * @method
     * @private
     */
    _setTypingListenerConversation() {
      this.properties.typingListener.setConversation(this.conversation);
    },

    /**
     * Send the Message that the user has typed in.
     *
     * This is called automatically when the user hits `ENTER`.
     *
     * This can also be called directly:
     *
     * ```
     * widget.send(); // send the current text in the textarea
     * ```
     *
     * ```
     * widget.send(parts); // send custom message parts but NOT the text in the textarea
     * ```
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
      this._resizeNode();
    },

    /**
     * On any change in value, recalculate our height and lineHeight to fit the input text.
     *
     * @method
     * @private
     */
    _resizeNode() {
      setTimeout(() => {
        this.nodes.resizer.innerHTML = this.nodes.input.value.replace(/\n/g, '<br/>') || '&nbsp;';
        this.nodes.lineHeighter.innerHTML = this.nodes.input.value.replace(/\n/g, '<br/>') || '&nbsp;';
        const willBeOneLine = this.nodes.resizer.clientHeight - this.nodes.lineHeighter.clientHeight < 10;

        // Prevent scrollbar flickering in and then out
        if (willBeOneLine) {
          this.nodes.input.style.overflow = 'hidden';
          setTimeout(() => { this.nodes.input.style.overflow = ''; }, 1);
        }

        // Note that classList.toggle doesn't work right in IE11
        this.classList[willBeOneLine ? 'add' : 'remove']('layer-composer-one-line-of-text');
      }, 10);
    },

    /**
     * If a file event was detected, send some attachments.
     *
     * @method
     * @private
     */
    _handleAttachments(evt) {
      this.send(evt.detail.parts);
    },
  },
});

