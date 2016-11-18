/**
 * The Layer User List renders a pagable list of layer.Identity objects, and allows the user to select people to talk with.
 *
 * This is typically used for creating/updating Conversation participant lists.
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-identities-list></layer-identities-list>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var identitylist = document.createElement('layer-identities-list');
 * ```
 *
 * And then its properties can be set as:
 *
 * ```javascript
 * var identityList = document.querySelector('layer-identities-list');
 * identityList.selectedIdentities = [identity3, identity6];
 * identityList.onIdentitySelected = identityList.onIdentityDeselected = function(evt) {
 *    log("The new selected users are: ", identityList.selectedIdentities);
 * }
 * ```
 *
 * ## Events
 *
 * Events listed here come from either this component, or its subcomponents.
 *
 * * {@link layerUI.components.IdentitiesListPanel.List#layer-identity-deselected layer-identity-deselected}: User has clicked to unselect an Identity
 * * {@link layerUI.components.IdentitiesListPanel.List#layer-identity-selected layer-identity-selected}: User has clicked to select an Identity
 *
 * @class layerUI.components.IdentitiesListPanel.List
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.MainComponent
 */
import { layer as LayerAPI } from '../../../base';
import LUIComponent from '../../../components/component';
import List from '../../../mixins/list';
import MainComponent from '../../../mixins/main-component';

