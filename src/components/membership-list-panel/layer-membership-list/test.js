describe('layer-membership-list', function() {
  var el, testRoot, client, query;

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
      isFullIdentity: true
    });
    client._clientAuthenticated();

    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-membership-list');
    testRoot.appendChild(el);
    query = client.createQuery({
      model: layer.Query.Membership
    });
    query.isFiring = false;
    query.data = [];
    for (i = 0; i < 100; i++) {

        var ident = new layer.Identity({
          client: client,
          userId: 'user' + i,
          id: 'layer:///identities/user' + i,
          displayName: 'User ' + i,
          isFullIdentity: true
        })
      query.data.push(
        new layer.Membership({
          client: client,
          identity: ident
        })
      );
    }

    el.query = query;
    CustomElements.takeRecords();
    layer.Util.defer.flush();
    jasmine.clock().tick(500);
    layer.Util.defer.flush();
  });

  afterEach(function() {
    try {
      jasmine.clock().uninstall();
      layerUI.settings.appId = null;
      document.body.removeChild(testRoot);
      if (el) el.onDestroy();
    } catch(e) {}
  });



  describe("The filter property", function() {
    it("Should call _runFilter when set", function() {
      spyOn(el, "_runFilter");
      el.filter = "Member";
      expect(el._runFilter).toHaveBeenCalledWith();
    });
  });

  describe("The created() method", function() {
    it("Should call _updateQuery if there is a queryId passed into the innerHTML", function() {
      testRoot.innerHTML = '<layer-membership-list query-id="' + query.id + '" app-id="' + client.appId + '"></layer-membership-list>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      var el = testRoot.firstChild;
      expect(el.query).toBe(query);
      spyOn(el, "_processQueryEvt"); // _updateQuery sets up the query listener to call _processQueryEvt
      query.trigger('change');
      expect(el._processQueryEvt).toHaveBeenCalled();
    });

    it("Should call render", function() {
      testRoot.innerHTML = '<layer-membership-list></layer-membership-list>';
      CustomElements.takeRecords();
      var el = testRoot.firstChild;
      expect(el.nodes.loadIndicator).toEqual(jasmine.any(HTMLElement));
    });
  });

  describe("The _generateItem() method", function() {
    it("Should return a layer-membership-item with an identity setup", function() {
      var result = el._generateItem(query.data[1]);
      expect(result.tagName).toEqual('LAYER-MEMBERSHIP-ITEM');
      expect(result.item).toBe(query.data[1]);
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
      el.onRerender(evt);
      expect(el._processQueryEvt).toHaveBeenCalledWith(evt);
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
      el.filter = 'User 4';
      expect(el.querySelectorAllArray('layer-membership-item:not(.layer-item-filtered)')[0]).toBe(el.childNodes[4]);
    });
  });
});