# Layer UI for Web Change Log

# 0.9.11

* Adds Channel support

## 0.9.10

* `layerUI.init()` no longer expects a `layer` property
* Build and dependencies are better organized
* `index.js` still loads all dependencies, but `layer-ui.js` can be used to load
   only the framework, and the widgets you need can be loaded via `require` or `import`.
* `layerUI.settings.customComponents` is no longer needed to prevent a component from being defined; instead either:
  * Overwrite the definition with `layerUI.registerComponent()` before calling `layerUI.init()`
  * Call `layerUI.removeComponent('layer-avatar')` before calling `layerUI.init()` to prevent the definition from being applied.
* A class that only exists in Layer WebSDK 3.1.0 and up is tested for in this release; do not use older versions of the WebSDK.

## 0.9.9

* Updates needed to work with Layer WebSDK 3.1.0

## 0.9.8

* Customizability Improvements
  * Standardizes and documents widget lifecycle
  * Adds mixin support to enable apps to customize widgets and hook into lifecycle methods
* Flux Architecture support
  * Provides a `state` property that is propagated to subcomponents
  * Any change to `state` will call the `onRenderState()` method for the widget and all of its subcomponents.
  * `state` can be used to write both application state as well as actions that widgets should be able to call.  Calling such actions are called by your mixins that enhance the widget.
* The Message Item widget `<layer-message-item />` with its CSS class of `layer-message-item-sent` or `layer-message-item-received` is removed.
  * Added `<layer-message-item-sent />` widget
  * Added `<layer-message-item-received />` widget
  * Removed support for a widget to have multiple templates to pick from
  * Apps that customized `layer-message-item` template or widget should now customize `layer-message-item-sent` or `layer-message-item-received` instead.
  * Any custom CSS will need to be updated from `layer-message-item.layer-message-item-received` to just `layer-message-item-received`.


## 0.9.6

* Build Fixes
  * Fixes the missing `layerUI.registerComponent` method
  * Fixes missing `themes/build` folder in `npm` distribution
  * Fixes missing `build/*.js` folder in `npm` distribution
* Composer Enhancements
  * Adds a Send button
  * Adds a `ConversationPanel.send()` method to let apps send the contents of the Composer.
  * Updates design of the File Upload button
  * Adds `onComposerChangeValue` property / `layer-composer-change-value` event to the `ConversationPanel` widget.
  * Triggers a `layer-composer-change-value` event when the input changes; this helps Flux architectures to put the current value into their state.
* Adds Message parameter to the registerTextHandler callback arguments
* Fixes backbone adapter; which had errors from the introduction of ES6 syntax
* Fixes to `emptyMessageListNode` to handle rerendering better
* Theming
  * Moves most of the CSS for Layer Avatars from the template to the theme
  * Some cleanup and reworking of themes and theme variables

## 0.9.5

* Adds `composePlaceholder` property to `<layer-conversation-panel>` to control the composer's placeholder property
* Adds `emptyMessageListNode` property to `<layer-conversation-panel>` to render custom dom when the current conversation has no messages
* Theme updates
* Private properties/methods now use `_`
* Fixes '<layer-conversation-panel/>' handling of `conversationId` for unauthenticated client
* Fixes setter usage of `newValue`, `oldValue` in various setters.
* Removes (for now) `listWidth` and `listHeight` properties that are passed to List Items to help optimize rendering.
  Switches to CSS based resizing.  Primarily for Images.  See instaed `LayerUI.settings.maxSizes`.
* Fixes issue in `DragAndDropFileWatcher` that caused compiler to miscompile

## 0.9.4

* Fixes bug using the appId passed into `layerUI.init()`
* Full es6 conversation, babel compile, and eslintification of code base
* Adds verification that appId refers to a Client
* Adds a Date Separator component
* Now uses `!conversation.lastMessage.isRead` instead of `conversation.unreadCount` for flagging a conversation as unread
* Refactoring of method and property names to underscore prefix private names
* JSDoc cleanup

## 0.9.1, 0.9.2, 0.9.3

* npm unpublish is a problem

## 0.9.0

* Early Beta Released!
* Updated Changelog!
