/**
 * The Layer Presence widget renders an icon representing a user's status of Available, Away, Busy or Offline.
 *
 * The simplest way to customize this widget is to replace it with your own implementation of the `<layer-avatar />` tag.
 *
 * ```javascript
 * layerUI.registerComponent('layer-presence', {
 *    properties: {
 *      user: {
 *        set: function(value) {
 *           this.onRender();
 *           if (value) value.on('identity:changes', this.onRerender, this);
 *        }
 *      }
 *    },
 *    methods: {
 *      onRender: function() {
 *        this.onRerender();
 *      },
 *      onRerender: function() {
 *        this.className = 'my-presence-' + this.user.presence.status;
 *      },
 *    }
 * });
 *
 * // Call init after custom components are defined
 * layerUI.init({
 *   appId:  'layer:///apps/staging/UUID'
 * });
 * ```
 *
 * @class layerUI.components.subcomponents.Presence
 * @extends layerUI.components.Component
 */
import Layer from 'layer-websdk';
import { registerComponent } from '../../../components/component';
import MainComponent from '../../../mixins/main-component';

registerComponent('layer-presence', {
  mixins: [MainComponent],
  events: ['layer-presence-click'],
  properties: {

    /**
     * User whose status is represented here
     *
     * Typically this only has one user represented with a layer.Identity.
     *
     * @property {layer.Identity}
     */
    item: {
      set(value) {
        this.onRender();
        if (value && !(value instanceof Layer.Identity)) {
          const client = Layer.Client.getClient(value.clientId);
          if (client) {
            value = this.properties.item = client.getIdentity(value.id);
          }
        }
        if (value) value.on('identities:change', this.onRerender, this);
      },
    },
  },
  methods: {
    onCreate() {
      this.addEventListener('click', this.onClick.bind(this));
    },

    /**
     * Render new user.
     *
     * @method
     */
    onRender() {
      this.onRerender();
    },

    /**
     * Render's changes in user status
     *
     * @method
     */
    onRerender(user) {
      this.className = `layer-presence-${this.item ? this.item.presence.status : 'unknown'}`;
    },

    /**
     * The user clicked on this widget.
     *
     * Typically, you wouldn't respond to these, but if the user clicked on their OWN presence,
     * you may prompt them to change their status
     *
     * @method
     * @param {Event} evt
     */
    onClick(evt) {
      evt.preventDefault();
      this.trigger('layer-presence-click', { item: this.item });
    },
  },
});

