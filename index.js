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

const LayerUI = require('./lib/layer-ui');

// Load Adapters
require('./lib/adapters/angular');
require('./lib/adapters/backbone');
require('./lib/adapters/react');

// Load Main Components
require('./lib/components/conversation-list-panel/layer-conversations-list/layer-conversations-list');
require('./lib/components/identities-list-panel/layer-identities-list/layer-identities-list');
require('./lib/components/layer-conversation-panel/layer-conversation-panel');
require('./lib/components/layer-notifier/layer-notifier');


// Load standard utilities
require('./lib/components/subcomponents/layer-file-upload-button/layer-file-upload-button');
require('./lib/components/subcomponents/layer-send-button/layer-send-button');
require('./lib/handlers/message/layer-message-text-plain');
require('./lib/handlers/message/layer-message-image/layer-message-image');
require('./lib/handlers/message/layer-message-video');
require('./lib/handlers/text/autolinker');
require('./lib/handlers/text/code-blocks');
require('./lib/handlers/text/emoji');
require('./lib/handlers/text/images');
require('./lib/handlers/text/newline');
require('./lib/handlers/text/youtube');
require('./lib/utils/date-separator');
require('./lib/utils/files');

// If we don't expose global.layerUI then custom templates can not load and call window.layerUI.registerTemplate()
module.exports = global.layerUI = LayerUI;
