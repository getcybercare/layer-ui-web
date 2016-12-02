/**
 * This file is used to create a browserified build with the following properties:
 *
 * * Initializes webcomponent-light polyfil
 * * Hooks up all methods/properties in the layerUI namespace
 * * Initializes and registers all widgets of this library
 *
 * Note that you may create your own build that includes:
 *
 * * webcomponent polyfil
 * * Hooks up all methods/properties in the layerUI namespace
 * * Pick and choose modules from the lib folder to include
 */

// Load the polyfil
require('webcomponents.js/webcomponents-lite.js');

// Load layerUI namespace methods/properties
var layerUI = require("./lib/base");
var initSettings = layerUI.init;
layerUI.init = function(settings) {
  initSettings(settings);

/*** GRUNT GENERATED CODE ***/
  require("./lib/adapters/angular");
  require("./lib/adapters/backbone");
  require("./lib/adapters/react");
  require("./lib/components/conversation-list-panel/layer-conversation-item/layer-conversation-item");
  require("./lib/components/conversation-list-panel/layer-conversations-list/layer-conversations-list");
  require("./lib/components/identities-list-panel/layer-identities-item/layer-identity-item");
  require("./lib/components/identities-list-panel/layer-identities-list/layer-identities-list");
  require("./lib/components/layer-conversation-panel/layer-conversation-panel");
  require("./lib/components/layer-notifier/layer-notifier");
  require("./lib/components/messages-list-panel/layer-message-item/layer-message-item");
  require("./lib/components/messages-list-panel/layer-messages-list/layer-messages-list");
  require("./lib/components/subcomponents/layer-avatar/layer-avatar");
  require("./lib/components/subcomponents/layer-compose-button-panel/layer-compose-button-panel");
  require("./lib/components/subcomponents/layer-composer/layer-composer");
  require("./lib/components/subcomponents/layer-conversation-last-message/layer-conversation-last-message");
  require("./lib/components/subcomponents/layer-conversation-title/layer-conversation-title");
  require("./lib/components/subcomponents/layer-date/layer-date");
  require("./lib/components/subcomponents/layer-delete/layer-delete");
  require("./lib/components/subcomponents/layer-file-upload-button/layer-file-upload-button");
  require("./lib/components/subcomponents/layer-message-status/layer-message-status");
  require("./lib/components/subcomponents/layer-typing-indicator/layer-typing-indicator");
  require("./lib/handlers/message/layer-message-image/layer-message-image");
  require("./lib/handlers/message/layer-message-text-plain");
  require("./lib/handlers/message/layer-message-unknown");
  require("./lib/handlers/message/layer-message-video");
  require("./lib/handlers/text/autolinker");
  require("./lib/handlers/text/code-blocks");
  require("./lib/handlers/text/emoji");
  require("./lib/handlers/text/images");
  require("./lib/handlers/text/newline");
  require("./lib/handlers/text/youtube");
  require("./lib/mixins/has-query");
  require("./lib/mixins/list-item");
  require("./lib/mixins/list");
  require("./lib/mixins/main-component");
  require("./lib/utils/date-separator");
  require("./lib/utils/files");
  require("./lib/utils/is-url");
  require("./lib/utils/sizing");
/*** GRUNT END GENERATED CODE ***/
};

// If we don't expose global.layerUI then custom templates can not load and call window.layerUI.registerTemplate()
module.exports = global.layerUI = layerUI;