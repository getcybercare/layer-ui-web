import layerUI from '../base';

/**
 * Call this function to initialize all of the Backbone Views needed to handle the Layer UI for Web widgets.
 *
 * Initialize this adapter using:
 *
 * ```javascript
 * var Backbone = require('backbone');
 * var LayerUIViews = layerUI.adapters.backbone(Backbone);
 * var conversationPanelView = new LayerUIViews.ConversationPanel(client, {conversationId: 'layer:///conversations/UUID'});
 * var conversationsListView = new LayerUIViews.ConversationsList(client);
 * var identitiesListView = new LayerUIViews.UserList(client);
 * var notifierView = new LayerUIViews.Notifier(client, {notifyInForeground: 'toast'});
 * ```
 *
* Calling this will expose the following React Components:
 *
 * * ConversationPanelView: A wrapper around a layerUI.components.ConversationPanel
 * * ConversationsListView: A wrapper around a layerUI.components.ConversationsListPanel
 * * IdentitiesListView: A wrapper around a layerUI.components.IdentitiesListPanel
 * * NotifierView: A wrapper around a layerUI.components.misc.Notifier
 *
 *
 * Any occurances of a layer widget in your html should be associated with these views:
 *
 * ```html
 * < !-- Associated with the NotifierView -->
 * < layer-notifier notify-in-foreground="toast"></layer-notifier>
 *
 * < !-- Associated with the ConversationView -->
 * < layer-conversation-panel conversation-id="layer:///conversations/UUID"></layer-conversation-panel>
 * ```
 *
 * @class layerUI.adapters.backbone
 * @singleton
 * @param {Object} backbone     Pass in the backbone library
 */
let libraryResult;
function initBackbone(backbone) {
  if (libraryResult) return libraryResult;
  libraryResult = {};

  // Gather all UI Components flagged as Main Components; other components don't require special wrappers for direct use by Apps.
  Object.keys(layerUI.components).filter((componentName) => {
    const component = layerUI.components[componentName];
    return component.properties.filter(prop => prop.propertyName === '_isMainComponent').length;
  })
  .forEach((componentName) => {
    const component = layerUI.components[componentName];

    // Get the camel case Component name
    const className = (componentName.substring(0, 1).toUpperCase() +
      componentName.substring(1).replace(/-(.)/g, (str, value) => value.toUpperCase())
    ).replace(/^Layer/, '');

    // Define the Backbone View
    const view = libraryResult[className] = backbone.View.extend({
      el: componentName,
      initialize: (client, options) => {
        this.client = client;
        Object.keys(options || {}).forEach((propertyName) => {
          this[propertyName] = options[propertyName];
        });
      },
    });

    // Define getters/setters so that the View acts as though it were the WebComponent it wraps
    component.properties.forEach((propertyDef) => {
      Object.defineProperty(view.prototype, propertyDef.propertyName, {
        set(value) {
          this.$el[0][propertyDef.propertyName] = value;
        },
        get() {
          return this.$el[0][propertyDef.propertyName];
        },
      });
    });
  });
  return libraryResult;
}

module.exports = initBackbone;
layerUI.addAdapter('backbone', initBackbone);

