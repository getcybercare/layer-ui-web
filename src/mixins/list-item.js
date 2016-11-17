/**
 * A List Item Mixin that provides common properties, shortcuts and code.
 *
 * This Mixin requires a template that provides a `layer-list-item` class
 *
 * @class layerUI.mixins.ListItem
 */
module.exports = {
  properties: {
    /**
     * A custom DOM node added by your application; this is not the prior List Item.
     *
     * You can set this to a DOM Node or html string
     *
     * @property {HTMLElement | String} [customNodeAbove=null]
     */
    customNodeAbove: {
      set(node) {
        if (this.properties._customNodeAbove) this.removeChild(this.properties._customNodeAbove);
        if (node && typeof node === 'string') {
          const tmp = node;
          node = document.createElement('div');
          node.innerHTML = tmp;
          this.properties.customNodeAbove = node;
        }
        if (node) {
          this.insertBefore(node, this.querySelector('.layer-list-item'));
        } else {
          this.properties.customNodeAbove = null;
        }
        this.properties._customNodeAbove = node;
      },
    },

    /**
     * A custom DOM node added by your application; this is not the prior List Item.
     *
     * You can set this to a DOM Node or html string
     *
     * @property {HTMLElement | String} [customNodeBelow=null]
     */
    customNodeBelow: {
      set(node) {
        if (this.properties._customNodeBelow) this.removeChild(this.properties._customNodeBelow);
        if (node && typeof node === 'string') {
          const tmp = node;
          node = document.createElement('div');
          node.innerHTML = tmp;
          this.properties.customNodeBelow = node;
        }
        if (node) {
          this.appendChild(node);
        } else {
          this.properties.customNodeBelow = null;
        }
        this.properties._customNodeBelow = node;
      },
    },

    /**
     * Shortcut to the `.layer-list-item` node
     *
     * @property {HTMLElement} [innerNode=null]
     * @private
     */
    innerNode: {},

    /**
     * Sets whether this widget is the first in a series of layerUI.MessageItem set.
     *
     * @property {Boolean} [firstInSeries=false]
     */
    firstInSeries: {
      type: Boolean,
      value: false,
      set(value) {
        this.toggleClass('layer-list-item-first', value);
      },
    },

    /**
     * Sets whether this widget is the last in a series of layerUI.MessageItem set.
     *
     * @property {Boolean} [lastInSeries=false]
     */
    lastInSeries: {
      type: Boolean,
      value: false,
      set(value) {
        this.toggleClass('layer-list-item-last', value);
      },
    },

    /**
     * The item of data in a list of data that this List Item will render.
     *
     * @property {layer.Root} [item=null]
     */
    item: {},
  },
  methods: {
    _created() {
      this.innerNode = this.querySelector('.layer-list-item');
    },

    /**
     * Adds the CSS class to this list item's outer node.
     *
     * @method addClass
     * @param {String} className
     */
    addClass(className) {
      this.classList.add(className);
    },

    /**
     * Removes the CSS class from this list item's outer node.
     *
     * @method removeClass
     * @param {String} className
     */
    removeClass(className) {
      this.classList.remove(className);
    },

    /**
     * Toggles the CSS class of this list item's outer node.
     *
     * @method toggleClass
     * @param {String} className
     * @param {Boolean} [add=true]
     */
    toggleClass(className, add = true) {
      this.classList[add ? 'add' : 'remove'](className);
    },
  },
};
