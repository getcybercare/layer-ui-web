/**
 * This is the base class for all UI classes in the Layer UI Framework.
 *
 * It works with the webcomponent API/polyfill to define components that:
 *
 * * Provides getters/setters for all defined properties
 * * Read the widget's attributes on being initialized, copying them into properties and triggering property setters
 * * Provides created and destroyed callbacks
 * * Automate standard template-related tasks
 * * Automate standard event-related tasks
 *
 * Methods and properties defined here should only be needed by developers wishing to build new widgets or evolve existing widgets.
 * Note that widgets can be created using other frameworks based on the webcomponent polyfill and still work here.
 *
 * A new component is created using:
 *
 * ```
 * var componentDefinition = {
 *   properties: {
 *      prop1: {
 *          set: function(value) {
 *              this.myRenderer();
 *          }
 *      },
 *      prop2: {
 *          get: function() {
 *              return this.scrollTop;
 *          }
 *      },
 *      prop3: {
 *          value: "Frodo is a Dodo"
 *      },
 *      prop4: {
 *          type: Function
 *      }
 *   },
 *   methods: {
 *     _created: function() {
 *        alert("The widget has been created");
 *     },
 *     myRenderer: function() {
 *        this.innerHTML = this.properties.prop1;
 *     }
 *   }
 * };
 * ```
 *
 * A component defined this way can be registered as follows:
 *
 * ```
 * var layerUI = require('websdk-ui-webcomponents');
 * layerUI.registerComponent(componentDefinition);
 * ```
 *
 * ### Properties
 *
 * A property definition can be as simple as:
 *
 * ```
 * layerUI.registerComponent({
 *    properties: {
 *       prop1: {}
 *    }
 * });
 * ```
 *
 * The above code declares `prop1` to be a property, sets up a setter that writes `widget.properties.prop1` any time `widget.prop1` is set,
 * and sets up a getter to read the value from `widget.properties.prop1`.  It also insures that at initialization time, if a `prop1` attribute
 * is found, it will be used as the `prop1` property.
 *
 * Property Definitions support the following keys:
 *
 * *  set: A setter function whose input is the new value.  Note that your setter function is called AFTER this.properties.propName
 *    has been set with the new value; your setter is for any side effects, rendering updates, or additional processing and NOT
 *    for writing the value itself.
 * *  get: A getter is needed if getting the property value from `this.properties.propName` is not getting the latest value.
 *    Perhaps you want to return `this.nodes.input.value` to get text typed in by a user.
 * *  value: If a `value` key is provided, then this will be the default value of your property, to be used if a value is
 *    not provided by the component creator.
 * *  type: Currently accepts `Boolean`, `Number`, `Function` (not a string, the actual javascript keyword).  Using a type makes the system
 *    more forgiving when processing strings.  For example, if type is Boolean, and "false" or "0" is passed in as a string, this will
 *    evaluate to `false`.  This exists because attributes frequently arrive as strings due to the way HTML attributes work.
 *    Using this with functions will cause your function string to be evaled, but will lose your function scope and `this` pointer.
 *
 * Example
 *
 * ```
 *  isEnabled: {
 *    type: Boolean,
 *    value: true,
 *    set: function(inValue) {
 *       this.classList.toggle('widget-enabled', inValue);
 *    },
 *    get: function() {
 *       return this.classList.contains('widget-enabled');
 *    }
 * }
 * ```
 *
 * ### Events
 *
 * As part of your layerUI.components.Component.registerComponents call you can pass in an `events` array; this is an array of strings representing events to listen for,
 * and provide as property-based event listeners.
 *
 * Example:
 *
 * ```
 * layerUI.registerComponent({
 *    events: ['layer-something-happening', 'layer-nothing-happening', 'your-custom-event']
 * });
 * ```
 *
 * The above component definition will result in:
 *
 * 1. The component will listen for the 3 events listed, regardless of whether this component triggered the event,
 *    or its child components triggered the event.
 * 2. The component will define the following properties: `onSomethingHappening`, `onNothingHappening` and `onYourCustomEvent`. These properties
 *    are defined for you, you do not need to do anything more than list the events in the events array.
 * 3. Your app can now use either `document.body.addEventListener('layer-nothing-happening')` or `widget.onNothingHappening = function(evt) {}`
 *
 * ### Methods
 *
 * You may provide any methods you want within the `methods` hash; be aware though that some methods have already been setup for you
 * and that some methods have important life-cycle implications if you create them:
 *
 * * created: where you can initialize your component's state
 * * destroyed: where you can cleanup any resources used by your component
 *
 *
 * @class layerUI.components.Component
 */


