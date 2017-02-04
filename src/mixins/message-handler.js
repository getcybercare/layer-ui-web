/**
 * A Message Handler Mixin that provides common properties and behaviors for implementing a Card.
 *
 * ```
 * import MessageHandler from 'layer-ui-web/lib/mixins/message-handler';
 * layerUI.registerComponent('sample-message-handler', {
 *     mixins: [MessageHandler],
 *     methods: {
 *         onCreate() {
 *            // If using a template, your dom nodes will already be setup,
 *            // and you can wire up UI event handlers here.
 *            // Do any DOM creation/manipulation that does not depend upon the message here.
 *         },
 *
 *         // Your onRender method is called once the message property is set.
 *         onRender() {
 *            // DOM Manipulation Here
 *         },
 *
 *         // Your onRerender method is called by onRender, and called any time the Message
 *         // changes; all dynamic rendering goes in onRerender.
 *         onRerender() {
 *             // DOM Manipulation Here
 *         }
 *     }
 * });
 *
 * // If a template is needed, register a template for your component using a String;
 * // Note that layer-id will allow you to access these nodes directly as this.nodes.description
 * // or this.nodes.checkox
 * layerUI.buildAndRegisterTemplate('sample-message-handler', '<label layer-id="label">Approve Purchase</label>' +
 *    '<input type="checkbox" layer-id="checkbox" /><div layer-id="description"></div>');
 *
 * // OR Register a template for your component using a <template /> DOM node:
 * layerUI.registerTemplate('sample-message-handler', myTemplateNode);
 * ```
 *
 * @class layerUI.mixins.MessageHandler
 */
import { registerComponent } from '../components/component';

module.exports = {
  properties: {
    /**
     * The layer.Message to be rendered.
     *
     * @property {layer.Message} message
     */
    message: {
      set() {
        this.onRender();
        this.message.on('messages:change', this.onRerender, this);
      },
    },
  },
  methods: {

    /**
     * Your onRender method is called once the message property is set.
     *
     * Any call to onRender will also call onRerender
     * which may handle some more dynamic rendering.
     *
     * @method onRender
     */
    onRender: {
      conditional: function onCanRender() {
        return Boolean(this.message && !this.message.isDestroyed);
      },
      mode: registerComponent.MODES.AFTER,
      value: function onRender() {
        this.onRerender();
      },
    },

    /**
     * Your onRerender method handles any dynamic rendering.
     *
     * It should be called when:
     *
     * * Your layer.Message is first rendered
     * * Your layer.Message triggers any `messages:change` events
     * * Any outside events that influence rendering occur (though this is in your control)
     *
     * @method onRerender
     */
    onRerender() {},
  },
};
