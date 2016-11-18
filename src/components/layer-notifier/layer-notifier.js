/**
 * The Layer Notifier widget can show Desktop Notifications when your app is in the background,
 * and Toast notifications when your app is in the foreground.
 *
 * You can customize the toast styling and layout by providing a custom Template.
 *
 * Add this to your page as:
 *
 * ```
 * <layer-notifier notify-in-foreground="toast" icon-url="https://myco.com/myimage.png"></layer-notifier>
 * ```
 *
 * Or via DOM Manipulation:
 *
 * ```javascript
 * var notifier = document.createElement('layer-notifier');
 * notifier.notifyInForeground = 'toast';
 * notifier.iconUrl = 'https://myco.com/myimage.png';
 * ```
 *
 * Note that you typically would not want to have a notification if your app is in the foreground,
 * and the new message is already visible to the user.  However,
 * this widget does not know what conversation is currently visible, so its up to you to manage this.
 *
 * Provide a layerUI.components.misc.Notifier.onMessageNotification handler to perform tests to see
 * if notifications are required, and then call `evt.preventDefault()` to prevent the notification from showing.
 *
 * @class layerUI.components.Notifier
 * @extends layerUI.components.Component
 */
import NotifyLib from 'notifyjs';
import { isInBackground as IsInBackground, getHandler as GetHandler } from '../../base';
import LUIComponent from '../../components/component';
import MainComponent from '../../mixins/main-component';

const Notify = NotifyLib.default;

