/**
 * The Layer Plain Text MessageHandler renders a single text/plain message part.
 *
 * See layerUI.registerTextHandler for details on adding new text processing capabilities.
 *
 * @class layerUI.handlers.message.TextPlain
 * @extends layerUI.components.Component
 */
import layerUI from '../../base';
import LUIComponent from '../../components/component';

LUIComponent('layer-message-text-plain', {
  properties: {

    /**
     * The Message property provides the MessageParts we are going to render.
     *
     * @property {layer.Message}
     */
    message: {
      set(value) {
        this.render();
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
     * Replaces any html tags with escaped html tags so that the recipient
     * sees tags rather than rendered html.
     *
     * @method
     * @private
     */
    fixHtml(body) {
      body = body.replace(/</g, '&lt;');
      body = body.replace(/>/g, '&gt;');
      return body;
    },

    /**
     * Format the text and render it.
     *
     * @method
     * @private
     */
    render() {
      if (!layerUI.textHandlersOrdered) this.setupOrderedHandlers();

      const text = this.message.parts[0].body;
      const textData = {
        text: this.fixHtml(text),
        afterText: [],
      };

      layerUI.textHandlersOrdered.forEach(handler => handler(textData));

      const startDiv = '<div class="layer-message-text-plain-after-text">';
      this.innerHTML = textData.text +
        (textData.afterText.length ? startDiv + textData.afterText.join('</div>' + startDiv) + '</div>' : '');
    },

    setupOrderedHandlers() {
      layerUI.textHandlersOrdered = Object.keys(layerUI.textHandlers).filter(handlerName =>
        layerUI.textHandlers[handlerName].enabled)
      .map(handlerName => layerUI.textHandlers[handlerName])
      .sort((a, b) => {
        if (a.order > b.order) return 1;
        if (b.order > a.order) return -1;
        return 0;
      })
      .map(handlerObj => handlerObj.handler);
    },
  },
});

// Handle any text/plain Message
layerUI.registerMessageHandler({
  tagName: 'layer-message-text-plain',
  label: 'Text',
  handlesMessage(message, container) {
    return message.parts.length === 1 && message.parts[0].mimeType === 'text/plain';
  },
});

