/**
 * Provides a Button Panel for adding custom actions to the layerUI.Composer panel.
 *
 * You can populate this button panel using the layerUI.components.ConversationPanel.composeButtons property.
 *
 * Alternatively, you can replace this by defining a custom `layer-compose-button-panel` to make the resulting component entirely yours:
 *
 * ```
 * layerUI.init({
 *   layer: window.layer,
 *   appId:  'layer:///apps/staging/UUID',
 *   customComponents: ['layer-compose-button-panel']
 * });
 *
 * document.registerElement('layer-compose-button-panel', {
 *   prototype: Object.create(HTMLElement.prototype, {
 *     createdCallback: {
 *       value: function() {
 *         this.innerHTML = "<button>Click me!</button>";
 *       }
 *     }
 *   })
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.ComposeButtonPanel
 * @extends layerUI.components.Component
 */
import LUIComponent from '../../../components/component';

LUIComponent('layer-compose-button-panel', {
  properties: {
    /**
     * Custom buttons to put in the panel.
     *
     * @property {HTMLElement[]} [buttons=[]]
     */
    buttons: {
      set(value) {
        this._rerender();
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
      this.properties.buttons = [];
    },

    /**
     * Render any custom buttons provided via the `buttons` property.
     *
     * @method
     * @private
     */
    _rerender() {
      this.innerHTML = '';
      const fragment = document.createDocumentFragment();
      this.buttons.forEach(button => fragment.appendChild(button));
      this.appendChild(fragment);
    },
  },
});

