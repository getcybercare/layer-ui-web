/**
 * A List Mixin that add a `selectedId` property to a List.
 *
 * Also listens for `click` events to update the `selectedId` property,
 * and triggers selection events.
 *
 * @class layerUI.mixins.ListSelection
 */
module.exports = {
  properties: {

    /**
     * Get/Set the selected Conversation by ID.
     *
     * ```javascript
     * list.selectedId = myConversation.id;
     * ```
     *
     * Or if using a templating engine:
     *
     * ```html
     * <layer-conversations-list selected-id={{selectedConversation.id}}></layer-conversations-list>
     * ```
     *
     * The above code will set the selected Conversation and render the conversation as selected.
     *
     * @property {String} [selectedId='']
     */
    selectedId: {
      set(newId, oldId) {
        if (oldId) {
          const node = this.querySelector('#' + this._getItemId(oldId));
          if (node) node.isSelected = false;
        }

        if (newId) {
          const node = this.querySelector('#' + this._getItemId(newId));
          if (node) node.isSelected = true;
        }
      },
    },
  },
  methods: {
    onCreate() {
      this.addEventListener('click', this._onClick.bind(this));
    },

    /**
     * User has selected something in the Conversation List that didn't handle that click event.
     *
     * Find the Conversation Item selected and generate a `layer-conversation-selected` event.
     * Click events do NOT bubble up; they must either be handled by the layerUI.components.ConversationsListPanel.Item.Conversation or
     * they are treated as a selection event.
     *
     * Listening to `layer-conversation-selected` you will still receive the original click event
     * in case you wish to process that futher; see `originalEvent` below.
     *
     * Calling `evt.preventDefault()` will prevent selection from occuring.
     *
     * @method _onClick
     * @private
     * @param {Event} evt
     */
    _onClick(evt) {
      let target = evt.target;
      while (target && target !== this && !target._isListItem) {
        target = target.parentNode;
      }

      if (target.item && target._isListItem) {
        evt.preventDefault();
        evt.stopPropagation();
        if (this.trigger(this._selectedItemEventName, { item: target.item, originalEvent: evt })) {
          this.selectedId = target.item.id;
        }
      }
      this.onClick(evt);
    },

    /**
     * MIXIN HOOK: Each time a Conversation is Clicked, you can hook into that by providing an onClick method.
     *
     * Note that prior to this call, `evt.preventDefault()` and `evt.stopPropagation()` were already called.
     *
     * @method onClick
     * @param {Event} evt
     */
    onClick(evt) {
      // No-op
    },

    /*
     * Any time an item is generated, see if it needs to be set as selected.
     */
    onGenerateListItem(widget) {
      if (widget.item.id === this.selectedId) widget.isSelected = true;
    },
  },
};
