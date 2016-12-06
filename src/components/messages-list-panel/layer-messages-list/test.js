describe('layer-messages-list', function() {
  var el, testRoot, client, conversation, query, user1;


  beforeEach(function() {
    jasmine.clock().install();

    client = new layer.Client({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new layer.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true,
      sessionOwner: true
    });
    client._clientAuthenticated();
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-messages-list');
    testRoot.appendChild(el);
    testRoot.style.display = 'flex';
    testRoot.style.flexDirection = 'column';
    testRoot.style.height = '300px';
    query = client.createQuery({
      model: layer.Query.Message,
      predicate: 'conversation.id = "' + conversation.id + '"'
    });
    query.isFiring = false;
    for (i = 0; i < 100; i++) {
      query.data.push(conversation.createMessage("m " + i).send());
    }

    user1 = new layer.Identity({
      client: client,
      userId: 'SaurumanTheMildlyAged',
      displayName: 'Sauruman the Mildly Aged',
      id: 'layer:///identities/SaurumanTheMildlyAged',
      isFullIdentity: true
    });

    el.query = query;
    el.style.height = '300px';

    jasmine.clock().tick(500);
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
    jasmine.clock().uninstall();
  });

  describe('The created() method', function() {
    beforeEach(function() {
      el = document.createElement('layer-messages-list');
      testRoot.innerHTML = '';
      testRoot.appendChild(el);
    });
    it("Should initialize lastPagedAt", function() {
      expect(el.properties.lastPagedAt).toEqual(0);
    });

    it("Should initialize isSelfScrolling", function() {
      expect(el.properties.isSelfScrolling).toEqual(false);
    });

    it("Should initialize stuckToBottom", function() {
      expect(el.properties.stuckToBottom).toEqual(true);
    });

    it("Should initialize lastScroll", function() {
      expect(el.properties.lastScroll).toEqual(0);
    });

    it("Should call render", function() {
      expect(el.nodes.loadIndicator.classList.contains('layer-load-indicator')).toBe(true);
    });

    it("Should wire up _checkVisibility to the focus event", function() {
      query.data[0].isRead = false;
      query.data[query.size - 1].isRead = false;
      el.properties.stuckToBottom = false;
      el.scrollTop = 0;
      spyOn(el, "_markAsRead");
      var tmp = window.layerUI.isInBackground;
      window.layerUI.isInBackground = function() {return false;}
      el.query = query;
      jasmine.clock().tick(150);

      // Run
      evt = new CustomEvent('focus', {});
      window.dispatchEvent(evt);
      jasmine.clock().tick(3000);

      // Posttest
      expect(el._markAsRead).toHaveBeenCalled();

      // Cleanup
      window.layerUI.isInBackground = tmp;
    });
  });

  describe("The _destroyed() method", function() {
    it("Should unwire _checkVisibility from the focus event", function() {
      query.data[0].isRead = false;
      spyOn(el, "_markAsRead");
      var tmp = window.layerUI.isInBackground;
      window.layerUI.isInBackground = function() {return false;}
      el.query = query;
      jasmine.clock().tick(150);
      el._destroyed();

      // Run
      evt = new CustomEvent('focus', {});
      window.dispatchEvent(evt);
      jasmine.clock().tick(3000);

      // Posttest
      expect(el._markAsRead).not.toHaveBeenCalled();

      // Cleanup
      window.layerUI.isInBackground = tmp;
    });

  });


  describe("The _shouldPage() method", function() {
    it("Should return true if scrolled to the top", function() {
      el.scrollTop = 0;
      el.isDataLoading = false;
      expect(el._shouldPage()).toBe(true);
    });

    it("Should return false if data is loading", function() {
      el.isDataLoading = true;
      expect(el._shouldPage()).toBe(false);
    });

    it("Should return false if more than half a page from the top", function() {
      el.screenFullsBeforePaging = 0.5;
      el.scrollTop = 160;
      el.isDataLoading = false;
      expect(el._shouldPage()).toBe(false);
    });

    it("Should return true if less than half a page from the top", function() {
      el.screenFullsBeforePaging = 0.5;
      el.scrollTop = 140;
      el.isDataLoading = false;
      expect(el._shouldPage()).toBe(true);
    });
  });

  describe("The _handleScroll() method", function() {
    it("Should page the query if _shouldPage and if its userScrolled and we arent in the middle of a delayedPagingTimeout and we didn't just fire the query and the query isnt already firing", function() {
      spyOn(query, 'update');
      spyOn(el, '_shouldPage').and.returnValue(true);
      el.properties.isSelfScrolling = false;
      el.properties.lastScroll = 0;
      el.properties.delayedPagingTimeout = 0;
      el.properties.lastPagedAt = 0;
      query.isFiring = false;

      el._handleScroll();
      expect(query.update).toHaveBeenCalledWith({paginationWindow: jasmine.any(Number)});
      query.update.calls.reset();


      query.isFiring = true;
      el._handleScroll();
      expect(query.update).not.toHaveBeenCalled();
      query.isFiring = false;

      el.properties.delayedPagingTimeout = 1;
      el._handleScroll();
      expect(query.update).not.toHaveBeenCalled();
      el.properties.delayedPagingTimeout = 0;

      el.properties.isSelfScrolling = true;
      el._handleScroll();
      expect(query.update).not.toHaveBeenCalled();
      el.properties.isSelfScrolling = false;

      el.properties.isSelfScrolling = true;
      el.properties.lastScroll = el.scrollTop + 1;
      el._handleScroll();
      expect(query.update).toHaveBeenCalledWith({paginationWindow: jasmine.any(Number)});
      el.properties.lastScroll = 0;
      el.properties.isSelfScrolling = false;
      query.update.calls.reset();

      el.properties.lastPagedAt = Date.now();
      el._handleScroll();
      expect(query.update).not.toHaveBeenCalled();
      el.properties.lastPagedAt = 0;

      el.properties.delayedPagingTimeout = 0;
      el._handleScroll();
      expect(query.update).toHaveBeenCalledWith({paginationWindow: jasmine.any(Number)});
    });

    it("Should schedule a query update", function() {
      spyOn(query, 'update');
      spyOn(el, '_shouldPage').and.returnValue(true);
      el.properties.isSelfScrolling = false;
      el.properties.lastScroll = 0;
      el.properties.delayedPagingTimeout = 0;
      el.properties.lastPagedAt = Date.now() - 500;
      query.isFiring = false;

      el._handleScroll();
      expect(query.update).not.toHaveBeenCalled();
      el._handleScroll();
      el._handleScroll();
      jasmine.clock().tick(2000);
      expect(query.update).toHaveBeenCalledWith({paginationWindow: jasmine.any(Number)});
      expect(query.update.calls.count()).toEqual(1);
    });

    it("Should enable stuckToBottom if user scrolls to bottom", function() {
      el.properties.stuckToBottom = false;
      el.scrollTop = 100000;
      el._handleScroll();
      expect(el.properties.stuckToBottom).toBe(true);
    });

    it("Should check visibility after scrolling", function() {
      spyOn(el, "_checkVisibility");
      el._handleScroll();
      expect(el._checkVisibility).toHaveBeenCalledWith();
    });
  });

  describe("The scrollTo() method", function() {
    it("Should scroll to the specified position", function() {
      el.scrollTo(55);
      expect(el.scrollTop).toEqual(55);
    });

    it("Should check for visibility", function() {
      spyOn(el, "_checkVisibility");
      el.scrollTo(55);
      jasmine.clock().tick(500);
      expect(el._checkVisibility).toHaveBeenCalledWith();
    });

    it("Should not cause paging of the query", function() {
      spyOn(query, "update");
      el.scrollTo(55);
      jasmine.clock().tick(500);
      expect(query.update).not.toHaveBeenCalled();
    });
  });

  describe("The animateScrollTo() method", function() {
    beforeEach(function() {
      jasmine.clock().uninstall();
    });

    it("Should scroll to the specified position", function(done) {
      el.animateScrollTo(55);
      setTimeout(function() {
        expect(el.scrollTop).toEqual(55);
        done();
      }, 1000);
    });

    it("Should check for visibility", function(done) {
      spyOn(el, "_checkVisibility");
      el.animateScrollTo(55);
      setTimeout(function() {
        expect(el._checkVisibility).toHaveBeenCalledWith();
        done();
      }, 1000);
    });

    it("Should not cause paging of the query", function(done) {
      spyOn(query, "update");
      el.animateScrollTo(55);
      setTimeout(function() {
        expect(query.update).not.toHaveBeenCalled();
        done();
      }, 1000);
    });
  });

  describe("The _checkVisibility() method", function() {
    var restoreFunc = window.layerUI.isInBackground;
    beforeEach(function() {
      query.data.forEach(function(message) {
        message.isRead = false;
      });
      window.layerUI.isInBackground = function() {return false;};
    });

    afterEach(function() {
      window.layerUI.isInBackground = restoreFunc;
    });

    it("Should mark visible messages as read", function() {
      el.scrollTo(0);
      el._checkVisibility();
      jasmine.clock().tick(10000);
      var items = el.querySelectorAllArray('layer-message-item');
      items.forEach(function(messageRow) {
        expect(messageRow.item.isRead).toBe(messageRow.offsetTop + messageRow.clientHeight < el.clientHeight + el.offsetTop);
      });
    });

    it("Should mark visible messages as read part 2", function() {
      el.scrollTo(100);
      jasmine.clock().tick(10000);
      var items = el.querySelectorAllArray('layer-message-item');
      items.forEach(function(messageRow) {
        if (messageRow.offsetTop - el.offsetTop < el.scrollTop) {
          expect(messageRow.item.isRead).toBe(false);
        } else if (messageRow.offsetTop + messageRow.clientHeight < el.clientHeight + el.offsetTop + el.scrollTop) {
          expect(messageRow.item.isRead).toBe(true);
        } else {
          expect(messageRow.item.isRead).toBe(false);
        }
      });
    });


    it("Should mark visible messages as read part 3", function() {
      el.scrollTo(10000);
      jasmine.clock().tick(10000);
      var items = el.querySelectorAllArray('layer-message-item');
      items.forEach(function(messageRow) {
        if (messageRow.offsetTop - el.offsetTop < el.scrollTop) {
          expect(messageRow.item.isRead).toBe(false);
        } else if (messageRow.offsetTop + messageRow.clientHeight <= el.clientHeight + el.offsetTop + el.scrollTop) {
          expect(messageRow.item.isRead).toBe(true);
        } else {
          expect(messageRow.item.isRead).toBe(false);
        }
      });
    });
  });

  describe("The _markAsRead() method", function() {
    it("Should mark the first message as read", function() {
      el.childNodes[2].item.isRead = false;
      el.scrollTop = 0;
      el._markAsRead(el.childNodes[2]);
      expect(el.childNodes[2].item.isRead).toBe(true);
    });

    it("Should not mark the first message as read if scrolled partially out of view", function() {
      el.childNodes[2].item.isRead = false;
      el.scrollTop = 40;
      el._markAsRead(el.childNodes[2]);
      expect(el.childNodes[2].item.isRead).toBe(false);
    });

    it("Should  mark the 50th message as read if scrolled into view", function() {
      el.childNodes[50].item.isRead = false;
      el.scrollTop = el.childNodes[50].offsetTop - el.offsetTop - 50;
      el._markAsRead(el.childNodes[50]);
      expect(el.childNodes[50].item.isRead).toBe(true);
    });

    it("Should  mark the 50th message as read if scrolled above the item", function() {
      el.childNodes[50].item.isRead = false;
      el.scrollTop = 0;
      el._markAsRead(el.childNodes[50]);
      expect(el.childNodes[50].item.isRead).toBe(false);
    });

    it("Should  mark the 50th message as read if scrolled below the item", function() {
      el.childNodes[50].item.isRead = false;
      el.scrollTop = el.childNodes[50].offsetTop + el.scrollHeight;
      el._markAsRead(el.childNodes[50]);
      expect(el.childNodes[50].item.isRead).toBe(false);
    });
  });

  describe("The _generateItem() method", function() {
    it("Should return a layer-message-item", function() {
      var m = conversation.createMessage("m?");
      expect(el._generateItem(m).tagName).toEqual('LAYER-MESSAGE-ITEM');
    });

    it("Should set a suitable _contentTag", function() {
      var handlers = window.layerUI.handlers;
      window.layerUI.handlers = [
        {
          handlesMessage: jasmine.createSpy('handlesNo').and.returnValue(false),
          tagName: "frodo-dom"
        },
        {
          handlesMessage: jasmine.createSpy('handlesYes').and.returnValue(true),
          tagName: "sauron-dom"
        }
      ];
      var m = conversation.createMessage("m?");
      expect(el._generateItem(m)._contentTag).toEqual('sauron-dom');
      window.layerUI.handlers = handlers;
    });

    it("Should setup dateRenderer and messageStatusRenderer", function() {
      var dateRenderer = jasmine.createSpy('dateRenderer');
      var messageStatusRenderer = jasmine.createSpy('messageStatusRenderer');
      el.dateRenderer = dateRenderer;
      el.messageStatusRenderer = messageStatusRenderer;

      var m = conversation.createMessage("m?");
      var item = el._generateItem(m);
      expect(item.dateRenderer).toBe(dateRenderer);
      expect(item.messageStatusRenderer).toBe(messageStatusRenderer);
    });

    it("Should return layer-message-unknown if no handlers", function() {
      var m = conversation.createMessage({
        parts: {
          body: "m?",
          mimeType: "not/handled"
        }
      });

      var generatedItem = el._generateItem(m);
      expect(generatedItem.tagName).toEqual('LAYER-MESSAGE-ITEM');
      generatedItem.item = m;
      expect(generatedItem.nodes.content.firstChild.tagName).toEqual('LAYER-MESSAGE-UNKNOWN');
    });
  });

  describe("The _inSameGroup() method", function() {
    it("Should return true if same sender and within layerUI.settings.messageGroupTimeSpan seconds", function() {
      var m1 = conversation.createMessage("m1");
      var m2 = conversation.createMessage("m1");
      m1.sentAt = new Date();
      m2.sentAt = new Date();
      m2.sentAt.setSeconds(m2.sentAt.getSeconds() + layerUI.settings.messageGroupTimeSpan/1000 - 1);
      expect(el._inSameGroup(m1, m2)).toBe(true);
    });

    it("Should return false if the senders do not match", function() {
      var m1 = conversation.createMessage("m1");
      var m2 = conversation.createMessage("m2");
      m1.sentAt = new Date();
      m2.sentAt = new Date();
      m2.sender = user1;
      expect(el._inSameGroup(m1, m2)).toBe(false);
    });

    it("Should return false if outside of layerUI.settings.messageGroupTimeSpan seconds", function() {
      var m1 = conversation.createMessage("m1");
      var m2 = conversation.createMessage("m1");
      m1.sentAt = new Date();
      m2.sentAt = new Date();
      m2.sentAt.setSeconds(m2.sentAt.getSeconds() + layerUI.settings.messageGroupTimeSpan/1000 + 10);
      expect(el._inSameGroup(m1, m2)).toBe(false);
    });
  });

  describe("The _processAffectedWidgetsCustom() method", function() {
    var m1, m2, m3, m4, m5;
    beforeEach(function() {
      m1 = el.childNodes[50];
      m2 = el.childNodes[51];
      m3 = el.childNodes[52];
      m4 = el.childNodes[53];
      m5 = el.childNodes[54];
      m1.firstInSeries = m1.lastInSeries = false;
      m2.firstInSeries = m2.lastInSeries = false;
      m3.firstInSeries = m3.lastInSeries = false;
      m4.firstInSeries = m4.lastInSeries = false;
      m5.firstInSeries = m5.lastInSeries = false;
    });

    it("Should set firstInSeries for the first item is isTopItemNew", function() {
      el._processAffectedWidgetsCustom([m1, m2, m3, m4, m5], true);
      expect(m1.firstInSeries).toBe(true);
    });

    it("Should not set firstInSeries for the first item is not isTopItemNew", function() {
      el._processAffectedWidgetsCustom([m1, m2, m3, m4, m5], false);
      expect(m1.firstInSeries).toBe(false);
    });

    it("Should nto set lastInSeries for any item having a nextSibling", function() {
      el._processAffectedWidgetsCustom([m1, m2, m3, m4, m5], false);
      expect(m1.lastInSeries).toBe(false);
    });

    it("Should set lastInSeries for any item lacking a nextSibling", function() {
      while (el.childNodes[55]) el.removeChild(el.childNodes[55]);
      el._processAffectedWidgetsCustom([m1, m2, m3, m4, m5], false);
      expect(m5.lastInSeries).toBe(true);
    });

    it("Should set lastInSeries for any item that is not in the same group as the next item", function() {
      m3.item.sender = user1;
      m4.item.sender = user1;
      el._processAffectedWidgetsCustom([m1, m2, m3, m4, m5], false);
      expect(m1.lastInSeries).toBe(false);
      expect(m2.lastInSeries).toBe(true);
      expect(m3.lastInSeries).toBe(false);
      expect(m4.lastInSeries).toBe(true);
      expect(m5.lastInSeries).toBe(false);
    });

    it("Should set firstInSeries for any item following an item that is not in the same group", function() {
      m3.item.sender = user1;
      el._processAffectedWidgetsCustom([m1, m2, m3, m4, m5], false);
      expect(m1.firstInSeries).toBe(false);
      expect(m2.firstInSeries).toBe(false);
      expect(m3.firstInSeries).toBe(true);
      expect(m4.firstInSeries).toBe(true);
      expect(m5.firstInSeries).toBe(false);
    });
  });

  describe("The _rerender() method", function() {
    it("Should update isEmptyList", function() {
      el.isEmptyList = true;
      el._rerender({});
      expect(el.isEmptyList).toBe(false);

      el.query.data = [];
      el._rerender({});
      expect(el.isEmptyList).toBe(true);

      el.isEmptyList = false;
      el.query.data = [];
      el._rerender({type: "reset"});
      expect(el.isEmptyList).toBe(false);
    });
    it("Should call _processQueryEvt", function() {
      spyOn(el, "_processQueryEvt");
      var evt = {hey: "ho"};
      el._rerender(evt);
      expect(el._processQueryEvt).toHaveBeenCalledWith(evt);
    });
  });

  describe("The _renderResetData() method", function() {
    it("Should reset listData", function() {
      el.properties.listData = query.data;
      query.reset();
      expect(el.properties.listData.length).toEqual(0);
      expect(query.data).not.toBe(el.properties.listData);
    });

    it("Should reset the scroll position", function() {
      el.scrollTop = 100;
      expect(el.scrollTop > 0).toBe(true);
      query.reset();
      expect(el.scrollTop > 0).toBe(false);
    });

    it("Should empty the list of items, but still contain a loadingIndicator node", function() {
      el._render();
      jasmine.clock().tick(150);
      expect(el.childNodes.length > 2).toBe(true);
      query.reset();
      expect(el.childNodes.length > 2).toBe(false);
      expect(el.childNodes[1].classList.contains('layer-load-indicator')).toBe(true);
    });

    it("Should reset assorted state", function() {
      el.properties.stuckToBottom = false;
      el.properties.lastPagedAt = 5;
      el.properties.isSelfScrolling = true;
      el.properties.lastScroll = 5;
      query.reset();
      expect(el.properties.stuckToBottom).toEqual(true);
      expect(el.properties.lastPagedAt).toEqual(0);
      expect(el.properties.isSelfScrolling).toEqual(false);
      expect(el.properties.lastScroll).toEqual(0);
    });
  });


  describe("The _renderWithoutRemovedData() method", function() {
    it("Should update listData", function() {
      var queryData = query.data.reverse();
      var initialLength = query.data.length;
      expect(initialLength).toEqual(el.properties.listData.length);

      expect(el.properties.listData).toEqual(queryData);
      expect(el.properties.listData).not.toBe(queryData);
      spyOn(el, '_renderWithoutRemovedData').and.callThrough();

      // Run
      queryData[5].destroy();
      jasmine.clock().tick(1);
      queryData = query.data.reverse();

      // Posttest
      expect(el._renderWithoutRemovedData).toHaveBeenCalled();
      expect(el.properties.listData).toEqual(queryData);
      expect(el.properties.listData).not.toBe(query.data);
      expect(initialLength).toEqual(el.properties.listData.length + 1);
    });

    it("Should call _gatherAndProcessAffectedItems with 3 items before and 3 after the removed item", function() {
      spyOn(el, "_gatherAndProcessAffectedItems");
      var queryData = [].concat(query.data).reverse();

      // Run
      queryData[5].destroy();
      jasmine.clock().tick(1);

      // Posttest
      expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
        queryData[2],
        queryData[3],
        queryData[4],
        queryData[6],
        queryData[7],
        queryData[8]], false);
    });

    it("Should remove the item from the list", function() {
      var queryData = [].concat(query.data).reverse();
      var mid5 = queryData[5].id;
      var midNext = queryData[6].id;
      expect(el.childNodes[7].item.id).toEqual(mid5);

      // Run
      queryData[5].destroy();
      jasmine.clock().tick(1);

      // Posttest
      expect(el.childNodes[7].item.id).toEqual(midNext);
    });
  });

  describe("The _renderInsertedData() method", function() {
    it("Should update listData", function() {
      var message = conversation.createMessage("What the???");
      message.position = conversation.lastMessage.position + 1;
      query._handleMessageAddEvent({
        messages: [
          message
        ]
      });

      // Posttest
      expect(el.properties.listData[el.properties.listData.length - 1]).toBe(message);
    });

    it("Should insert a list item at the proper index", function() {
      var message = conversation.createMessage("What the???");
      query.data.splice(20, 0, message);
      query._triggerChange({
        type: 'insert',
        index: 20,
        target: message,
        query: query
      });

      // Posttest
      var newElement = el.querySelector('#' + el._getItemId(message));
      expect(newElement.item).toBe(message);
      expect(newElement).toBe(el.childNodes[80 + 2]); // + 2 for loadingIndicator and emptyNode
    });

    it("Should call _gatherAndProcessAffectedItems on 3 items before and 3 items after the inserted item", function() {
      spyOn(el, "_gatherAndProcessAffectedItems");
      var message = conversation.createMessage("What the???");
      var queryData = [].concat(query.data).reverse();

      // Run
      query.data.splice(20, 0, message);
      query._triggerChange({
        type: 'insert',
        index: 20,
        target: message,
        query: query
      });
      var queryData = [].concat(query.data).reverse();

      // Posttest
      expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
        queryData[80-3],
        queryData[80-2],
        queryData[80-1],
        queryData[80],
        queryData[80+1],
        queryData[80+2],
        queryData[80+3]
      ], false);
    });

    it("Should call _gatherAndProcessAffectedItems with isTopNewItem as false if index < last", function() {
      spyOn(el, "_gatherAndProcessAffectedItems");
      var message = conversation.createMessage("What the???");
      var queryData = [].concat(query.data).reverse();

      // Run
      query.data.splice(20, 0, message);
      query._triggerChange({
        type: 'insert',
        index: 20,
        target: message,
        query: query
      });
      var queryData = [].concat(query.data).reverse();

      // Posttest
      expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
        queryData[80-3],
        queryData[80-2],
        queryData[80-1],
        queryData[80],
        queryData[80+1],
        queryData[80+2],
        queryData[80+3]
      ], false);
    });

    it("Should call _gatherAndProcessAffectedItems with isTopNewItem as true if index === last", function() {
      spyOn(el, "_gatherAndProcessAffectedItems");
      var message = conversation.createMessage("What the???");
      var queryData = [].concat(query.data).reverse();

      // Run
      query.data.push(message);
      query._triggerChange({
        type: 'insert',
        index: query.data.length - 1,
        target: message,
        query: query
      });
      queryData = [].concat(query.data).reverse();

      // Posttest
      expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
        queryData[0],
        queryData[1],
        queryData[2],
        queryData[3]
      ], true);
    });

    it("Should call _updateLastMessageSent", function() {
      var message = conversation.createMessage("What the???");
      spyOn(el, "_updateLastMessageSent");

      // Run
      query.data.push(message);
      query._triggerChange({
        type: 'insert',
        index: query.data.length - 1,
        target: message,
        query: query
      });

      // Posttest
      expect(el._updateLastMessageSent).toHaveBeenCalledWith();
    });

    it("Should scroll to bottom if stuck to bottom and new item is bottom", function() {
      var message = conversation.createMessage("What the???");
      el.properties.stuckToBottom = true;
      spyOn(el, "animateScrollTo");
      // Run
      query.data.push(message);
      query._triggerChange({
        type: 'insert',
        index: query.data.length - 1,
        target: message,
        query: query
      });

      // Posttest
      expect(el.animateScrollTo).toHaveBeenCalledWith(el.scrollHeight - el.clientHeight);
    });

    it("Should _checkVisibility rather than scroll if not stuck to bottom", function() {
      var message = conversation.createMessage("What the???");
      spyOn(el, "_checkVisibility");
      el.properties.stuckToBottom = false;
      el.scrollTop = 10;

      // Run
      query.data.push(message);
      query._triggerChange({
        type: 'insert',
        index: query.data.length - 1,
        target: message,
        query: query
      });

      // Posttest
      expect(el.scrollTop).toEqual(10);
      expect(el._checkVisibility).toHaveBeenCalledWith();
    });
  });

  describe("The _updateLastMessageSent() method", function() {
    it("Should insure only the last message sent has this class set", function() {
      query.data[0].sender = user1;
      el._render();
      jasmine.clock().tick(150);

      el.querySelectorAllArray('.layer-last-message-sent').forEach(function(node) {
        node.classList.remove('layer-last-message-sent');
      });
      expect(el.querySelectorAllArray('.layer-last-message-sent')).toEqual([]);
      el.childNodes[50].classList.add('layer-last-message-sent');

      // Run
      el._updateLastMessageSent();

      // Posttest
      expect(el.querySelectorAllArray('.layer-last-message-sent')).toEqual([el.childNodes[el.childNodes.length - 2]]);
    });
  });

  describe("The _findFirstVisibleItem() method", function() {
    it("Should return first item", function() {
      el.scrollTop = 0;
      expect(el._findFirstVisibleItem()).toBe(el.childNodes[2]);
    });

    it("Should return second item", function() {
      el.scrollTo(el.childNodes[3].offsetTop + el.childNodes[0].offsetTop);
      expect(el._findFirstVisibleItem()).toBe(el.childNodes[3]);
    });

    it("Should return third item", function() {
      el.scrollTo(el.childNodes[4].offsetTop + el.childNodes[0].offsetTop);
      expect(el._findFirstVisibleItem()).toBe(el.childNodes[4]);
    });
  });

  describe("The _renderPagedData() method", function() {
    it("Should update lastPagedAt and listData", function() {
      el.properties.lastPagedAt = 0;
      var messages = [conversation.createMessage("mm 0"), conversation.createMessage("mm 1")];
      expect(el.properties.listData.length).toEqual(100);
      query.data.push(messages[1]);
      query.data.push(messages[0]);
      el._renderPagedData({type: 'data', data: messages});
      jasmine.clock().tick(1000);
      expect(el.properties.lastPagedAt > 0).toBe(true);
      expect(el.properties.listData.length).toEqual(102);
    });

    it("Should call _renderPagedDataDone with top 3 items and two new items", function() {
      spyOn(el, "_renderPagedDataDone");
      var messages = [conversation.createMessage("mm 0"), conversation.createMessage("mm 1")];
      var affectedItems = [messages[1], messages[0], el.childNodes[2].item, el.childNodes[3].item, el.childNodes[4].item];
      el._renderPagedData({type: 'data', data: messages});
      jasmine.clock().tick(1000);
      expect(el._renderPagedDataDone).toHaveBeenCalledWith(affectedItems, jasmine.any(DocumentFragment), {type: 'data', data: messages});
    });

    it("Should do nothing if no data received", function() {
      el.properties.lastPagedAt = 0;
      spyOn(el, "_renderPagedDataDone");
      el._renderPagedData({type: 'data', data: []});
      jasmine.clock().tick(1000);
      expect(el._renderPagedDataDone).not.toHaveBeenCalled();
      expect(el.properties.lastPagedAt).toBe(0);
    });
  });

  describe("The _renderPagedDataDone() method", function() {
    it("Should call processAffectedWidgets with widgets found in both the Fragment and the List", function() {
      var messages = [conversation.createMessage("mm 0"), conversation.createMessage("mm 1")];
      var fragment = el._generateFragment(messages);
      spyOn(el, "_processAffectedWidgets");
      el._renderPagedDataDone([query.data[99], query.data[98], messages[0], messages[1]], fragment, {type: 'data', data: messages});
      expect(el._processAffectedWidgets).toHaveBeenCalledWith(jasmine.arrayContaining([el.childNodes[2], el.childNodes[3], el.childNodes[4], el.childNodes[4]]), true);
    });

    it("Should insert the Document Fragment just after the loading indicator", function() {
      var messages = [conversation.createMessage("mm 0"), conversation.createMessage("mm 1")];
      var fragment = el._generateFragment(messages);
      el._renderPagedDataDone([query.data[99], query.data[98], messages[0], messages[1]], fragment, {type: 'data', data: messages});
      expect(el.childNodes[1].classList.contains('layer-load-indicator')).toBe(true);
      expect(el.childNodes[2].item).toBe(messages[0]);
    });

    it("Should scroll to bottom if stuck to bottom", function() {
      el.scrollTop = 0;
      el.properties.stuckToBottom = true;
      spyOn(el, "scrollTo");
      var messages = [conversation.createMessage("mm 0"), conversation.createMessage("mm 1")];
      var fragment = el._generateFragment(messages);
      el._renderPagedDataDone([query.data[99], query.data[98], messages[0], messages[1]], fragment, {type: 'data', data: messages});
      expect(el.scrollTo).toHaveBeenCalledWith(el.scrollHeight - el.clientHeight);
    });

    it("Should scroll to the item that was on top of the visible viewport prior to the insertion", function() {
      el.scrollTop = el.childNodes[11].offsetTop - el.firstChild.offsetTop;
      expect(el._findFirstVisibleItem()).toBe(el.childNodes[11]);
      el.properties.stuckToBottom = false;
      spyOn(el, "scrollTo");
      var messages = [conversation.createMessage("mm 0"), conversation.createMessage("mm 1")];
      var fragment = el._generateFragment(messages);
      el._renderPagedDataDone([query.data[99], query.data[98], messages[0], messages[1]], fragment, {type: 'data', data: messages});

      // What was the 11th item is now the 13th item
      expect(el.scrollTo).toHaveBeenCalledWith(el.childNodes[13].offsetTop - el.firstChild.offsetTop);
    });
  });

  describe("The isEmptyList property", function() {
    it("Should initialize to hidden/false", function() {
      expect(el.isEmptyList).toBe(false);
      expect(el.nodes.emptyNode.style.display).toEqual("none");
    });
    it("Should update the display state for emptyNode", function() {
      el.isEmptyList = true;
      expect(el.nodes.emptyNode.style.display).toEqual('');

      el.isEmptyList = false;
      expect(el.nodes.emptyNode.style.display).toEqual('none');
    });
    it("Should reapply its isEmptyList value after _rerender", function() {
      el.isEmptyList = true;
      query.data = [];
      el._rerender({type: "add", messages: []});
      expect(el.nodes.emptyNode.style.display).toEqual('');
    });
  });

  describe("The emptyNode property", function() {
    it("Should add/remove nodes", function() {
      var div = document.createElement("div");
      el.emptyNode = div;
      expect(div.parentNode).toBe(el.nodes.emptyNode);

      var div2 = document.createElement("div");
      el.emptyNode = div2;

      expect(div.parentNode).toBe(null);
      expect(div2.parentNode).toBe(el.nodes.emptyNode);
    });
  });
});