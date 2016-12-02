# Layer UI for Web

The Layer UI for Web provides a library of widgets to simplify adding chat capabilities into your application.

It is implemented using the [Webcomponents Polyfill](https://github.com/WebComponents/webcomponentsjs); in particular, this project uses the "light" version of the polyfill which means we do not use Shadow Dom.

## Why use Layer UI?

1. It handles a lot of capabilities for you:
  * Sends read receipts on any message that has scrolled into view, and remained visible for 2.5s
  * Sends typing indicators to other participants
  * Renders typing indicators from other participants
  * Pages your queries as the user scrolls
  * Handles a variety of common text processing tasks (emoticons for example), and provides plugins for adding more
  * Handles a variety of Message Types and provides plugins for adding more
2. It is highly customizable
  * You may replace a stylesheet for a given widget with your own stylesheet
  * You may replace the HTML Template for a given widget with your own template
  * You may replace an entire widget class with your own definition of that class

You can build all these things on your own using only [Layer WebSDK](https://github.com/layerhq/layer-websdk); but that shifts a lot more development and maintenance onto you.

## Beta Release

This is a Beta Release.  We welcome feedback, and look forwards to working with customers who have issues.

Feedback can be sent via https://github.com/layerhq/layer-ui-web/issues

## Installation

Layer UI for Web depends upon the [Layer WebSDK](https://github.com/layerhq/layer-websdk), and provides an `init` method for providing a Layer Client,
as well as access to the WebSDK library itself.  How to use this depends on your installation method.

Note that if you do not have an `appId` at the time you call `init()` you can instead pass `app-id` attributes into each widget you use.

### CDN

```html
<script src='https://cdn.layer.com/sdk/3.0/layer-websdk.min.js'></script>
<script src='https://cdn.layer.com/ui/0.9/layer-ui-web.min.js'></script>
<link rel='stylesheet' href='https://cdn.layer.com/ui/0.9/themes/bubbles-basic.css' />
<script>
window.layerUI.init({
  layer: window.layer,
  appId: 'layer:///apps/staging/UUID'
});
</script>
```

Alternatively, a separate theme and templates can be loaded using:

```html
<link rel='stylesheet' href='https://cdn.layer.com/ui/0.9/themes/groups-basic.css' />
<link rel='import' href="https://cdn.layer.com/ui/0.9/themes/groups-basic-templates.html">
```

> Note: Using a custom template must access this package from the `window` object; as such, regardless of what module system you use, the default
build will assign `window.layerUI` to this package.

More information on creating/customizing themes is in the [Themes](CUSTOMIZATION.md#themes) section.

### NPM

```console
npm install layer-websdk layer-ui-web --save
```

```javascript
var layer = require('layer-websdk');
var layerUI = require('layer-ui-web');
layerUI.init({
  layer: layer,
  appId: 'layer:///apps/staging/UUID'
});
```

```html
<link rel='stylesheet' href='node_modules/layer-ui-web/themes/build/groups-basic.css' />
<link rel='import' href="node_modules/layer-ui-web/themes/build/groups-basic-templates.html">
```

Note that you can create a custom build that does not compile in all components; this would replace use of the index.js file in this repository with your own:

```javascript
// Load the polyfill
require('webcomponents.js/webcomponents-lite.js');

// Register the components we want
require("layer-ui-web/lib/components/conversation-panel/layer-compose-button-panel/layer-compose-button-panel");
require("layer-ui-web/lib/components/conversation-panel/layer-composer/layer-composer");
require("layer-ui-web/lib/components/conversation-panel/layer-conversation/layer-conversation");
require("layer-ui-web/lib/components/conversation-panel/layer-message-item/layer-message-item");
require("layer-ui-web/lib/components/conversation-panel/layer-messages-list/layer-messages-list");
require("layer-ui-web/lib/components/conversation-panel/layer-typing-indicator/layer-typing-indicator");
require("layer-ui-web/lib/components/misc/layer-avatar/layer-avatar");
require("layer-ui-web/lib/components/misc/layer-date/layer-date");
require("layer-ui-web/lib/components/misc/layer-delete/layer-delete");
require("layer-ui-web/lib/components/misc/layer-message-status/layer-message-status");
require("layer-ui-web/lib/handlers/messages/layer-message-image");
require("layer-ui-web/lib/handlers/messages/layer-message-text-plain");
require("layer-ui-web/lib/handlers/messages/layer-message-unknown");
require("layer-ui-web/lib/handlers/messages/layer-message-video");
require("layer-ui-web/lib/mixins/list-item");
require("layer-ui-web/lib/mixins/list");
require("layer-ui-web/lib/mixins/main-component");
require("layer-ui-web/lib/utils/files");
require("layer-ui-web/lib/utils/is-url");
require("layer-ui-web/lib/utils/sizing");

var layer = require('layer-websdk');
var layerUI = require('layer-ui-web/lib/base');

layerUI.init({
  layer: layer,
  appId: 'layer:///apps/staging/UUID'
});
```

### Install from Github

Clone the repo, install dependencies and build it:

```console
git clone git@github.com:layerhq/layer-ui-web.git
cd layer-ui-web
npm install
grunt
```

```html
<script src='https://cdn.layer.com/sdk/3.0/layer-websdk.min.js'></script>
<script src='layer-ui-web/build/layer-ui-web.min.js'></script>
```

## Reference

A full API reference for all widgets can be seen at:

* [Beta API Reference](http://static.layer.com/layer-ui-web-beta/docs/)

## Using the Widget Library

Using the Widget Library is as simple as adding an html tag to your page.  The following would generate a suitable
UI assuming some CSS to size and position the widgets:

```html
<html>
  <head>
    <script src='http://cdn.layer.com/sdk/3.0/layer-websdk.min.js'></script>
    <script src='https://cdn.layer.com/ui/0.9/layer-ui-web.min.js'></script>

    <!-- Code for instantiating a layer.Client and authenticating it: -->
    <script src='my-client-initializer.js'></script>
    <script>
      layerUI.init({layer: window.layer, appId: 'layer:///apps/staging/UUID'});
    </script>
  </head>
  <body>
    <layer-identities-list></layer-identities-list>
    <layer-conversations-list></layer-conversations-list>
    <layer-conversation-panel ></layer-conversation-panel>
  </body>
</html>
```

Using a Webcomponent Polyfill and implementation means that you can _also_ create an element simply with:

```javascript
var conversationWidget = document.createElement('layer-conversation-panel');
document.body.appendChild(conversationWidget);
```

## The Widget library

There are many widgets in this framework, but mostly you only need to work with the Main Components; these are high level widgets that wrap and manage a set of subcomponents.  Typically you would not directly interact with the subcomponents.

* `<layer-conversation-panel />`: Manages a message list, a typing indicator panel, and a compose bar for typing a message
  * This could be your entire UI, a single `layer-conversation` widget hardcoded to a single conversation with a customer support user; no other widgets needed.
  * The key property for this widget is `conversationId` (or used as an attribute: `conversation-id`), which lets you configure which Conversation its being used to interact with.
* `<layer-conversations-list />`: Manages a Conversation List
  * Use this to present a list of Conversations, and use the `layer-conversation-selected` event to set the `layer-conversation` `conversationId` property to render the selected Conversation.
* `<layer-identities-list />`: Manages a User list
  * Use this to present a list of users to create a Conversation with, and when your user selection is done, you can call `var conversation = myLayerClient.createConversation({ participants: [list.selectedUsers] }); myConversationPanel.conversationId = conversation.id;`
* `<layer-notifier />`: Creates desktop and toast notifications for new messages

See the [API Documentation](http://static.layer.com/layer-ui-web-beta/docs/) for more information on the parameters of each of these widgets.

## Customizing the Widgets

A primary goal of this library is ease of customization so that both look-and-feel as well as behaviors can match
your design goals.  The main customization mechanisms include:

* Events: listen for events use them to override default handling of events with your custom handling of events
* Themes: select from pre-built themes, or provide your own
* Custom Templates: Change the layout/structure of a widget by providing custom html templates for widgets
* Custom Components: Replace entire widget definitions with your own widget definitions

See [CUSTOMIZATION.md](CUSTOMIZATION.md) for more details.

## Design Philosophy

1. Main Components which may get their properties set via attributes must have a means of accepting complex properties as strings.  This is done for example by accepting a `query-id` rather than a `query`, or an `app-id` instead of a `client`.  Booleans need to accept the string "false" and "0" as `false`.  Strings representing strings may need to be *evaled*.
2. Subcomponents will get their properties via DOM  manipulation, and not via attributes, and therefore do not need to expose properties such as `query-id` when `query` will suffice.
3. There is a trade-off between performance and customizability when defining a tiny subcomponent such as `<layer-date />` that must be created and rendered repeatedly.  But by abstracting date into its own widget, a developer can easily replace `<layer-date />` with a custom component without any changes to the parent components.  Customizability as long as performance doesn't cause noticable problems is worth pursuing.

## Future Work

* This project does not use Shadow Dom due to performance implications of the Shadow Dom polyfill.  The Shadow Dom API provides an ideal
mechanism for passing subcomponents such as buttons for the composer, and other custom elements as inputs.  Currently, this can only be done
via dom manipulation; even in the case of `ConversationPanel.composeButtons` one must dom create elements,
put them in an array and then set `composeButtons` to refer to them.  This is especially bad in React.  A better mechanism should be discussed,
and implemented.
* Inclusion of standard dom nodes that go between messages, such as Date headers, Headers indicating "read up to here", etc...  For now we just include the capability to build your own.
* Border radius on the you-tube embedded iframe is pretty sketchy during initialization of the Player

## Testing

This is setup so that you can run testem from the root folder

```console
> testem
```

and then test this in any browser with the URL output by the command.