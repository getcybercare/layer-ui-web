/**
 * The Layer Date widget renders a date.
 *
 * This is provided as a specialized component so that it can be easily redefined by your app to
 * provide your own date formatting.
 *
 * @class layerUI.components.subcomponents.Date
 * @extends layerUI.components.Component
 */
import LUIComponent from '../../../components/component';

LUIComponent('layer-date', {
  properties: {

    /**
     * Date to be rendered
     *
     * @property {Date}
     */
    date: {
      set(value) {
        if (value) {
          if (this.dateRenderer) {
            this.value = this.dateRenderer(value);
          } else {
            const dateStr = value.toLocaleDateString();
            const timeStr = value.toLocaleTimeString();
            this.value = new Date().toLocaleDateString() === dateStr ? timeStr : dateStr + ' ' + timeStr;
          }
        } else {
          this.value = '';
        }
      },
    },

    /**
     * The actual rendered string.
     *
     * @property {String}
     */
    value: {
      set(value) {
        this.innerHTML = value;
      },
    },

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * dateItem.dateRenderer = function(date) {
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function}
     */
    dateRenderer: {},
  },
  methods: {

    /**
     * Constructor.
     *
     * @method _created
     * @private
     */
    _created() {
    },
  },
});

