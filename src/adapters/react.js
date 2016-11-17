import layerUI from '../base';

/**
 * Call this function to initialize all of the react components needed to handle the Layer UI for Web widgets.
 *
 * Before using this, please note that layerUI.init() must be called prior to calling layerUI.adapters.react().
 *
 * Initialize with:
 *
 * ```
 * import React from 'react';
 * import ReactDom from 'react-dom';
 * const { ConversationPanel, ConversationList, UserList, Notifier } = layerUI.adapters.react(React, ReactDom);
 * ```
 *
 * Calling this will expose the following React Components:
 *
 * * ConversationPanel: A wrapper around a layerUI.components.ConversationPanel
 * * ConversationsList: A wrapper around a layerUI.components.ConversationsListPanel
 * * IdentitiesList: A wrapper around a layerUI.components.IdentitiesListPanel
 * * Notifier: A wrapper around a layerUI.components.misc.Notifier
 *
 * You can then use:
 *
 * ```
 * render() {
 *    return <ConversationList
 *      on-conversation-selected={this.mySelectHandler}></ConversationList>
 * }
 * ```
 *
 * To insure that LayerUI.init() is called before layerUI.adapters.react(), and each is only called once, we
 * recommend puttings this code in its own module:
 *
 * ```
 * import React, { Component, PropTypes } from 'react';
 * import ReactDom from 'react-dom';
 * import * as Layer from 'layer-websdk';
 * import * as LayerUI from 'layer-ui-web';
 *
 * LayerUI.init({
 *   appId: 'layer:///apps/staging/my-app-id',
 *   layer: Layer
 * });
 * const LayerUIWidgets = LayerUI.adapters.react(React, ReactDom);
 * module.exports = LayerUIWidgets;
 * ```
 *
 * Now anywhere you need access to the LayerUIWidgets library can import this module and expect everything to
 * evaluate at the correct time, correct order, and only evaluate once.
 *
 * @class layerUI.adapters.react
 * @singleton
 * @param {Object} React - Pass in the reactJS library
 * @param {Object} ReactDom - Pass in the ReactDom library
 */
let libraryResult;
function initReact(React, ReactDom) {
  if (libraryResult) return libraryResult;
  libraryResult = {};

  // Gather all UI Components flagged as Main Components; other components don't require special React Components for direct use.
  Object.keys(layerUI.components).filter((componentName) => {
    const component = layerUI.components[componentName];
    return component.properties.filter(prop => prop.propertyName === '_isMainComponent').length;
  })
  .forEach((componentName) => {
    const component = layerUI.components[componentName];

    // Get the camel case Component name
    const className = (componentName.substring(0, 1).toUpperCase() +
      componentName.substring(1)
      .replace(/-(.)/g, (str, value) => value.toUpperCase()))
        .replace(/^Layer/, '');

    libraryResult[className] = React.createClass({

      /**
       * On mounting, copy in all properties, and optionally setup a Query.
       *
       * Delay added to prevent Webcomponents property setters from being blown away in safari and firefox
       */
      componentDidMount() {
        layerUI.defer(() => {
          // Get the properties/attributes that match those used in this.props
          const props = component.properties.filter(property =>
            this.props[property.propertyName] || this.props[property.attributeName]);

          // Set the webcomponent properties
          props.forEach((propDef) => {
            const value = propDef.propertyName in this.props ?
              this.props[propDef.propertyName] : this.props[propDef.attributeName];
            this.node[propDef.propertyName] = value;
          });
        });
      },

      /**
       * Copy all properties into the dom node, but never let React recreate this widget.
       */
      shouldComponentUpdate(nextProps) {
        // Get the properties/attributes that match those used in this.props
        const props = component.properties.filter(property =>
          this.props[property.propertyName] || this.props[property.attributeName]);

        // Set the webcomponent properties if they have changed
        props.forEach((propDef) => {
          const name = propDef.propertyName in this.props ? propDef.propertyName : propDef.attributeName;
          if (nextProps[name] !== this.props[name]) {
            this.node[propDef.propertyName] = nextProps[name];
          }
        }, this);
        return false;
      },

      render() {
        return React.createElement(componentName, { ref: (node) => { this.node = node; } });
      },
    });
  });
  return libraryResult;
}

module.exports = initReact;
layerUI.addAdapter('react', initReact);