/**
 * Register a component using the specified HTML tagName.
 *
 * Note that if you have used layerUI.settings `customComponents` to prevent loading
 * of a Component, and are now providing your own Component definition,
 * you need to use the `force` parameter to allow this definition to register.
 *
 * Note that you may define your components and styles any way you like, you do not need to conform your
 * component structure to the expected input of this function.  This function Does however provide
 * many simplifying capabilities including
 *
 *  * Auto-generation of setters/getters removing unneccessary boilerplate
 *  * Automatic mapping of hyphen-cased properties to camel-case attributes used within your component
 *  * Automatic applying of any property values passed in before your setters could trigger; gaurentees setters trigger after initialization
 *  * Automatic detection and copying of attribute values into properties
 *  * Utilities for managing templates and styles that are seen within `layerUI` all depend upon this structure.
 *
 * @method registerComponent
 * @static
 * @param {String} tagName - Tag name that is being defined (`layer-avatar`)
 * @param {Object} classDef - Definition of your class
 * @param {Object} classDef.properties - Definition of your class properties
 * @param {Object} classDef.methods - Definition of your class methods
 * @param {String[]} classDef.events - Array of events to listen for and repackage as event handler properties
 * @param {Boolean} force - If set to true, layerUI.settings.customComponents will not skip this class definition.
 */
import layerUI from '../base';

/*
 * Provides a basic mixin mechanism.
 *
 * Provide an array of objects with a `properties` key and a `methods` key,
 * and all property defintions and method defintions will be copied into your classDef UNLESS your classDef
 * has provided its own definition.
 * If your mixin provides a created() method, it will be called after the classDef created() method is called;
 * this will be called for any number of mixins.
 *
 * @method setupMixin
 * @param {Object} classDef
 * @private
 */
function setupMixin(classDef, mixin) {
  const propNames = Object.keys(mixin.properties || {});
  const methodNames = Object.keys(mixin.methods || {});

  // Copy all properties from the mixin into the class definition,
  // unless they are already defined.
  propNames.forEach((name) => {
    if (!classDef.properties[name]) {
      classDef.properties[name] = mixin.properties[name];
    }
  });

  // Copy all methods from the mixin into the class definition,
  // unless they are already defined.
  // Created method is always copied, but in a manner such
  // that it does not overwrite other created methods on the classDef.
  methodNames.forEach((name) => {
    if (name === '_created') {
      if (!classDef.__created) classDef.__created = [];
      classDef.__created.push(mixin.methods._created);
    } else if (!classDef.methods[name]) {
      classDef.methods[name] = mixin.methods[name];
    }
  });
}

/*
 * For each event defined in the `events` property, setup an `onXXX` property.
 *
 * The `onXXX` property works by:
 *
 * 1. Doing nothing unless the app sets this event property to a Function
 * 2. Listening for the specified event via addEventListener
 * 3. Calling any provided function with the event provided by addEventListener
 * 4. Call removeEventListener should this property ever change
 *
 * @method setupEvent
 * @private
 * @param {Object} classDef
 * @param {String} eventName
 */
function setupEvent(classDef, eventName) {
  const camelEventName = layerUI.camelCase(eventName.replace(/^layer-/, ''));
  const callbackName = 'on' + camelEventName.charAt(0).toUpperCase() + camelEventName.substring(1);
  if (!classDef.properties[callbackName]) {
    classDef.properties[callbackName] = {
      type: Function,
      set(value) {
        if (this.properties['old-' + eventName]) {
          this.removeEventListener(eventName, this.properties['old-' + eventName]);
          this.properties['old-' + eventName] = null;
        }
        if (value) {
          this.addEventListener(eventName, value);
          this.properties['old-' + eventName] = value;
        }
      },
    };
  }
}

/*
 * Get an ordered array of property descriptions.
 *
 * @method
 * @private
 * @param {Object} classDef
 */
