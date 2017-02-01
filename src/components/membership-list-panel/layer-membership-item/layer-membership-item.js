/**
 * The Layer Membership Item represents a single user within a Membership List.
 *
 * This widget could be used to represent a User elsewhere, in places where a `<layer-avatar />` is insufficient.
 *
 * This widget includes a checkbox for selection.
 *
 * @class layerUI.components.MembershipListPanel.Item
 * @mixin layerUI.mixins.ListItem
 * @extends layerUI.components.Component
 */
import ListItem from '../../../mixins/list-item';
import ListItemSelection from '../../../mixins/list-item-selection';
import { registerComponent } from '../../component';
import '../../subcomponents/layer-avatar/layer-avatar';

registerComponent('layer-membership-item', {
  mixins: [ListItem, ListItemSelection],
  properties: {

  },
  methods: {

    /**
     * Render/rerender the user, showing the avatar and user's name.
     *
     * @method onRender
     * @private
     */
    onRender() {
      this.onRerender();
    },

    /**
     * Render/rerender changes to the Identity object or Membership object.
     *
     * @method onRerender
     * @private
     */
    onRerender() {
      this.nodes.title.innerHTML = this.item.identity.displayName;
    },


    /**
     * Run a filter on this item, and hide it if it doesn't match the filter.
     *
     * @method _runFilter
     * @param {String|Regex|Function} filter
     */
    _runFilter(filter) {
      const identity = this.properties.item.identity;
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


