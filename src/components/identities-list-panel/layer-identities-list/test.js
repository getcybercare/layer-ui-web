describe('layer-identities-list', function() {
  var el, testRoot, client, query;

  beforeEach(function(done) {

    client = new layer.Client({
      appId: 'layer:///apps/staging/Fred'
    });
    client.user = new layer.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      displayName: 'Frodo the Dodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-identities-list');
    testRoot.appendChild(el);
    query = client.createQuery({
      model: layer.Query.Identity
    });
    query.isFiring = false;
    query.data = [client.user];
    for (i = 0; i < 100; i++) {
      query.data.push(
        new layer.Identity({
          client: client,
          userId: 'user' + i,
          id: 'layer:///identities/user' + i,
          displayName: 'User ' + i,
          isFullIdentity: true
        })
      );
    }

    el.query = query;
    CustomElements.takeRecords();
    setTimeout(function() {
      done();
    }, 10);
  });

  afterEach(function() {
    try {
      layerUI.settings.appId = null;
      document.body.removeChild(testRoot);
    } catch(e) {}
  });


  describe('Event Handling', function() {
    it("Should call onIdentitySelected when child triggers layer-identity-item-selected", function() {
      var spy = jasmine.createSpy('callback');
      el.onIdentitySelected = spy;
      el.firstChild.trigger('layer-identity-item-selected', {identity: query.data[1]});
      expect(spy).toHaveBeenCalledWith(jasmine.any(CustomEvent));
    });

    it("Should call onIdentityDeselected when child triggers layer-identity-item-deselected", function() {
      var spy = jasmine.createSpy('callback');
      el.selectedIdentities = [query.data[1]];
      el.onIdentityDeselected = spy;
      el.firstChild.trigger('layer-identity-item-deselected', {identity: query.data[1]});
      expect(spy).toHaveBeenCalledWith(jasmine.any(CustomEvent));
    });
  });

  describe("The selectedIdentities property", function() {
    it("Should mark all specified identities as selected", function() {
      el.childNodes[10].selected = true;
      el.childNodes[11].selected = true;
      el.selectedIdentities = [query.data[1], query.data[2]];

      expect(el.childNodes[10].selected).toBe(false);
      expect(el.childNodes[11].selected).toBe(false);
      expect(el.childNodes[1].selected).toBe(true);
      expect(el.childNodes[2].selected).toBe(true);
    });

    it("Should clear all selected identities", function() {
      el.childNodes[10].selected = true;
      el.childNodes[11].selected = true;
      el.selectedIdentities = null;

      expect(el.childNodes[10].selected).toBe(false);
      expect(el.childNodes[11].selected).toBe(false);
    });
  });

  describe("The filter property", function() {
    it("Should call _runFilter when set", function() {
      spyOn(el, "_runFilter");
      el.filter = "User";
      expect(el._runFilter).toHaveBeenCalledWith();
    });
  });

  describe("The created() method", function() {
    it("Should call _updateQuery if there is a queryId passed into the innerHTML", function() {
      testRoot.innerHTML = '<layer-identities-list query-id="' + query.id + '" app-id="' + client.appId + '"></layer-identities-list>';
      CustomElements.takeRecords();
      var el = testRoot.firstChild;
      expect(el.query).toBe(query);
      spyOn(el, "_processQueryEvt"); // _updateQuery sets up the query listener to call _processQueryEvt
      query.trigger('change');
      expect(el._processQueryEvt).toHaveBeenCalled();
    });

    it("Should call render", function() {
      testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
      CustomElements.takeRecords();
      var el = testRoot.firstChild;
      expect(el.nodes.loadIndicator).toEqual(jasmine.any(HTMLElement));
    });

    it("Should wire up _handleIdentitySelect and _handleIdentityDeselect", function() {
      var selectSpy = jasmine.createSpy('select');
      var deselectSpy = jasmine.createSpy('deselect');
      el.addEventListener('layer-identity-selected', selectSpy);
      el.addEventListener('layer-identity-deselected', deselectSpy);

      el.firstChild.trigger('layer-identity-item-selected', {identity: query.data[1]});
      expect(selectSpy).toHaveBeenCalled();
      expect(deselectSpy).not.toHaveBeenCalled();
      selectSpy.calls.reset();

      el.selectedIdentities.push(query.data[1]);
      el.firstChild.trigger('layer-identity-item-deselected', {identity: query.data[1]});
      expect(selectSpy).not.toHaveBeenCalled();
      expect(deselectSpy).toHaveBeenCalled();
    });
  });

  describe("The _handleIdentitySelect() method", function() {
    it("Should add item to selectedIdentities", function() {
      expect(el.selectedIdentities).toEqual([]);
      el.firstChild.trigger('layer-identity-item-selected', {identity: query.data[1]});
      expect(el.selectedIdentities).toEqual([query.data[1]]);
    });

    it("Should call evt.preventDefault if evt.preventDefault and leave selectedIdentities unchanged", function() {
      el.addEventListener('layer-identity-selected', function(evt) {
        expect(evt.preventDefault.calls).toBe(undefined); // Not the spy
        evt.preventDefault();
      });
      var preventDefaultSpy = jasmine.createSpy('preventDefault');
      el._handleIdentitySelect({
        detail: {
          identity: query.data[1]
        },
        stopPropagation: jasmine.createSpy('stopPropagation'),
        preventDefault: preventDefaultSpy
      });
      expect(preventDefaultSpy).toHaveBeenCalledWith();
      expect(el.selectedIdentities).toEqual([]);
    });

    it("Should do nothing if already in the list", function() {
      el.selectedIdentities = [query.data[1]];
      var spy = jasmine.createSpy('select');
      el.addEventListener('layer-identity-selected', spy);
      el._handleIdentitySelect({
        detail: {
          identity: query.data[1]
        },
        stopPropagation: jasmine.createSpy('stopPropagation')
      });
      expect(spy).not.toHaveBeenCalled();
      expect(el.selectedIdentities).toEqual([query.data[1]]);
    });
  });

  describe("The _handleIdentityDeselect() method", function() {
    it("Should remove item from selectedIdentities", function() {
      el.selectedIdentities = [query.data[1]];
      el.firstChild.trigger('layer-identity-item-deselected', {identity: query.data[1]});
      expect(el.selectedIdentities).toEqual([]);
    });

    it("Should call evt.preventDefault if evt.preventDefault and leave selectedIdentities unchanged", function() {
      el.selectedIdentities = [query.data[1]];
      el.addEventListener('layer-identity-deselected', function(evt) {
        expect(evt.preventDefault.calls).toBe(undefined); // Not the spy
        evt.preventDefault();
      });
      var preventDefaultSpy = jasmine.createSpy('preventDefault');
      el._handleIdentityDeselect({
        detail: {
          identity: query.data[1]
        },
        stopPropagation: jasmine.createSpy('stopPropagation'),
        preventDefault: preventDefaultSpy
      });
      expect(preventDefaultSpy).toHaveBeenCalledWith();
      expect(el.selectedIdentities).toEqual([query.data[1]]);
    });

    it("Should do nothing if not in the list", function() {
      el.selectedIdentities = [query.data[1]];
      var spy = jasmine.createSpy('deselect');
      el.addEventListener('layer-identity-deselected', spy);
      el._handleIdentityDeselect({
        detail: {
          identity: query.data[2]
        },
        stopPropagation: jasmine.createSpy('stopPropagation')
      });
      expect(spy).not.toHaveBeenCalled();
      expect(el.selectedIdentities).toEqual([query.data[1]]);
    });
  });

  describe("The _generateItem() method", function() {
    it("Should return a layer-identity-item with an identity setup", function() {
      var result = el._generateItem(query.data[1]);
      expect(result.tagName).toEqual('LAYER-IDENTITY-ITEM');
      expect(result.item).toBe(query.data[1]);
    });

    it("Should set selected state", function() {
      el.selectedIdentities = [query.data[1]];
      var result = el._generateItem(query.data[1]);
      expect(result.selected).toBe(true);

      el.selectedIdentities = [query.data[2]];
      var result = el._generateItem(query.data[1]);
      expect(result.selected).toBe(false);
    });

    it("Should run the filter", function() {
      el.filter = 'Not this again';
      var result = el._generateItem(query.data[1]);
      expect(result.classList.contains('layer-item-filtered')).toBe(true);
    });
  });

  describe("The _processQueryEvt() method", function() {
    it("Should call _processQueryEvt", function() {
      spyOn(el, "_processQueryEvt");
      var evt = {};
      el._rerender(evt);
      expect(el._processQueryEvt).toHaveBeenCalledWith(evt);
    });

    it("Should remove any removed identities from selectedIdentities", function() {
      el.selectedIdentities = [query.data[2], query.data[1], query.data[0]];
      el._rerender({
        type: 'remove',
        target: query.data[1]
      });
      expect(el.selectedIdentities).toEqual([query.data[2], query.data[0]]);
    });

    it("Should reset selectedIdentities when data is reset", function() {
      el.selectedIdentities = [query.data[2], query.data[1], query.data[0]];
      el._rerender({
        type: 'reset'
      });
      expect(el.selectedIdentities).toEqual([]);
    });
  });

  describe("The _renderSelection() method", function() {
    it("Should select and deselect appropriately", function() {
      el.firstChild.selected = true;
      el.childNodes[1].selected = true;
      el.selectedIdentities.pop();
      el.selectedIdentities.pop();
      el.selectedIdentities.push(query.data[5]);
      el.selectedIdentities.push(query.data[6]);

      el._renderSelection();
      expect(el.childNodes[0].innerNode.classList.contains('layer-identity-item-selected')).toBe(false);
      expect(el.childNodes[1].innerNode.classList.contains('layer-identity-item-selected')).toBe(false);
      expect(el.childNodes[5].innerNode.classList.contains('layer-identity-item-selected')).toBe(true);
      expect(el.childNodes[6].innerNode.classList.contains('layer-identity-item-selected')).toBe(true);
    });
  });

  describe("The _runFilter() method", function() {
    it("Should flag all nodes as unfiltered if there is no filter", function() {
      el.childNodes[1].classList.add('layer-item-filtered');
      el.childNodes[2].classList.add('layer-item-filtered');
      el._runFilter('');
      expect(el.querySelectorAllArray('.layer-item-filtered')).toEqual([]);
    });

    it("Should call _runFilter on all children", function() {
      el.childNodes[1].classList.add('layer-item-filtered');
      el.childNodes[2].classList.add('layer-item-filtered');
      el.filter = 'User';
      expect(el.querySelectorAllArray('.layer-item-filtered')).toEqual([el.firstChild]);
    });
  });

  describe("Mixin list", function() {
    describe("Properties", function() {
      it("Should set the query given a queryId and then a client", function() {
        var el = document.createElement('layer-identities-list');
        el.queryId = query.id;
        expect(el.client).toBe(null);
        expect(el.query).toBe(null);
        el.appId = client.appId;
        expect(el.client).toBe(client);
        expect(el.query).toBe(query);
      });

      it("Should set the query given a client and then a queryId", function() {
        var el = document.createElement('layer-identities-list');
        el.appId = client.appId;
        expect(el.client).toBe(client);
        expect(el.query).toBe(null);
        el.queryId = query.id;
        expect(el.client).toBe(client);
        expect(el.query).toBe(query);
      });

      it("Should call render on setting the query", function(done) {
        var el = document.createElement('layer-identities-list');
        spyOn(el, "_render");
        el.query = query;
        setTimeout(function() {
          expect(el._render).toHaveBeenCalledWith();
          done();
        }, 1)
      });

      // Tests call to _rerender as rerender has already been bound to an event before we can test it
      it("Should wire up rerender on setting the query", function() {
        var el = document.createElement('layer-identities-list');
        spyOn(el, "_processQueryEvt");
        el.query = query;
        expect(el._processQueryEvt).not.toHaveBeenCalled();
        query.trigger("change", {type: "data", data: []});
        expect(el._processQueryEvt).toHaveBeenCalledWith(jasmine.any(layer.LayerEvent));
      });

      it("Should add and remove classes on setting isDataLoading", function() {
        expect(el.isDataLoading).toBe(false);
        expect(el.classList.contains('layer-loading-data')).toBe(false);

        el.isDataLoading = true;
        expect(el.classList.contains('layer-loading-data')).toBe(true);

        el.isDataLoading = false;
        expect(el.classList.contains('layer-loading-data')).toBe(false);
      });

      it("Should set onRenderListItem as a string or function", function() {
        el.onRenderListItem = "function(item) {return item.displayName + 'hey ho';}";
        expect(el.onRenderListItem(client.user)).toEqual(client.user.displayName + 'hey ho');

        el.onRenderListItem = function(item) {return item.displayName + 'ho hum';}
        expect(el.onRenderListItem(client.user)).toEqual(client.user.displayName + 'ho hum');
      });


      it("Should destroy the existing query if hasGeneratedQuery is true", function() {
        el.client = client;
        var query2 = client.createQuery({model: layer.Conversation});
        el.query = query2;
        el.properties.hasGeneratedQuery = true;
        el.query = query;
        expect(query2.isDestroyed).toBe(true);
        expect(el.properties.hasGeneratedQuery).toBe(false);
      });

      it("Should not destroy the existing query if hasGeneratedQuery is false", function() {
        el.client = client;
        var query2 = client.createQuery({model: layer.Conversation});
        el.query = query2;
        el.properties.hasGeneratedQuery = false;
        el.query = query;
        expect(query2.isDestroyed).toBe(false);
        expect(el.properties.hasGeneratedQuery).toBe(false);
        query2.destroy();
      });
    });

    describe("The created() method", function() {
      it("Should wire up the scroll event handler", function(done) {
        el.properties.isSelfScrolling = false;
        spyOn(el, "_throttler").and.callFake(function() {
          expect(true).toBe(true);
          done();
        });;
        el.style.height = "100px";
        el.style.overflow = "auto";
        el.scrollTop = 500;
      });

      it("Should initialize listData", function() {
        var el = document.createElement('layer-identities-list');
        expect(el.properties.listData).toEqual([]);
      });
    });

    describe("The _onScroll() method", function() {
      it("Should call evt.preventDefault if selfScrolling", function() {
        var evt = {
          preventDefault: jasmine.createSpy('preventDefault')
        };

        el.properties.isSelfScrolling = false;
        el._onScroll(evt);
        expect(evt.preventDefault).not.toHaveBeenCalled();

        el.properties.isSelfScrolling = true;
        el._onScroll(evt);
        expect(evt.preventDefault).toHaveBeenCalledWith();
      });

      it("Should call _throttler with _handleScroll if not selfScrolling", function() {
        spyOn(el, "_throttler");
        spyOn(el, "_handleScroll");
        var evt = {
          preventDefault: jasmine.createSpy('preventDefault')
        };

        el.properties.isSelfScrolling = true;
        el._onScroll(evt);
        expect(el._throttler).not.toHaveBeenCalled();

        el.properties.isSelfScrolling = false;

        el._onScroll(evt);
        expect(el._throttler).toHaveBeenCalled();
        expect(el._handleScroll).not.toHaveBeenCalled();

        // Find out what function was passed
        el._throttler.calls.allArgs()[0][0]();
        expect(el._handleScroll).toHaveBeenCalled();
      });
    });

    describe("The throttle() method", function() {
      it("Should schedule a call to perform an action", function(done) {
        var spy = jasmine.createSpy("hello");
        el._throttler(spy);
        expect(spy).not.toHaveBeenCalled();
        setTimeout(function() {
          expect(spy).toHaveBeenCalled();
          done();
        }, 100);
      });

      it("Should do nothing if its already scheduled", function() {
        jasmine.clock().install();
        var el = document.createElement('layer-identities-list');
        el.query = query;
        var spy = jasmine.createSpy("hello");
        el._throttler(spy);
        jasmine.clock().tick(50);
        expect(spy).not.toHaveBeenCalled();
        el._throttler(spy);
        el._throttler(spy);
        el._throttler(spy);
        expect(spy).not.toHaveBeenCalled();

        jasmine.clock().tick(50);
        expect(spy.calls.count()).toEqual(1);
        jasmine.clock().tick(5000);
        expect(spy.calls.count()).toEqual(1);
        jasmine.clock().uninstall();
      });
    });

    describe("The _handleScroll() method", function() {
      it("Should page the query if near the bottom of the list", function() {
        el.pageSize = 31;
        var initialWindow = query.paginationWindow;
        el.style.height = "100px";
        el.style.overflow = "auto";
        el.scrollTop = el.scrollHeight - el.clientHeight;
        spyOn(query, "update");
        el._handleScroll();
        expect(query.update).toHaveBeenCalledWith({paginationWindow: initialWindow + 31});
      });

      it("Should set isDataLoading if the query is firing after updating pagination", function() {
        el.style.height = "100px";
        el.style.overflow = "auto";
        expect(el.isDataLoading).toBe(false);
        el.scrollTop = el.scrollHeight - el.clientHeight;
        query.isFiring = true;
        el._handleScroll();
        expect(el.isDataLoading).toBe(true);

      });

      it("Should not page the query if far from the bottom of the list", function() {
        el.pageSize = 31;
        el.style.height = "100px";
        el.style.overflow = "auto";
        el.scrollTop = 20;
        spyOn(query, "update");
        el._handleScroll();
        expect(query.update).not.toHaveBeenCalled();
      });
    });

    describe("The render() method", function() {
      it("Should set the loadIndicator to an element in the widget", function() {
        el.nodes.loadIndicator = null;
        el._render();
        expect(el.nodes.loadIndicator.classList.contains('layer-load-indicator')).toBe(true);
      });

      it("Should call rerender if there is query data", function() {
        spyOn(el, '_rerender');
        el._render();
        expect(el._rerender).toHaveBeenCalledWith({type: 'data', data: query.data});
        el._rerender.calls.reset();

        query.data = [];
        el._render();
        expect(el._rerender).not.toHaveBeenCalled();
      });
    });

    describe("The _generateFragment() method", function() {
      it("Should generate a fragment if needed", function() {
        expect(el._generateFragment([client.user])).toEqual(jasmine.any(DocumentFragment));
      });

      it("Should use the provided fragment", function() {
        var fragment = document.createDocumentFragment();
        expect(el._generateFragment([client.user], fragment)).toBe(fragment);
        expect(fragment.childNodes.length > 0).toBe(true);
      });

      it("Should call _generateFragmentItem for each data result", function() {
        spyOn(el, "_generateFragmentItem");
        el._generateFragment(query.data);
        expect(el._generateFragmentItem.calls.count()).toEqual(query.data.length);
        expect(el._generateFragmentItem).toHaveBeenCalledWith(query.data[23], jasmine.any(DocumentFragment));
      });
    });

    describe("The _generateFragmentItem() method", function() {
      it("Should create a widget via _generateItem and add it to the fragment", function() {
        spyOn(el, "_generateItem").and.callThrough();
        var fragment = document.createDocumentFragment();
        el._generateFragmentItem(client.user, fragment);
        expect(el._generateItem).toHaveBeenCalledWith(client.user);
        expect(fragment.childNodes[0].tagName).toEqual('LAYER-IDENTITY-ITEM');
        expect(fragment.childNodes[0].item).toBe(client.user);
      });

      it("Should create a widget by ID via _generateItem and add it to the fragment", function() {
        spyOn(el, "_generateItem").and.callThrough();
        var fragment = document.createDocumentFragment();
        el._generateFragmentItem({id: client.user.id}, fragment);
        expect(el._generateItem).toHaveBeenCalledWith(client.user);
        expect(fragment.childNodes[0].tagName).toEqual('LAYER-IDENTITY-ITEM');
        expect(fragment.childNodes[0].item).toBe(client.user);
      });

      it("Should do nothing if item not found", function() {
        spyOn(el, "_generateItem").and.callThrough();
        var fragment = document.createDocumentFragment();
        el._generateFragmentItem({id: client.user.id + 'a'}, fragment);
        expect(el._generateItem).not.toHaveBeenCalled();
        expect(fragment.childNodes.length).toEqual(0);
      });


    });

    describe("The _gatherAndProcessAffectedItems() method", function() {
      beforeEach(function() {
        el._render();
      });

      it("Should find all matching items and call processAffectedWidgets on them", function() {
        spyOn(el, "_processAffectedWidgets");
        el._gatherAndProcessAffectedItems([query.data[5], query.data[10]], false);
        expect(el._processAffectedWidgets).toHaveBeenCalledWith([el.childNodes[5], el.childNodes[10]], false);
      });
    });

    describe("The _processAffectedWidgets() method", function() {
      beforeEach(function() {
        el._render();
      });

      it("Should call _processAffectedWidgetsCustom with the correct firstIndex", function() {
        spyOn(el, "_processAffectedWidgetsCustom");
        el._processAffectedWidgets([el.childNodes[5], el.childNodes[10]], false);
        expect(el._processAffectedWidgetsCustom).toHaveBeenCalledWith([el.childNodes[5], el.childNodes[10]], 5, false);
      });

      it("Should call onRenderListItem on each item", function() {
        el.onRenderListItem = jasmine.createSpy('renderItem');
        el._processAffectedWidgets([el.childNodes[5], el.childNodes[10]], false);
        expect(el.onRenderListItem.calls.count()).toBe(2);
        expect(el.onRenderListItem).toHaveBeenCalledWith(el.childNodes[5], el.properties.listData, 5, false);
        expect(el.onRenderListItem).toHaveBeenCalledWith(el.childNodes[10], el.properties.listData, 6, false);
      });
    });

    describe("The _processQueryEvt() method", function() {
      beforeEach(function() {
        spyOn(el, "_renderPagedData");
        spyOn(el, "_renderInsertedData");
        spyOn(el, "_renderWithoutRemovedData");
        spyOn(el, "_renderResetData");
        spyOn(el, "_renderMovedData");
      });
      it("Should only call _renderPagedData for data event", function() {
        var evt = {type: 'data'};
        el._processQueryEvt(evt);
        expect(el._renderPagedData).toHaveBeenCalledWith(evt);
        expect(el._renderInsertedData).not.toHaveBeenCalled();
        expect(el._renderWithoutRemovedData).not.toHaveBeenCalled();
        expect(el._renderResetData).not.toHaveBeenCalled();
        expect(el._renderMovedData).not.toHaveBeenCalled();
      });

      it("Should only call _renderInsertedData for insert event", function() {
        var evt = {type: 'insert'};
        el._processQueryEvt(evt);
        expect(el._renderInsertedData).toHaveBeenCalledWith(evt);
        expect(el._renderPagedData).not.toHaveBeenCalled();
        expect(el._renderWithoutRemovedData).not.toHaveBeenCalled();
        expect(el._renderResetData).not.toHaveBeenCalled();
        expect(el._renderMovedData).not.toHaveBeenCalled();
      });

      it("Should only call _renderWithoutRemovedData for remove event", function() {
        var evt = {type: 'remove'};
        el._processQueryEvt(evt);
        expect(el._renderWithoutRemovedData).toHaveBeenCalledWith(evt);
        expect(el._renderPagedData).not.toHaveBeenCalled();
        expect(el._renderInsertedData).not.toHaveBeenCalled();
        expect(el._renderResetData).not.toHaveBeenCalled();
        expect(el._renderMovedData).not.toHaveBeenCalled();
      });

      it("Should only call _renderResetData for reset event", function() {
        var evt = {type: 'reset'};
        el._processQueryEvt(evt);
        expect(el._renderResetData).toHaveBeenCalledWith();
        expect(el._renderPagedData).not.toHaveBeenCalled();
        expect(el._renderInsertedData).not.toHaveBeenCalled();
        expect(el._renderWithoutRemovedData).not.toHaveBeenCalled();
        expect(el._renderMovedData).not.toHaveBeenCalled();
      });

      it("Should only call _renderMovedData for move event", function() {
        var evt = {type: 'move'};
        el._processQueryEvt(evt);
        expect(el._renderResetData).not.toHaveBeenCalledWith();
        expect(el._renderPagedData).not.toHaveBeenCalled();
        expect(el._renderInsertedData).not.toHaveBeenCalled();
        expect(el._renderWithoutRemovedData).not.toHaveBeenCalled();
        expect(el._renderMovedData).toHaveBeenCalledWith(evt);
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
        el.style.height = "100px";
        el.style.overflow = "auto";
        el.scrollTop = 100;
        expect(el.scrollTop > 0).toBe(true);
        query.reset();
        expect(el.scrollTop > 0).toBe(false);
      });

      it("Should empty the list of items, but still contain a loadingIndicator node", function() {
        el._render();
        expect(el.childNodes.length > 1).toBe(true);
        query.reset();
        expect(el.childNodes.length > 1).toBe(false);
        expect(el.firstChild.classList.contains('layer-load-indicator')).toBe(true);
      });
    });


    describe("The _renderWithoutRemovedData() method", function() {
      it("Should update listData", function(done) {
        el._render();
        var initialLength = query.data.length;
        expect(initialLength).toEqual(el.properties.listData.length);
        expect(el.properties.listData).toEqual(query.data);
        expect(el.properties.listData).not.toBe(query.data);
        spyOn(el, '_renderWithoutRemovedData').and.callThrough();

        // Run
        query.data[5].destroy();
        setTimeout(function() {
          expect(el._renderWithoutRemovedData).toHaveBeenCalled();

          // Posttest
          expect(el.properties.listData).toEqual(query.data);
          expect(el.properties.listData).not.toBe(query.data);
          expect(initialLength).toEqual(el.properties.listData.length + 1);
          done();
        }, 10);
      });

      it("Should call _gatherAndProcessAffectedItems with 3 items before and 3 after the removed item", function(done) {
        spyOn(el, "_gatherAndProcessAffectedItems");

        // Run
        query.data[5].destroy();
        setTimeout(function() {

          // Posttest
          expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
            query.data[2],
            query.data[3],
            query.data[4],
            query.data[5],
            query.data[6],
            query.data[7]], false);
          done();
        });
      });

      it("Should remove the item from the list", function(done) {
        el._render();
        var displayName = ">" + query.data[5].displayName + "<";
        expect(el.innerHTML.indexOf(displayName)).not.toEqual(-1);

        // Run
        query.data[5].destroy();

        setTimeout(function() {
          // Posttest
          expect(el.innerHTML.indexOf(displayName)).toEqual(-1);
          done();
        }, 10);
      });
    });

    describe("The _renderInsertedData() method", function() {
      it("Should update listData", function() {
        query._handleIdentityAddEvent({
          identities: [
            new layer.Identity({
              client: client,
              userId: 'user' + 10000,
              id: 'layer:///identities/user' + 10000,
              displayName: 'User ' + 10000,
              isFullIdentity: true
            })
          ]
        });

        // Posttest
        expect(el.properties.listData[el.properties.listData.length - 1]).toBe(client.getIdentity('layer:///identities/user' + 10000));
      });

      it("Should insert a list item at the proper index", function() {
        var identity = new layer.Identity({
          client: client,
          userId: 'user' + 10000,
          id: 'layer:///identities/user' + 10000,
          displayName: 'User ' + 10000,
          isFullIdentity: true
        });
        query.data.splice(50, 0, identity);
        query._triggerChange({
          type: 'insert',
          index: 50,
          target: identity,
          query: query
        });

        // Posttest
        var newElement = el.querySelector('#' + el._getItemId(identity));
        expect(newElement.item.userId).toEqual("user10000");
        expect(newElement).toBe(el.childNodes[50]);
      });

      it("Should call _gatherAndProcessAffectedItems on 3 items before and 3 items after the inserted item", function() {
        spyOn(el, "_gatherAndProcessAffectedItems");
        var identity = new layer.Identity({
          client: client,
          userId: 'user' + 10000,
          id: 'layer:///identities/user' + 10000,
          displayName: 'User ' + 10000,
          isFullIdentity: true
        });

        // Run
        query.data.splice(50, 0, identity);
        query._triggerChange({
          type: 'insert',
          index: 50,
          target: identity,
          query: query
        });

        // Posttest
        expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
          query.data[50-3],
          query.data[50-2],
          query.data[50-1],
          query.data[50],
          query.data[50+1],
          query.data[50+2],
          query.data[50+3]
        ], false);
      });

      it("Should call _gatherAndProcessAffectedItems with isTopNewItem as false if index > 0", function() {
        spyOn(el, "_gatherAndProcessAffectedItems");
        var identity = new layer.Identity({
          client: client,
          userId: 'user' + 10000,
          id: 'layer:///identities/user' + 10000,
          displayName: 'User ' + 10000,
          isFullIdentity: true
        });

        // Run
        query.data.splice(50, 0, identity);
        query._triggerChange({
          type: 'insert',
          index: 50,
          target: identity,
          query: query
        });

        // Posttest
        expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
          query.data[50-3],
          query.data[50-2],
          query.data[50-1],
          query.data[50],
          query.data[50+1],
          query.data[50+2],
          query.data[50+3]
        ], false);
      });

      it("Should call _gatherAndProcessAffectedItems with isTopNewItem as true if index === 0", function() {
        spyOn(el, "_gatherAndProcessAffectedItems");
        var identity = new layer.Identity({
          client: client,
          userId: 'user' + 10000,
          id: 'layer:///identities/user' + 10000,
          displayName: 'User ' + 10000,
          isFullIdentity: true
        });

        // Run
        query.data.splice(0, 0, identity);
        query._triggerChange({
          type: 'insert',
          index: 0,
          target: identity,
          query: query
        });

        // Posttest
        expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith([
          query.data[0],
          query.data[1],
          query.data[2],
          query.data[3]
        ], true);
      });
    });

    describe("The _renderPagedData() method", function() {
      it("Should update listData", function() {
        spyOn(el, "_renderPagedData").and.callThrough();
        var identities = [
          new layer.Identity({
            client: client,
            userId: 'user' + 10000,
            id: 'layer:///identities/user' + 10000,
            displayName: 'User ' + 10000,
            isFullIdentity: true
          }),
          new layer.Identity({
            client: client,
            userId: 'user' + 10001,
            id: 'layer:///identities/user' + 10001,
            displayName: 'User ' + 10001,
            isFullIdentity: true
          })
        ];

        // Run
        query.data.push(identities[0]);
        query.data.push(identities[1]);
        query._triggerChange({
          type: 'data',
          index: 0,
          data: identities,
          query: query
        });

        // Posttest
        expect(el._renderPagedData).toHaveBeenCalled();
        expect(el.properties.listData[el.properties.listData.length - 2].displayName).toEqual("User 10000");
        expect(el.properties.listData[el.properties.listData.length - 1].displayName).toEqual("User 10001");
      });

      it("Should append all new items just before the loadIndicator", function() {
        var identities = [
          new layer.Identity({
            client: client,
            userId: 'user' + 10000,
            id: 'layer:///identities/user' + 10000,
            displayName: 'User ' + 10000,
            isFullIdentity: true
          }),
          new layer.Identity({
            client: client,
            userId: 'user' + 10001,
            id: 'layer:///identities/user' + 10001,
            displayName: 'User ' + 10001,
            isFullIdentity: true
          })
        ];

        // Run
        query.data.push(identities[0]);
        query.data.push(identities[1]);
        query._triggerChange({
          type: 'data',
          index: 0,
          data: identities,
          query: query
        });

        // Posttest
        expect(el.childNodes[el.childNodes.length - 1]).toBe(el.nodes.loadIndicator);
        expect(el.childNodes[el.childNodes.length - 2].item.displayName).toEqual("User 10001");
      });

      it("Should call _gatherAndProcessAffectedItems on all of the newly added items, plus the prior last 3 items", function() {
        var last3Items = query.data.slice(query.data.length-3, query.data.length);
        expect(last3Items.length).toEqual(3);
        var identities = [
          new layer.Identity({
            client: client,
            userId: 'user' + 10000,
            id: 'layer:///identities/user' + 10000,
            displayName: 'User ' + 10000,
            isFullIdentity: true
          }),
          new layer.Identity({
            client: client,
            userId: 'user' + 10001,
            id: 'layer:///identities/user' + 10001,
            displayName: 'User ' + 10001,
            isFullIdentity: true
          })
        ];
        spyOn(el, "_gatherAndProcessAffectedItems");

        // Run
        query.data.push(identities[0]);
        query.data.push(identities[1]);
        query._triggerChange({
          type: 'data',
          index: 0,
          data: identities,
          query: query
        });

        // Posttest
        expect(el._gatherAndProcessAffectedItems).toHaveBeenCalledWith(last3Items.concat(identities), false);

      });

      it("Should update isDataLoading to match the query firing state, triggering all side effects", function() {
        var last3Items = query.data.slice(query.data.length-3, query.data.length);
        expect(last3Items.length).toEqual(3);
        var identities = [
          new layer.Identity({
            client: client,
            userId: 'user' + 10000,
            id: 'layer:///identities/user' + 10000,
            displayName: 'User ' + 10000,
            isFullIdentity: true
          }),
          new layer.Identity({
            client: client,
            userId: 'user' + 10001,
            id: 'layer:///identities/user' + 10001,
            displayName: 'User ' + 10001,
            isFullIdentity: true
          })
        ];
        spyOn(el, "_gatherAndProcessAffectedItems");

        // Run 1
        query.data.push(identities[0]);
        query.data.push(identities[1]);
        query.isFiring = true;
        query._triggerChange({
          type: 'data',
          index: 0,
          data: identities,
          query: query
        });

        // Posttest
        expect(el.isDataLoading).toBe(true);

        // Run 2
        query.isFiring = false;
        query._triggerChange({
          type: 'data',
          index: 0,
          data: identities,
          query: query
        });

        // Posttest 2
        expect(el.isDataLoading).toBe(false);
      });
    });

    describe("The _renderMovedData() method", function() {
      it("Should move the element to the start of the list", function() {
        expect(el.childNodes[3].item).toBe(query.data[3]);

        el._renderMovedData({
          target: query.data[3],
          fromIndex: 3,
          toIndex: 0
        });
        expect(el.childNodes[0].item).toBe(query.data[3]);
        expect(el.childNodes[3].item).toBe(query.data[2]);
        expect(el.childNodes[4].item).toBe(query.data[4]);
      });

      it("Should move the element to the end of the list", function() {
        el._renderMovedData({
          target: query.data[3],
          fromIndex: 3,
          toIndex: query.data.length - 1
        });
        expect(el.childNodes[query.data.length - 1].item).toBe(query.data[3]);
        expect(el.childNodes[3].item).toBe(query.data[4]);
        expect(el.childNodes[4].item).toBe(query.data[5]);
      });

      it("Should move the element to the middle of the list", function() {
        el._renderMovedData({
          target: query.data[3],
          fromIndex: 3,
          toIndex: 50
        });
        expect(el.childNodes[50].item).toBe(query.data[3]);
        expect(el.childNodes[3].item).toBe(query.data[4]);
        expect(el.childNodes[4].item).toBe(query.data[5]);
      });
    })
  });

  describe("Mixin main-component", function() {
    describe("Common Properties", function() {
      it("Should setup the client from the appId property", function() {
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        expect(el.client).toBe(null);
        el.appId = client.appId;
        expect(el.client).toBe(client);
      });

      it("Should setup the client from the app-id attribute", function() {
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        expect(el.client).toBe(client);
      });

      it("Should setup the client from the layerUI.appId property", function() {
        layerUI.settings.appId = client.appId;
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        expect(el.client).toBe(client);
        layerUI.appId = null;
      });

      it("Should call _scheduleGeneratedQuery once the client is set", function() {
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        spyOn(el, "_scheduleGeneratedQuery");
        el.client = client;
        expect(el._scheduleGeneratedQuery).toHaveBeenCalledWith();
      });
    });

    describe("The created() method", function() {
      beforeEach(function() {
        jasmine.clock().install();
      });

      afterEach(function() {
        jasmine.clock().uninstall();
      });
    });


    describe("The _setupGeneratedQuery() method", function() {
      it("Should create a query if this._queryModel && !this.query && this.client", function() {
        // Main test
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.query).toEqual(jasmine.any(layer.Query));
        expect(el.query.model).toEqual(layer.Query.Identity);

        // Alt test 1
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el._queryModel = '';
        el._setupGeneratedQuery();
        expect(el.query).toBe(null);

        // Alt test 2
        var tmp = layerUI.appId;
        layerUI.appId = '';
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.query).toBe(null);
        layerUI.appId = tmp;

        // Alt test 3
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el.query = query;
        el._setupGeneratedQuery();
        expect(el.query).toBe(query);
      });

      it("Should set hasGeneratedQuery if the query was set", function() {
        // Main test
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(true);

        // Alt test 1
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el._queryModel = '';
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);

        // Alt test 2
        var tmp = layerUI.appId;
        layerUI.appId = '';
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);
        layerUI.appId = tmp;

        // Alt test 3
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        el.query = query;
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);
      });
    });
  });
});