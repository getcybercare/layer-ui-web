/**
 * The Layer User List renders a pagable list of layer.Identity objects, and allows the user to select people to talk with.
 *
 * This is typically used for creating/updating Conversation participant lists.
 *
 * This Component can be added to your project directly in the HTML file:
 *
 * ```
 * <layer-membership-list></layer-membership-list>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var membersList = document.createElement('layer-membership-list');
 * ```
 *
 * @class layerUI.components.MembershipListPanel.List
 * @extends layerUI.components.Component
 * @mixin layerUI.mixins.List
 * @mixin layerUI.mixins.MainComponent
 */
<<<<<<< HEAD
import Layer from 'layer-websdk';
import { registerComponent } from '../../component';
import List from '../../../mixins/list';
import MainComponent from '../../../mixins/main-component';
import ListSelection from '../../../mixins/list-selection';
import '../layer-membership-item/layer-membership-item';

registerComponent('layer-membership-list', {
  mixins: [List, ListSelection, MainComponent],


  /**
   * The user has clicked to select an Member in the Membership List.
   *
   * ```javascript
   *    membersList.onMembershipSelected = function(evt) {
   *      var memberSelected = evt.detail.item;
   *
   *      // To prevent the UI from proceding to add the member to the selectedIdentities:
   *      // Note that memberAdded is not yet in selectedIdentities so that you may prevent it from being added.
   *      evt.preventDefault();
   *    };
   * ```
   *
   *  OR
   *
   * ```javascript
   *    document.body.addEventListener('layer-membership-selected', function(evt) {
   *      var memberSelected = evt.detail.item;
   *
   *      // To prevent the UI from proceding to add the member to the selectedIdentities:
   *      // Note that memberAdded is not yet in selectedIdentities so that you may prevent it from being added.
   *      evt.preventDefault();
   *    });
   * ```
   *
   * @event layer-membership-selected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Membership} evt.detail.item
   */
  /**
   * A membership selection change has occurred
   *
   * See the {@link layerUI.components.MembershipListPanel.List#layer-membership-selected layer-membership-selected} event for more detail.
   *
   * @property {Function} onMembershipSelected
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Membership} evt.detail.item
   */

  events: ['layer-membership-selected'],
  properties: {

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
      value: Layer.Query.Identity,
    },

    /**
     * The event name to trigger on selecting a Member.
     *
     * @readonly
     * @private
     * @property {String} [_selectedItemEventName=layer-membership-selected]
     */
    _selectedItemEventName: {
      value: 'layer-membership-selected',
    },
  },
  methods: {

    /**
     * Append a layerUI.components.IdentitiesListPanel.Item to the Document Fragment
     *
     * @method _generateItem
     * @param {layer.Membership} membership
     * @private
     */
    _generateItem(membership) {
      const membershipWidget = document.createElement('layer-membership-item');
      membershipWidget.item = membership;
      membershipWidget.id = this._getItemId(membership.id);
      membershipWidget._runFilter(this.filter);
      return membershipWidget;
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
          if (listItem.item instanceof Layer.Root) {
            listItem._runFilter(this.filter);
          }
        }
      }
    },
  },
});
