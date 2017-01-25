/**
 * The Layer User Item represents a single user within a User List.
 *
 * This widget could be used to represent a User elsewhere, in places where a `<layer-avatar />` is insufficient.
 *
 * This widget includes a checkbox for selection.
 *
 * @class layerUI.components.IdentitiesListPanel.Item
 * @mixin layerUI.mixins.ListItem
 * @extends layerUI.components.Component
 */
import * as Layer from 'layer-websdk';
import { registerComponent } from '../../../components/component';
import ListItem from '../../../mixins/list-item';
import '../../subcomponents/layer-avatar/layer-avatar';

registerComponent('layer-identity-item', {
  mixins: [ListItem],
  properties: {

    /**
     * Is this user item currently selected?
     *
     * Setting this to true will set the checkbox to checked, and add a
     * `layer-identity-item-selected` css class.
     *
     * @property {Boolean} [selected=false]
     */
    selected: {
      type: Boolean,
      set(value) {
        if (this.nodes.checkbox) this.nodes.checkbox.checked = value;
        this.innerNode.classList[value ? 'add' : 'remove']('layer-identity-item-selected');
      },
      get() {
        return this.nodes.checkbox ? this.nodes.checkbox.checked : Boolean(this.properties.selected);
      },
    },
  },
  methods: {
    /**
     * Constructor.
     *
     * @method onCreate
     * @private
     */
    onCreate() {
      if (!this.id) this.id = Layer.Util.generateUUID();
      this.nodes.checkbox.addEventListener('change', this._onChange.bind(this));
      this.nodes.checkbox.id = `${this.id}-checkbox`;
      this.nodes.title.setAttribute('for', this.nodes.checkbox.id);
    },

    /**
     * If the checkbox state changes, make sure that the class is updated.
     *
     * If the custom event is canceled, roll back the change.
     *
     * @method _onChange
     * @param {Event} evt
     * @private
     */
    _onChange(evt) {
      evt.stopPropagation();
      const checked = this.selected;
      const identity = this.item;

      // Trigger the event and see if evt.preventDefault() was called
      const customEventResult = this.trigger(`layer-identity-item-${checked ? 'selected' : 'deselected'}`, { item: identity });

      if (customEventResult) {
        this.innerNode.classList[checked ? 'add' : 'remove']('layer-identity-item-selected');
      } else {
        this.selected = !checked;
      }
      this.onSelection(evt);
    },

    /**
     * MIXIN HOOK: Each time a an item's selection state changes, this will be called.
     *
     * @method onSelection
     */
    onSelection(evt) {
      // No-op
    },

    /**
     * Render/rerender the user, showing the avatar and user's name.
     *
     * @method _render
     * @private
     */
    onRender() {
      this.onRerender();
    },

    /**
     * Update the rendering of the avatar/username
     *
     * @method _render
     * @private
     */
    onRerender() {
      this.nodes.avatar.users = [this.item];
      this.nodes.title.innerHTML = this.item.displayName;
      this.toggleClass('layer-identity-item-empty', !this.item.displayName);
    },

    /**
     * Run a filter on this item, and hide it if it doesn't match the filter.
     *
     * @method _runFilter
     * @param {String|Regex|Function} filter
     */
    _runFilter(filter) {
      const identity = this.properties.item;
      let match = false;
      if (!filter) {
        match = true;
      } else if (filter instanceof RegExp) {
        match = filter.test(identity.displayName) || filter.test(identity.firstName) || filter.test(identity.lastName) || filter.test(identity.emailAddress);
      } else if (typeof filter === 'function') {
        match = filter(identity);
      } else {
        filter = filter.toLowerCase();
        match =
          identity.displayName.toLowerCase().indexOf(filter) !== -1 ||
          identity.firstName.toLowerCase().indexOf(filter) !== -1 ||
          identity.lastName.toLowerCase().indexOf(filter) !== -1 ||
          identity.emailAddress.toLowerCase().indexOf(filter) !== -1;
      }
      this.classList[match ? 'remove' : 'add']('layer-item-filtered');
    },
  },
});