LUIComponent('layer-identities-list', {
  mixins: [List, MainComponent],


  /**
   * The user has clicked to select an Identity in the Identities List.
   *
   * ```javascript
   *    identityList.onIdentitySelected = function(evt) {
   *      var identityAdded = evt.detail.identity;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityAdded is not yet in selectedIdentities so that you may prevent it from being added.
   *      evt.preventDefault();
   *    };
   * ```
   *
   *  OR
   *
   * ```javascript
   *    document.body.addEventListener('layer-identity-selected', function(evt) {
   *      var identityAdded = evt.detail.identity;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityAdded is not yet in selectedIdentities so that you may prevent it from being added.
   *      evt.preventDefault();
   *    });
   * ```
   *
   * @event layer-identity-selected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity} evt.detail.identity
   */
  /**
   * A identity selection change has occurred
   *
   * See the {@link layerUI.components.IdentitiesListPanel.List#layer-identity-selected layer-identity-selected} event for more detail.
   *
   * @property {Function} onIdentitySelected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity} evt.detail.identity
   */

  /**
   * The user has clicked to deselect a identity in the identities list.
   *
   *    identityList.onIdentityDeselected = function(evt) {
   *      var identityRemoved = evt.detail.identity;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityRemoved is still in selectedIdentities so that you may prevent it from being removed.
   *      evt.preventDefault();
   *    };
   *
   *  OR
   *
   *    document.body.addEventListener('layer-identity-deselected', function(evt) {
   *      var identityRemoved = evt.detail.identity;
   *      var selectedIdentities = evt.target.selectedIdentities;
   *
   *      // To prevent the UI from proceding to add the identity to the selectedIdentities:
   *      // Note that identityRemoved is still in selectedIdentities so that you may prevent it from being removed.
   *      evt.preventDefault();
   *    });
   *
   * @event layer-identity-deselected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity} evt.detail.identity
   */
  /**
   * A identity selection change has occurred
   *
   * See the {@link layerUI.components.IdentitiesListPanel.List#layer-identity-deselected layer-identity-deselected} event for more detail.
   *
   * @property {Function} onIdentityDeselected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Identity} evt.detail.identity
   */

  events: ['layer-identity-selected', 'layer-identity-deselected'],
  properties: {

    /**
     * Array of layer.Identity objects representing the identities who should be rendered as Selected.
     *
     * This property can be used both get and set the selected identities; however, if setting you should not be manipulating
     * the existing array, but rather setting a new array:
     *
     * Do NOT do this:
     *
     * ```javascript
     * list.selectedIdentities.push(identity1); // DO NOT DO THIS
     * ```
     *
     * Instead, Please do this:
     *
     * ```javascript
     * var newList = list.selectedIdentities.concat([]);
     * newList.push(identity1);
     * list.selectedIdentities = newList;
     * ```
     *
     * @property {layer.Identity[]} [selectedIdentities=[]]
     */
    selectedIdentities: {
      set(value) {
        if (!value) value = [];
        if (!Array.isArray(value)) return;
        if (!value) value = [];
        this.properties.selectedIdentities = value.map((identity) => {
          if (!(identity instanceof LayerAPI.Identity)) return this.properties.client.getIdentity(identity.id);
          return identity;
        });
        this._renderSelection();
      },
    },

    /**
     * String, Regular Expression or Function for filtering Conversations.
     *
     * Defaults to filtering by `conversation.metadata.conversationName`, as well as `displayName`, `firstName`, `lastName` and `emailAddress`
     * of every participant.  Provide your own Function to change this behavior
     *
     * @property {String|RegEx|Function} [filter='']
     */
    filter: {
      set(value) {
        this._runFilter();
      },
    },

    /**
     * The model to generate a Query for if a Query is not provided.
     *
     * @readonly
     * @private
     * @property {String} [_queryModel=layer.Query.Identity]
     */
    _queryModel: {
      value: LayerAPI.Query.Identity,
    },
  },
  methods: {

    /**
     * Generate a DOM ID for each Identity ID
     *
     * @method
     * @private
     * @param {String} id
     */
    _getItemId(identity) {
      return `identities-list-item-${this.id}-${identity.internalId}`;
    },

    /**
     * Constructor.
     *
     * @method _created
     * @private
     */
    _created() {
      if (!this.id) this.id = LayerAPI.Util.generateUUID();
      this.properties.selectedIdentities = [];

      this._render();
      this.addEventListener('layer-identity-item-selected', this._handleIdentitySelect.bind(this));
      this.addEventListener('layer-identity-item-deselected', this._handleIdentityDeselect.bind(this));
    },

    /**
     * Handle a user Selection event triggered by a layerUI.components.IdentitiesListPanel.Item.
     *
     * Adds the Identity to the selectedIdentities array.
     *
     * @method _handleIdentitySelect
     * @private
     * @param {Event} evt
     */
    _handleIdentitySelect(evt) {
      evt.stopPropagation();
      const identity = evt.detail.identity;
      const index = this.selectedIdentities.indexOf(identity);

      // If the item is not in our selectedIdentities array, add it
      if (index === -1) {
        // If app calls prevent default, then don't add the identity to our selectedIdentities list, just call preventDefault on the original event.
        if (this.trigger('layer-identity-selected', { identity })) {
          this.selectedIdentities.push(identity);
        } else {
          evt.preventDefault();
        }
      }
    },

    /**
     * Handle a user Deselection event triggered by a layerUI.components.IdentitiesListPanel.Item
     *
     * Removes the identity from the selectedIdentities array.
     *
     * @method _handleIdentityDeselect
     * @private
     * @param {Event} evt
     */
    _handleIdentityDeselect(evt) {
      evt.stopPropagation();
      const identity = evt.detail.identity;
      const index = this.selectedIdentities.indexOf(identity);

      // If the item is in our selectedIdentities array, remove it
      if (index !== -1) {
        // If app calls prevent default, then don't remove the identity, just call preventDefault on the original event.
        if (this.trigger('layer-identity-deselected', { identity })) {
          this.selectedIdentities.splice(index, 1);
        } else {
          evt.preventDefault();
        }
      }
    },

    /**
     * Append a layerUI.components.IdentitiesListPanel.Item to the Document Fragment
     *
     * @method _generateItem
     * @param {layer.Identity} identity
     * @private
     */
    _generateItem(identity) {
      const identityWidget = document.createElement('layer-identity-item');
      identityWidget.item = identity;
      identityWidget.id = this._getItemId(identity);
      identityWidget.selected = this.selectedIdentities.indexOf(identity) !== -1;
      identityWidget._runFilter(this.filter);
      return identityWidget;
    },

    /**
     * Call this on any Query change events.
     *
     * This updates the selectedIdentities after doing standard query update
     *
     * @method _rerender
     * @private
     * @param {Event} evt
     */
    _rerender(evt) {
      this._processQueryEvt(evt);
      switch (evt.type) {
        // If its a remove event, find the user and remove its widget.
        case 'remove': {
          const removalIndex = this.selectedIdentities.indexOf(evt.target);
          if (removalIndex !== -1) this.selectedIdentities.splice(removalIndex, 1);
          break;
        }

        // If its a reset event, all data is gone, rerender everything.
        case 'reset':
          this.selectedIdentities = [];
          break;
      }
    },

    /**
     * Update the selected property of all Identity Items based on the selectedIdentities property.
     *
     * @method _renderSelection
     * @private
     */
    _renderSelection() {
      const selectedNodes = this.querySelectorAllArray('.layer-identity-item-selected').map(node => node.parentNode);
      const selectedIds = this.selectedIdentities.map(identity => '#' + this._getItemId(identity));
      const nodesToSelect = this.selectedIdentities.length ? this.querySelectorAllArray(selectedIds.join(', ')) : [];
      selectedNodes.forEach((node) => {
        if (nodesToSelect.indexOf(node) === -1) node.selected = false;
      });
      nodesToSelect.forEach((node) => {
        if (selectedNodes.indexOf(node) === -1) node.selected = true;
      });
    },

    /**
     * Run the filter on all Identity Items.
     *
     * @method _runFilter
     * @private
     */
    _runFilter() {
      if (!this.filter) {
        this.querySelectorAllArray('.layer-item-filtered').forEach(item => item.removeClass('layer-item-filtered'));
      } else {
        for (let i = 0; i < this.childNodes.length; i++) {
          const listItem = this.childNodes[i];
          if (listItem.item instanceof LayerAPI.Root) {
            listItem._runFilter(this.filter);
          }
        }
      }
    },
  },
});

