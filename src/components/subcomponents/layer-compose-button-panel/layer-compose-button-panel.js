/**
 * Provides a Button Panel for adding custom actions to the layerUI.Composer panel.
 *
 * You can populate this button panel by passing in a `composeButtons` property into layerUI.Conversation.
 *
 * Alternatively, you can replace this by defining a custom `layer-compose-button-panel` to make the resulting component entirely yours:
 *
 * ```
 * <script>
 * window.layerUI = {customComponents: ['layer-compose-button-panel']};
 * document.registerElement('layer-compose-button-panel', {
 *   prototype: Object.create(HTMLElement.prototype, {
 *     createdCallback: {
 *       this.innerHTML = "<button>Click me!</button>";
 *     }
 *   })
 * });
 * </script>
 * <script src='layer-websdkui-standard.js'></script>
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
     * @property {HTMLElement[]}
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