function getOrderedProps(classDef) {
  // Translate the property names into definitions with property/attribute names and orders
  const propertyAndOrderObjects = Object.keys(classDef.properties).map((propertyName) => {
    return {
      propertyName,
      attributeName: layerUI.hyphenate(propertyName),
      order: classDef.properties[propertyName].order,
      setBeforeCreate: classDef.properties[propertyName].setBeforeCreate,
    };
  });

  // Use the order to return an ordered list.
  return propertyAndOrderObjects.sort((a, b) => {
    if (a.order !== undefined && b.order === undefined) return -1;
    if (b.order !== undefined && a.order === undefined) return 1;
    if (a.order < b.order) return -1;
    if (a.order > b.order) return 1;
    return 0;
  });
}

/*
 * Define a single property based on a single property from the Component's `properties` definition.
 *
 * Will setup the properties getter, setter, default value, and type.
 *
 * @method setupProperty
 * @private
 * @param {Object} classDef   The class definition object
 * @param {Object} prop       A property definition as generated by getOrderedProps
 * @param {Object} propertyDefHash  A hash of all property definitions for use in reflection
 */
function setupProperty(classDef, prop, propertyDefHash) {
  const newDef = {};
  const name = prop.propertyName;
  const propDef = classDef.properties[name];

  // Copy our property definition into our hash of definitions
  // which will be associated with this class for reflection purposes
  propertyDefHash[name] = propDef;

  // If a getter is provided, use it. else provide a getter that returns this.properties[name].
  // However, if the call comes before we have a properties object, this is an initialization phase
  // where we should not yet have properties so return undefined.

  // NOTE: Do not use arrow functions; that will change the "this" pointer.
  newDef.get = function getter() {
    if (this.properties) {
      return propDef.get ? propDef.get.apply(this) : this.properties[name];
    } else {
      return undefined;
    }
  };



  // The property setter will set this.properties[name] and then if there is a custom setter, it will be invoked.
  // This means that the setter does NOT need to write to this.properties, but can handle side effects, transformations, etc...
  newDef.set = function propertySetter(value) {
    if (layerUI.debug) console.log(`Set property ${this.tagName}.${name} to `, value);

    // Some special handling is needed for some properties as they may be delivered
    // as strings HTML delivers attributes as strings.
    switch (propDef.type) {
      // Translate strings into booleans
      case Boolean:
        if (['false', '0', 'null', 'undefined'].indexOf(value) !== -1) {
          value = false;
        } else {
          value = Boolean(value);
        }
        break;

      case Number:
        value = Number(value);
        break;

      // Translate strings into functions
      case Function:
        value = typeof value === 'string' ? eval('(' + value + ')') : value;
        break;
    }

    const oldValue = this[name];
    if (oldValue !== value) {
      this.properties[name] = value;
      if (propDef.set) propDef.set.call(this, value, oldValue);
    }
  };

  // Write the property def to our class that will be passed into document.registerElement(tagName, classDef)
  classDef[name] = newDef;
}

