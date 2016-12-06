/**
 * The Layer Message List widget renders a scrollable, pagable list of layerUI.components.MessagesListPanel.Item widgets.
 *
 * This is designed to go inside of the layerUI.Conversation widget.
 *
 * This Component has two named templates:
 *
 * * `layer-message-item-sent`: Rendering for Messages sent by the owner of this Session
 * * `layer-message-item-received`: Rendering for Messages sent by other users
 *
 * Messages are organized into sets where a set starts with the first message from a given user, and ends when either
 * a different user sends a Message, or a long enough pause occurs.  Each Message will have firstInSeries/lastInSeries properties,
 * and these need to be maintained as new Messages are loaded, deleted, etc...
 *
 *
 * @class layerUI.components.MessagesListPanel.List
 * @extends layerUI.components.Component
 */
import animatedScrollTo from 'animated-scrollto';
import LayerUI, { layer as LayerAPI } from '../../../base';
import LUIComponent from '../../../components/component';
import List from '../../../mixins/list';

// Mandatory delay between loading one page and the next.  If user is scrolling too fast, they'll have to wait at least (2) seconds.
const PAGING_DELAY = 2000;

LUIComponent('layer-messages-list', {
  mixins: [List],
  properties: {

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageListPanel.dateRenderer = function(message) {
     *    var date = message.sentAt;
     *    return date.toISOString();
     * };
     * ```
     *
     * @property {Function} [dateRenderer=null]
     */
    dateRenderer: {},

    /**
     * Provide property to override the function used to render a date for each Message Item.
     *
     * Note that changing this will not regenerate the list; this should be set when initializing a new List.
     *
     * ```javascript
     * messageList.messageStatusRenderer = function(message) {
     *    return message.readStatus === layer.Constants.RECIPIENT_STATE.ALL ? 'read' : 'processing...';
     * };
     * ```
     *
     * @property {Function} [messageStatusRenderer=null]
     */
    messageStatusRenderer: {},

    /**
     * If the user scrolls within this many screen-fulls of the top of the list, page the Query.
     *
     * If value is 0, will page once the user reaches the top.  If the value is 0.5, will page once the user
     * reaches a `scrollTop` of 1/2 `clientHeight`.
     *
     * @property {Number} [screenFullsBeforePaging=1.5]
     */
    screenFullsBeforePaging: {
      value: 1.5,
    },

    /**
     * If the query has no data and is not loading data, this should be true.
     *
     * @property {Boolean} [isEmptyList=false]
     * @readonly
     */
    isEmptyList: {
      value: false,
      set(value) {
        this.nodes.emptyNode.style.display = value ? '' : 'none';
      },
    },

    /**
     * A dom node to render when there are no messages in the list.
     *
     * Could just be a message "Empty Conversation".  Or you can add interactive widgets.
     *
     * @property {HTMLElement} [emptyNode=null]
     */
    emptyNode: {
      set(value) {
        this.nodes.emptyNode.innerHTML = '';
        this.nodes.emptyNode.appendChild(value);
      },
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
      if (!this.id) this.id = LayerAPI.Util.generateUUID();

      // Init some local props
      this.properties.lastPagedAt = 0;
      this.properties.isSelfScrolling = false;
      this.properties.stuckToBottom = true;
      this.properties.lastScroll = 0;
      this.properties._checkVisibilityBound = this._checkVisibility.bind(this);

      window.addEventListener('focus', this.properties._checkVisibilityBound);
      this._render();
    },

    /**
     * Cleanup all pointers to self created by registering event handlers.
     *
     * @method _destroyed
     * @private
     */
    _destroyed() {
      window.removeEventListener('focus', this.properties._checkVisibilityBound);
    },

    /**
     * Tests to see if we should load a new page of data.
     *
     * 1. Tests scrollTop to see if we are close enough to the top
     * 2. Tests if we are already loading that page of data
     *
     * @method _shouldPage
     * @return {Boolean}
     * @private
     */
    _shouldPage() {
      const pagingHeight = Math.max(this.clientHeight, 300) * this.screenFullsBeforePaging;
      return this.scrollTop <= pagingHeight && this.scrollHeight > this.clientHeight + 1 && !this.isDataLoading;
    },

    /**
     * Handler is called whenever the list is scrolled.
     *
     * Scrolling is caused by user activity, OR by setting the `scrollTop`.
     * Typically, we want to stay `stuckToButton` so that any time new Messages arrive,
     * we scroll to the bottom to see them.  Any user scrolling however may disable that behavior.
     *
     * @method _handleScroll
     * @private
     */
    _handleScroll() {
      // We may set a scrollTop higher than the current scrolltop, but the only thing that changes to a lower scrollTop is
      // the user scrolling, which requires us to process it.
      const userScrolled = !this.properties.isSelfScrolling || this.scrollTop < this.properties.lastScroll;
      this.properties.lastScroll = this.scrollTop;

      // If the user has scrolled within screenFullsBeforePaging of the top of the page... and if the page has enough contents to actually
      // be scrollable, page the Messages.
      if (this._shouldPage() && userScrolled && !this.properties.delayedPagingTimeout) {
        if (this.properties.lastPagedAt + PAGING_DELAY < Date.now()) {
          if (!this.query.isFiring) {
            this.query.update({ paginationWindow: this.query.paginationWindow + 50 });
            this.isDataLoading = this.properties.query.isFiring;
          }
        } else if (!this.properties.delayedPagingTimeout) {
          // User is scrolling kind of fast, lets slow things down a little
          this.properties.delayedPagingTimeout = setTimeout(() => {
            this.query.update({ paginationWindow: this.query.paginationWindow + 50 });
            this.isDataLoading = this.properties.query.isFiring;
            this.properties.delayedPagingTimeout = 0;
          }, 500);
        }
      }

      // If we have scrolled to the bottom, set stuckToBottom to true, else false.
      const stuckToBottom = this.scrollHeight - 1 <= this.clientHeight + this.scrollTop;
      if (stuckToBottom !== this.properties.stuckToBottom) {
        this.properties.stuckToBottom = stuckToBottom;
      }

      // Trigger checks on visibility to update read state
      this._checkVisibility();
    },

    /**
     * Scroll the list to the specified Y position in pixels.
     *
     * Will call _checkVisibility() when done.
     *
     * ```
     * widget.scrollTo(500);
     * ```
     *
     * @method scrollTo
     * @param {Number} position
     */
    scrollTo(position) {
      if (position === this.scrollTop) return;
      this.properties.isSelfScrolling = true;
      this.scrollTop = position;
      setTimeout(() => {
        this.properties.isSelfScrolling = false;
        this._checkVisibility();
      }, 200);
    },

    /**
     * Scrolls the list to the specified Y position.
     *
     * Will call _checkVisibility() when done.
     *
     * ```
     * widget.animateScrollTo(500);
     * ```
     *
     * @method animateScrollTo
     * @param {Number} position
     */
    animateScrollTo(position) {
      if (position === this.scrollTop) return;
      this.properties.isSelfScrolling = true;
      animatedScrollTo(this, position, 200, () => {
        // Wait for any onScroll events to trigger before we clear isSelfScrolling and procede
        setTimeout(() => {
          this.properties.isSelfScrolling = false;
          this._checkVisibility();
        }, 100);
      });
    },

    /**
     * Check which Messages are fully visible, and mark them as Read.
     *
     * TODO PERFORMANCE: Should be able to skip to the visible items and near-visible items without iterating over entire list
     *
     * NOTE: Only mark messages as read if the document has focus.  Just being visible but not in focus does not give us
     * sufficient cause to assume the user has read it.
     *
     * TODO: At some point we may need to customize whether document.hasFocus() is required; in particular, this could cause problems for anyone
     * running in an iFrame.  Is top.document.hasFocus() a suitable solution, or are there scenarios where top might not even be accessable due to
     * being a different domain?
     *
     * @method
     * @private
     */
    _checkVisibility() {
      if (LayerUI.isInBackground()) return;

      // The top that we can see is marked by how far we have scrolled.
      // However, all offsetTop values of the child nodes will be skewed by the value of this.nodes.loadIndicator.offsetTop, so add that in.
      const visibleTop = this.scrollTop + this.nodes.loadIndicator.offsetTop;

      // The bottom that we can see is marked by how far we have scrolled plus the height of the panel.
      // However, all offsetTop values of the child nodes will be skewed by the value of this.nodes.loadIndicator.offsetTop, so add that in.
      const visibleBottom = this.scrollTop + this.clientHeight + this.nodes.loadIndicator.offsetTop;
      const children = Array.prototype.slice.call(this.childNodes);
      children.forEach((child) => {
        if (child.offsetTop >= visibleTop && child.offsetTop + child.clientHeight <= visibleBottom) {
          if (child.properties && child.properties.item && !child.properties.item.isRead) {
            // TODO: Use a scheduler rather than many setTimeout calls
            setTimeout(() => this._markAsRead(child), LayerUI.settings.markReadDelay);
          }
        }
      }, this);
    },

    /**
     * Mark a the Message associated with this item as read.
     *
     * This method validates that the Message flagged as ready to be read by `_checkVisibility()` is
     * in fact still fully visible after the delay.
     *
     * @method _markAsRead
     * @private
     * @param {layerUI.components.MessagesListPanel.Item} child
     */
    _markAsRead(child) {
      const visibleTop = this.scrollTop + this.nodes.loadIndicator.offsetTop;
      const visibleBottom = this.scrollTop + this.clientHeight + this.nodes.loadIndicator.offsetTop;
      if (child.offsetTop >= visibleTop && child.offsetTop + child.clientHeight <= visibleBottom) {
        child.properties.item.isRead = true;
      }
    },

    /**
     * Generate a unique dom ID for this message to make it easy to lookup any given Message item.
     *
     * @method
     * @private
     */
    _getItemId(message) {
      const uuid = message.id.replace(/^.*\//, '');
      return `message-item${this.id}-${uuid}`;
    },


    /**
     * Append a Message to the document fragment, updating the previous messages' lastInSeries property as needed.
     *
     * @method _generateItem
     * @private
     */
    _generateItem(message) {
      const handler = LayerUI.getHandler(message, this);
      if (handler) {
        const messageWidget = document.createElement('layer-message-item');
        messageWidget.id = this._getItemId(message);
        messageWidget.dateRenderer = this.dateRenderer;
        messageWidget.messageStatusRenderer = this.messageStatusRenderer;

        messageWidget._contentTag = handler.tagName;
        return messageWidget;
      } else {
        return null;
      }
    },

    /**
     * Are the two Messages in the same Group?
     *
     * See LayerUI.settings.messageGroupTimeSpan to adjust the definition of Same Group.
     *
     * @method _inSameGroup
     * @private
     * @param {layer.Message} m1
     * @param {layer.Message} m2
     */
    _inSameGroup(m1, m2) {
      if (!m1 || !m2) return false;
      const diff = Math.abs(m1.sentAt.getTime() - m2.sentAt.getTime());
      return m1.sender === m2.sender && diff < LayerUI.settings.messageGroupTimeSpan;
    },

    /**
     * Whenever new message items are added to the list, we need to assign lastInSeries and firstInSeries values to them,
     * as well as update those values in nearby message items.
     *
     * @method _processAffectedWidgetsCustom
     * @private
     * @param {layerUI.components.MessagesListPanel.Item[]} widgets
     */
    _processAffectedWidgetsCustom(widgets, isTopItemNew) {
      if (widgets.length === 0) return;
      if (isTopItemNew) widgets[0].firstInSeries = true;
      for (let i = 1; i < widgets.length; i++) {
        const sameGroup = this._inSameGroup(widgets[i - 1].item, widgets[i].item);
        widgets[i].firstInSeries = !sameGroup;
        widgets[i - 1].lastInSeries = !sameGroup;
      }
      if (!widgets[widgets.length - 1].nextSibling) widgets[widgets.length - 1].lastInSeries = true;
    },

    _postRender() {
      this.nodes.emptyNode.style.display = this.isEmptyList ? '' : 'none';
    },

    /**
     * Call this on any Query change events.
     *
     * @method _rerender
     * @private
     * @param {Event} evt
     */
    _rerender(evt) {
      if (this.query.isDestroyed) {
        this.isEmptyList = false;
        this._renderResetData();
      } else {
        this.isEmptyList = evt.type !== 'reset' && this.query.data.length === 0;
        this._processQueryEvt(evt);
      }
    },

    _renderResetData() {
      this.properties.listData = [];
      this.scrollTo(0);
      this.properties.stuckToBottom = true;
      this.properties.lastPagedAt = 0;
      this.properties.isSelfScrolling = false;
      this.properties.lastScroll = 0;
      this._render();
    },

    _renderWithoutRemovedData(evt) {
      this.properties.listData = [].concat(this.properties.query.data).reverse();

      const messageWidget = this.querySelector('#' + this._getItemId(evt.target));
      if (messageWidget) this.removeChild(messageWidget);

      const removeIndex = this.properties.listData.length - evt.index; // Inverted for reverse order
      const affectedItems = this.properties.listData.slice(Math.max(0, removeIndex - 3), removeIndex + 3);
      this._gatherAndProcessAffectedItems(affectedItems, false);

    },

    _renderInsertedData(evt) {
      const oldListData = this.properties.listData;
      this.properties.listData = [].concat(this.properties.query.data).reverse();

      const insertIndex = oldListData.length - evt.index; // Inverted for reverse order
      const isTopItemNew = insertIndex === 0;

      const affectedItems = this.properties.listData.slice(Math.max(0, insertIndex - 3), insertIndex + 4);
      const fragment = this._generateFragment([evt.target]);
      if (insertIndex < oldListData.length) {
        const insertBeforeNode = affectedItems.length > 1 ?
          this.querySelector('#' + this._getItemId(oldListData[insertIndex])) : null;
        this.insertBefore(fragment, insertBeforeNode);
      } else {
        this.appendChild(fragment);
      }
      this._gatherAndProcessAffectedItems(affectedItems, isTopItemNew);
      this._updateLastMessageSent();
      if (this.properties.stuckToBottom) {
        this.animateScrollTo(this.scrollHeight - this.clientHeight);
      } else {
        this._checkVisibility();
      }
    },

    /**
     * The last message sent by the session owner should show some pending/read-by/etc... status.
     *
     * Other messages may also do this, but adding the `layer-last-message-sent` css class makes it easy
     * to conditionally show status only for the last sent message.
     *
     * TODO: Review if a CSS :last-child could isolate last message sent from last message received, and be used for easily styling this.
     *
     * @method _updateLastMessageSent
     * @private
     */
    _updateLastMessageSent() {
      for (let i = this.properties.listData.length - 1; i >= 0; i--) {
        if (this.properties.listData[i].sender.sessionOwner) {
          const item = this.querySelector('#' + this._getItemId(this.properties.listData[i]));
          if (item && !item.classList.contains('layer-last-message-sent')) {
            this.querySelectorAllArray('.layer-last-message-sent').forEach((node) => {
              node.classList.remove('layer-last-message-sent');
            });
            item.classList.add('layer-last-message-sent');
          }
          break;
        }
      }
    },

    /**
     * Identify the message-item that is fully visible and at the top of the viewport.
     *
     * We use this before paging in new data so that we know which message should still
     * be at the top after we insert new messages at the top, and must compensate our `scrollTop`
     * accordingly.
     *
     * @method _findFirstVisibleItem
     * @private
     */
    _findFirstVisibleItem() {
      const visibleTop = this.scrollTop;
      const visibleBottom = this.scrollTop + this.clientHeight;
      const children = Array.prototype.slice.call(this.childNodes);
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.offsetTop >= visibleTop && child.offsetTop + child.clientHeight <= visibleBottom) {
          if (child.properties && child.properties.item) {
            return child;
          }
        }
      }
      return null;
    },

    /**
     * Render a new page of data received from the Query.
     *
     * @method _renderPagedData
     * @private
     */
    _renderPagedData(evt) {
      if (evt.data.length === 0) {
        this.isDataLoading = this.properties.query.isFiring;
        return;
      }

      // Set this so that if the user is clinging to the scrollbar forcing it to stay at the top,
      // we know we just paged and won't page again.
      this.properties.lastPagedAt = Date.now();

      // Get both the query data and the event data
      const oldListData = this.properties.listData;
      this.properties.listData = [].concat(this.properties.query.data).reverse();
      const newData = [].concat(evt.data).reverse();

      // Get the affected items
      let affectedItems = [].concat(newData);
      let fragment;
      if (oldListData.length) affectedItems = affectedItems.concat(oldListData.slice(0, 3));


      // Append only a few items at a time, with pauses to keep browser running smoothly.
      // Don't append anything to the document until its all generated
      // TODO: This sucks.  For 100 items, it takes 5 iterates of 20ms each, so it adds 100ms lag to render,
      // and the only good news is that this 100ms lag results in performance of the rest of the browser not degrading.
      const appendMore = function appendMore() {
        const processItems = newData.splice(0, 20);
        fragment = this._generateFragment(processItems, fragment);
        if (newData.length) {
          setTimeout(() => appendMore.call(this), 20);
        } else {
          this._renderPagedDataDone(affectedItems, fragment, evt);
        }
      }.bind(this);
      appendMore();
    },

    /**
     * After we have rendered the newly paged in messages, some post processing is needed.
     *
     * 1. Call processAffectedWidgets
     * 2. Scroll to maintain an appropriate position
     * 3. Insert the document fragment into our widget
     * 4. Check visibility on newly rendered items
     *
     * @method _renderPagedDataDone
     * @private
     */
    _renderPagedDataDone(affectedItems, fragment, evt) {
      // Find the nodes of all affected items in both the document and the fragment,
      // and call processAffectedWidgets on them
      if (affectedItems.length) {
        const affectedWidgetsQuery = '#' + affectedItems.map(message => this._getItemId(message)).join(', #');
        let affectedWidgets = this.querySelectorAllArray(affectedWidgetsQuery);
        if (fragment) {
          const fragmentWidgets = Array.prototype.slice.call(fragment.querySelectorAll(affectedWidgetsQuery));
          affectedWidgets = fragmentWidgets.concat(affectedWidgets);
        }
        try {
          // When paging new data, top item should always be new
          this._processAffectedWidgets(affectedWidgets, true);
        } catch (e) {
          console.error(e);
        }
      }

      const firstVisibleItem = this._findFirstVisibleItem();
      const initialOffset = firstVisibleItem ? firstVisibleItem.offsetTop - this.nodes.loadIndicator.offsetTop - this.scrollTop : 0;

      // Now that DOM manipulation is completed,
      // we can add the document fragments to the page
      const nextItem = this.nodes.loadIndicator.nextSibling;
      this.insertBefore(fragment, nextItem);

      // TODO PERFORMANCE: We should not need to do this as we page UP; very wasteful
      this._updateLastMessageSent();

      if (this.properties.stuckToBottom) {
        this.scrollTo(this.scrollHeight - this.clientHeight);
      } else if (firstVisibleItem && evt.type === 'data' && evt.data.length !== 0) {
        this.scrollTo(firstVisibleItem.offsetTop - this.nodes.loadIndicator.offsetTop - initialOffset);
      }

      this.isDataLoading = this.properties.query.isFiring;
      this._checkVisibility();
    },
  },
});
