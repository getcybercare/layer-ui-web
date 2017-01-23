/**
 * A List Item Mixin that add an `isSelected` property to a List.
 *
 * Also listens for `click` events to update the `selectedId` property,
 * and triggers `layer-selected-modelName-change` events.
 *
 * @class layerUI.mixins.ListSelection
 */

module.exports = {
  properties: {
    isSelected: {
      type: Boolean,
      set(value) {
        this.toggleClass('layer-selected-item', value);
      },
    },
  },
  methods: {
    /**
     * MIXIN HOOK: Each time a an item's selection state changes, this will be called.
     *
     * @method onSelection
     */
    onSelection(evt) {
      // No-op
    },
  },
};