layerUI.registerComponent = function registerComponent(tagName, classDef, force) {
  if (layerUI.settings.customComponents.indexOf(tagName) !== -1 && !force) return;

  // Insure property exists
  if (!classDef.methods) classDef.methods = [];

  // Add in mixins
  if (classDef.mixins) {
    classDef.mixins.forEach(mixin => setupMixin(classDef, mixin));
  }

  // Add an object for tracking event subscriptions that we need to unsubscribe from.
  classDef.properties._layerEventSubscriptions = {};

  // Setup all events specified in the `events` property.
  if (classDef.events) {
    classDef.events.forEach(eventName => setupEvent(classDef, eventName));
  }


  // For each property in the methods hash, setup the setter/getter
  const propertyDefHash = {};
  const props = getOrderedProps(classDef);

  // Add the property to our object, with suitable getters and setters
  props.forEach(prop => setupProperty(classDef, prop, propertyDefHash));

  // Cleanup; we no longer need this properties object; it can be accessed via propertyDefHash
  delete classDef.properties;

  // For every method, add the expected structure to the function
  Object.keys(classDef.methods).forEach((name) => {
    classDef[name] = {
      value: classDef.methods[name],
      writable: true,
    };
  });
  delete classDef.methods;

  /**
   * If your component has a `created` method, it will be called as follows:
   *
   * * Your widget will be initialized
   * * A template will be copied into your widget
   * * Key nodes in the template will be found and added to `this.nodes`
   * * Your `created` method is called
   * * Any Mixin `created` methods will be called
   * * Any attributes found on your widget will be copied from attributes into properties and trigger property setters
   *
   * Note that the widget may have a parent element when `created` is called, but it is not gaurenteed yet to be within `body`.
   *
   * Notes on Lifecycle:
   *
   * * properties are set from attributes after `created` as `created` is assumed to initialize all state, pointers, etc...
   *   This allows property setters to work with a fully initialized state.
   *
   * @method _created
   */
  classDef.createdCallback = {
    value: function createdCallback() {
      if (!layerUI.components[tagName]) return;

      this._tmpdata = {};
      props.forEach(prop => this._stashAttribute(prop));

      /**
       * Values for all properties of this widget.
       *
       * All properties are stored in `this.properties`; any property defined in the class definition's `properties` hash
       * are read and written here.
       *
       * @property {Object} properties
       */
      this.properties = {
        _layerEventSubscriptions: [],
      };

      /**
       * Dom nodes that are important to this widget.
       *
       * Any dom node in a template file that has a `layer-id` will be written to this hash.
       *
       * Example:
       *
       * ```
       * <template>
       *   <a layer-id='link'><img layer-id='image' /></a>
       * </template
       * ```
       *
       * The above template will result in a `nodes` value of:
       *
       * ```
       * {
       *     link: anchorObject,
       *     image: imageObject
       * }
       * ```
       *
       * And then allow me to have code such as:
       *
       * ```
       * render: function() {
       *    this.nodes.image.src = this.properties.url;
       * }
       * ```
       *
       * @property {Object} nodes
       */
      this.nodes = {};

      // If a template has been assigned for this class, append it to this node, and parse for layer-ids
      const template = this.getTemplate();
      if (template) {
        const clone = document.importNode(template.content, true);
        this.appendChild(clone);
        this.setupDomNodes();
      }

      props.forEach((prop) => {
        if (prop.setBeforeCreate && propertyDefHash[prop.propertyName].value) this[prop.propertyName] = propertyDefHash[prop.propertyName].value;
      });

      // Call the Compoent's created method
      if (this._created) this._created();

      // Call any Mixin created methods
      if (classDef.__created) {
        classDef.__created.forEach(mixinCreated => mixinCreated.apply(this));
      }

      // Copy all DOM attributes into class properties, triggering property setters
      props.forEach(prop => this._copyInAttribute(prop));
      if (this._tmpdata) this._tmpdata = null;
    },
  };

  /**
   * Fix bug in webcomponents polyfil that clobbers property getter/setter.
   *
   * The webcomponent polyfil copies in properties before the property getter/setter is applied to the object.
   * As a result, we might have a property of `this.appId` that is NOT accessed via `this.properties.appId`.
   * Further, the getter and setter functions will not invoke as long as this value is perceived as the definition
   * for this Object. So we delete the property `appId` from the object so that the getter/setter up the prototype chain can
   * once again function.  We stash the value in tmpdata which will be copied in later.
   *
   * @method
   * @private
   * @param {Object} prop   A property def whose value should be stashed
   */
  classDef._stashAttribute = {
    value: function _stashAttribute(prop) {
      const value = this[prop.propertyName];
      if (value !== undefined) {
        this._tmpdata[prop.propertyName] = value;
        delete this[prop.propertyName];
      }
    },
  };

  /**
   * Handle some messy post-create copying of attribute values over to property
   * values where property setters can fire.
   *
   * @method _copyInAttribute
   * @private
   * @param {Object} prop   A property def object as defined by getOrderedProperties
   */
  classDef._copyInAttribute = {
    value: function _copyInAttribute(prop) {

      let value = this.getAttribute(prop.attributeName);
      // Firefox seems to need this alternative to getAttribute().
      // TODO: Verify this and determine if it uses the getter here.
      if (value === null && this[prop.attributeName] !== undefined) {
        value = this[prop.attributeName];
      }

      if (value === null && this._tmpdata && this._tmpdata[prop.propertyName] !== undefined) {
        value = this._tmpdata[prop.propertyName];
      }

      if (value !== null) {
        this[prop.propertyName] = value;
      } else if (this[prop.propertyName] !== undefined) {
        value = this[prop.propertyName];
        // this only happens in firefox; somehow the property rather than the attribute is set, but
        // the setter is never called; call it now.
        // TODO: Verify this
        if (classDef[prop.propertyName].set) {
          classDef[prop.propertyName].set.call(this, value);
        }
      } else if ('value' in propertyDefHash[prop.propertyName]) {
        this[prop.propertyName] = propertyDefHash[prop.propertyName].value;
      } else {
        this.properties[prop.propertyName] = null;
      }
    },
  };

  /**
   * The setupDomNodes method looks at all child nodes of this node that have layer-id properties and indexes them in the `nodes` property.
   *
   * Typically, this node has child nodes loaded via its template, and ready by the time your `created` method is called.
   *
   * This call is made on your behalf prior to calling `created`, but if using templates after `created` is called,
   * you may need to call this directly.
   *
   * @method setupDomNodes
   */
  classDef.setupDomNodes = {
    value: function setupDomNodes() {
      this.nodes = {};
      this.querySelectorAllArray('*').forEach((node) => {
        const id = node.getAttribute('layer-id');
        if (id) this.nodes[id] = node;
      });
    },
  };

  /**
   * Add a `_destroyed` method to your component which will be called when your component has been removed fromt the DOM.
   *
   * Use this instead of the WebComponents `detachedCallback` as some
   * boilerplate code needs to be run (this code will shut off all event listeners the widget has setup).
   *
   * Your `_destroyed` callback will run after the node has been removed from the document
   * for at least 10 seconds.  See the `layer-widget-destroyed` event to prevent the widget from being destroyed after removing
   * it from the document.
   *
   * @method _destroyed
   * @private
   */
  /**
   * By default, removing this widget from the dom will cause it to be destroyed.
   *
   * Using the `layer-widget-destroyed` event, you may override this behavior using `evt.preventDefault()`:
   *
   * ```
   * document.body.addEventListener('layer-widget-destroyed', function(evt) {
   *    if (evt.target === nodeToNotDestroy) {
   *      evt.preventDefault();
   *    }
   * });
   * ```
   *
   * @event layer-widget-destroyed
   */
  classDef.detachedCallback = {
    value: function detachedCallback() {

      // Wait 10 seconds after its been removed, then check to see if its still removed from the dom before doing cleanup and destroy.
      setTimeout(() => {
        if (!document.body.contains(this) && !document.head.contains(this) && this.trigger('layer-widget-destroyed')) {
          this._layerEventSubscriptions.forEach(subscribedObject => subscribedObject.off(null, null, this));
          this._layerEventSubscriptions = [];
          this.classList.add('layer-node-destroyed');

          // Call the provided constructor
          if (this._destroyed) this._destroyed();
        }
      }, 10000);
    },
  };

  /**
   * Any time a widget's attribute has changed, copy that change over to the properties where it can trigger the property setter.
   *
   * @method attributeChangedCallback
   * @ignore
   * @param {String} name      Attribute name
   * @param {Mixed} oldValue   Original value of the attribute
   * @param {Mixed} newValue   Newly assigned value of the attribute
   */
  classDef.attributeChangedCallback = {
    value: function attributeChangedCallback(name, oldValue, newValue) {
      if (layerUI.debug) console.log(`Attribute Change on ${this.tagName}.${name} from ${oldValue} to `, newValue);
      this[layerUI.camelCase(name)] = newValue;
    },
  };

  /**
   * Return the default template or the named template for this Component.
   *
   * Get the default template:
   *
   * ```
   * var template = widget.getTemplate();
   * ```
   *
   * Get a named template:
   *
   * ```
   * var template = widget.getTemplate('layer-message-item-received');
   * ```
   *
   * Typical components should not need to call this; this will be called automatically prior to calling the Component's `created` method.
   * Some components wanting to reset dom to initial state may use this method explicitly:
   *
   * ```
   * var template = this.getTemplate();
   * var clone = document.importNode(template.content, true);
   * this.appendChild(clone);
   * this.setupDomNodes();
   * ```
   *
   * @method getTemplate
   * @param {String} [templateName='default']
   * @returns {HTMLTemplateElement}
   */
  classDef.getTemplate = {
    value: function getTemplate(templateName) {
      templateName = templateName || 'default';

      const needsStyleNode = layerUI.components[tagName].styles &&
        layerUI.components[tagName].styles[templateName] &&
        layerUI.components[tagName].renderedStyles[templateName] === false;

      if (needsStyleNode) {
        const styleNode = document.createElement('style');
        styleNode.id = 'style-' + this.tagName.toLowerCase() + '-' + templateName;
        styleNode.innerHTML = layerUI.components[tagName].styles[templateName];
        document.getElementsByTagName('head')[0].appendChild(styleNode);
        layerUI.components[tagName].renderedStyles[templateName] = true;
      }
      return layerUI.components[tagName].templates ? layerUI.components[tagName].templates[templateName] : null;
    },
  };

  /**
   * Triggers a dom level event which bubbles up the dom.
   *
   * Call with an event name and a `detail` object:
   *
   * ```
   * this.trigger('something-happened', {
   *   someSortOf: 'value'
   * });
   * ```
   *
   * The `someSortOf` key, and any other keys you pass into that object can be accessed via `evt.detail.someSortOf` or `evt.detail.xxxx`:
   *
   * ```
   * // Listen for the something-happened event which because it bubbles up the dom,
   * // can be listened for from any parent node
   * document.body.addEventListener('something-happened', function(evt) {
   *   console.log(evt.detail.someSortOf);
   * });
   * ```
   *
   * layerUI.components.Component.events can be used to generate properties to go with your events, allowing
   * the following widget property to be used:
   *
   * ```
   * this.onSomethingHappened = function(detail) {
   *   console.log(detail.someSortOf);
   * });
   * ```
   *
   * @method trigger
   * @param {String} eventName
   * @param {Object} detail
   * @returns {Boolean} True if process should continue with its actions, false if application has canceled
   *                    the default action using `evt.preventDefault()` (perhaps an event listener wanted to handle the action itself)
   */
  classDef.trigger = {
    value: function trigger(eventName, details) {
      const evt = new CustomEvent(eventName, {
        detail: details,
        bubbles: true,
        cancelable: true,
      });
      this.dispatchEvent(evt);
      return !evt.defaultPrevented;
    },
  };

  /**
   * Return array of matching elements as an Array.
   *
   * This basically just calls this.querySelectorAll and then returns a proper Array rather than a NodeList.
   *
   * @method querySelectorAllArray
   * @param {String} XPath selector
   * @returns {HTMLElement[]}
   */
  classDef.querySelectorAllArray = {
    value: function querySelectorAllArray(selector) {
      return Array.prototype.slice.call(this.querySelectorAll(selector));
    },
  };

  // Register the component with our components hash as well as with the document.
  layerUI.components[tagName] = document.registerElement(tagName, {
    prototype: Object.create(HTMLElement.prototype, classDef),
  });

  /**
   * Hash of template names as keys, Template dom nodes as values.
   *
   * These templates are used during Component initializations.
   *
   * @type {Object}
   * @private
   * @static
   */
  layerUI.components[tagName].templates = {};

  /**
   * Hash of template names as keys, and stylesheet strings as values.
   *
   * A stylesheet string can be added to the document via `styleNode.innerHTML = value` assignment.
   *
   * @type {Object}
   * @private
   * @static
   */
  layerUI.components[tagName].styles = {};

  /**
   * Hash of template names as keys, and booleans as values, indicating which template's styles have been added to the DOM.
   *
   * A style node should only ever be added to the DOM once; if the boolean is set to true, then its been added.
   *
   * @type {Object}
   * @private
   * @static
   */
  layerUI.components[tagName].renderedStyles = {};

  /**
   * Identifies the properties exposed by this component.
   *
   * Used by adapters.  Each element of the array consists of:
   *
   * ```
   * {
   *    propertyName: 'onReadThisDoc',
   *    attributeName: 'on-read-this-doc',
   *    order: 10
   * }
   * ```
   *
   * @type {Object[]}
   * @static
   */
  layerUI.components[tagName].properties = props;
};

module.exports = layerUI.registerComponent;