LUIComponent('layer-notifier', {
  mixins: [MainComponent],

  /**
   * Before showing any notification, this event will be triggered.
   *
   * Call `evt.preventDefault()`
   * to prevent the notification from being rendered.  Not calling `preventDefault()` allows the notification to occur.
   * This lets you customize behaviors on a per-notification basis.
   *
   * ```
   * document.body.addEventListener('layer-message-notification', function(evt) {
   *   if (evt.detail.message.conversationId === myOpenConversationId) {
   *     evt.preventDefault();
   *   }
   * }
   * ```
   *
   * @event layer-message-notification
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message  The Message that has triggered this notification
   * @param {Boolean} evt.detail.isBackground   Is the app running in the background
   * @param {String} evt.detail.type            What type of notification has been configured for this event ("desktop" or "toast")
   */
  /**
   * Before showing any notification, this event will be triggered.
   *
   * Call `evt.preventDefault()`
   * to prevent the notification from being rendered.  Not calling `preventDefault()` allows the notification to occur.
   * This lets you customize behaviors on a per-notification basis.
   *
   * ```
   * notifier.onMessageNotification = function(evt) {
   *   if (evt.detail.message.conversationId === myOpenConversationId && !evt.detail.isBackground) {
   *     evt.preventDefault();
   *   }
   * }
   * ```
   *
   * @property {Function} onMessageNotification
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message  The Message that has triggered this notification
   * @param {Boolean} evt.detail.isBackground   Is the app running in the background
   * @param {String} evt.detail.type            What type of notification has been configured for this event ("desktop" or "toast")
   */

  /**
   * Use this event to handle the user clicking on the notification.
   *
   * ```
   * document.body.addEventListener('layer-notification-click', function(evt) {
   *   if (evt.detail.message.conversationId !== myOpenConversationId && !evt.detail.isBackground) {
   *     // Open the Conversation:
   *     document.querySelector('layer-conversation').conversationId = evt.detail.message.conversationId;
   *   }
   * });
   * ```
   *
   * @event layer-notification-click
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message   The Message that has triggered this notification
   */

  /**
   * Use this event to handle the user clicking on the notification.
   *
   * ```
   * notifier.onNotificationClick = function(evt) {
   *   if (evt.detail.message.conversationId !== myOpenConversationId) {
   *     // Open the Conversation:
   *     document.querySelector('layer-conversation').conversationId = evt.detail.message.conversationId;
   *   }
   * };
   * ```
   *
   * @property {Function} onNotificationClick
   * @param {Event} evt
   * @param {Object} evt.detail
   * @param {layer.Message} evt.detail.message   The Message that has triggered this notification
   */

  events: ['layer-message-notification', 'layer-notification-click'],
  properties: {

    // Docs in mixins/main-component.js
    client: {
      set(value) {
        value.on('messages:notify', this._notify.bind(this));
      },
    },

    /**
     * When your app is in the background, how should it show notifications of new Messages.
     *
     * Possible values:
     *
     * * desktop: Use desktop notifications when app is in the background
     * * toast: Use in-page toast notifications when app is in the background
     * * none or "": No notifications
     *
     * ```
     * <layer-notifier notify-in-background="none"></layer-notifier>
     * ```
     *
     * @property {String} [notifyInBackground=desktop]
     */
    notifyInBackground: {
      value: 'desktop',
      set(value) {
        if (value === 'desktop' && window.Notification) {
          Notify.requestPermission(this._onPermissionGranted.bind(this));
        }
      },
    },

    /**
     * When your app is in the foreground, how should it show notifications of new Messages.
     *
     * Possible values:
     *
     * * desktop: Use desktop notifications when app is in the foreground
     * * toast: Use in-page toast notifications when app is in the foreground
     * * none or "": No notifications
     *
     * * ```
     * <layer-notifier notify-in-foreground="toast"></layer-notifier>
     * ```
     *
     * @property {String} [notifyInForeground=none]
     */
    notifyInForeground: {
      value: 'none',
      set(value) {
        if (value === 'desktop' && window.Notification) {
          Notify.requestPermission(this._onPermissionGranted.bind(this));
        }
      },
    },

    /**
     * If the user hasn't granted priveledges to use desktop notifications, they won't be shown.
     *
     * This is a state property set by this component if/when the user/browser has approved the necessary permissions.
     *
     * @property {Boolean} [userEnabledDesktopNotifications=false]
     * @readonly
     */
    userEnabledDesktopNotifications: {
      value: false,
    },

    /**
     * To provide a custom icon to render within notifications, put the URL here.
     *
     * Leave this blank to use the sender's `avatarUrl` as the notification icon.
     *
     * * ```
     * <layer-notifier icon-url="https://myco.co/logo.png"></layer-notifier>
     * ```
     *
     * @property {String} [iconUrl=]
     */
    iconUrl: {
      value: '',
    },

    /**
     * Number of seconds the notification will stay before its automatically dismissed.
     *
     * * ```
     * <layer-notifier timeout-seconds="60"></layer-notifier>
     * ```
     *
     * @property {Number} [timeoutSeconds=30]
     */
    timeoutSeconds: {
      type: Number,
      value: 30,
    },

    /**
     * Timeout ID for clearing the toast notification
     *
     * @private
     * @property {Number} [_toastTimeout=0]
     */
    _toastTimeout: {
      value: 0,
    },
  },
  methods: {

    /**
     * Constructor.
     *
     * @method _created
     * @private
     */
    _created() {
      this.addEventListener('click', this._clickToast.bind(this));
      this.addEventListener('transitionend', this._afterTransition.bind(this), true);
    },

    /**
     * After finishing an animation, trigger this callback which removes the animation classes.
     *
     * @method _afterTransition
     * @private
     */
    _afterTransition() {
      this.classList.remove('layer-notifier-toast-fade');
    },

    /**
     * Callback indicating that the user has granted permissions for desktop notifications.
     *
     * @method _onPermissionGranted
     * @private
     */
    _onPermissionGranted() {
      this.properties.userEnabledDesktopNotifications = true;
    },

    /**
     * Notify the user of a new messages.
     *
     * Determines if foreground or background notifications are being used,
     * and what type of notification is preferred for that state.
     *
     * Triggers an event so the app can confirm/block the notification.
     *
     * @method _notify
     * @param {layer.LayerEvent} evt
     * @private
     */
    _notify(evt) {
      const isBackground = IsInBackground();
      const type = isBackground ? this.notifyInBackground : this.notifyInForeground;
      const message = evt.message;
      if (type && type !== 'none') {
        if (this.trigger('layer-message-notification', { message, type, isBackground })) {
          if (type === 'desktop' && this.properties.userEnabledDesktopNotifications) {
            this.desktopNotify(evt.message);
          } else if (type === 'toast') {
            this.toastNotify(evt.message);
          }
        }
      }
    },

    /**
     * Show a desktop notification for this message.
     *
     * @method desktopNotify
     * @param {layer.Message} message
     */
    desktopNotify(message) {
      try {
        const text = message.getText();
        if (this.properties.desktopNotify) this.closeDesktopNotify();

        this.properties.desktopMessage = message;
        this.properties.desktopNotify = new Notify(`Message from ${message.sender.displayName}`, {
          icon: this.iconUrl || message.sender.avatarUrl,
          timeout: this.timeoutSeconds,
          body: text || 'New file received',
          tag: message.conversationId || 'announcement',
          closeOnClick: true,
          notifyClick: () => {
            window.focus();
            this.trigger('layer-notification-click', { message });
          },
        });
        this.properties.desktopNotify.show();

        message.on('messages:change', (evt) => {
          if (message.isRead) {
            this.closeDesktopNotify();
          }
        }, this);
      } catch (e) {
        // do nothing
      }
    },

    /**
     * Close the desktop notification.
     *
     * @method closeDesktopNotify
     */
    closeDesktopNotify() {
      if (this.properties.desktopNotify) {
        this.properties.desktopNotify.close();
        this.properties.desktopMessage.off(null, null, this);
        this.properties.desktopMessage = this.properties.desktopNotify = null;
      }
    },

    /**
     * Show a toast notification for this message.
     *
     * @method toastNotify
     * @param {layer.Message} message
     */
    toastNotify(message) {
      const placeholder = this.querySelector('.layer-message-item-placeholder');
      const handler = GetHandler(message, this);

      if (handler) {
        if (placeholder) this.nodes.container.removeChild(placeholder);
        this.nodes.avatar.users = [message.sender];
        this.nodes.title.innerHTML = message.sender.displayName;

        if (this.properties._toastTimeout) clearTimeout(this.properties._toastTimeout);
        this.classList.add(handler.tagName);

        const messageHandler = document.createElement(handler.tagName);
        messageHandler.parentContainer = this;
        messageHandler.message = message;

        messageHandler.classList.add('layer-message-item-placeholder');
        this.nodes.container.appendChild(messageHandler);
        this.classList.add('layer-notifier-toast-fade');
        this.classList.add('layer-notifier-toast');
        this.properties._toastTimeout = setTimeout(this.closeToast.bind(this), this.timeoutSeconds * 1000);

        this.properties.toastMessage = message;
        message.on('messages:change', (evt) => {
          if (message.isRead) {
            this.closeToast();
          }
        }, this);
      }
    },

    /**
     * Close the toast notification.
     *
     * @method closeToast
     */
    closeToast() {
      this.classList.add('layer-notifier-toast-fade');
      this.classList.remove('layer-notifier-toast');

      clearTimeout(this.properties._toastTimeout);
      this.properties._toastTimeout = 0;
      if (this.properties.toastMessage) this.properties.toastMessage.off(null, null, this);
      this.properties.toastMessage = null;
    },

    /**
     * The user has clicked on the toast dialog
     *
     * @method _clickToast
     * @private
     * @param {Event} evt
     */
    _clickToast(evt) {
      if (this.properties.toastMessage) {
        evt.preventDefault();
        evt.stopPropagation();
        this.trigger('layer-notification-click', { message: this.properties.toastMessage });
        this.closeToast();
      }
    },
  },
});

