// TODO: Update this to apply to a test widget instead of an existing widget
describe("Main Component Mixin", function() {
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

    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({layer: layer});
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

    describe("Common Properties", function() {
      it("Should setup the client from the appId property", function() {
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();

        var el = testRoot.firstChild;
        expect(el.client).toBe(null);
        el.appId = client.appId;
        expect(el.client).toBe(client);
      });

      it("Should setup the client from the app-id attribute", function() {
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        expect(el.client).toBe(client);
      });

      it("Should setup the client from the layerUI.appId property", function() {
        layerUI.settings.appId = client.appId;
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        expect(el.client).toBe(client);
        layerUI.appId = null;
      });

      it("Should call _scheduleGeneratedQuery once the client is set", function() {
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        layer.Util.defer.flush();
        spyOn(el, "_scheduleGeneratedQuery");
        el.client = client;
        expect(el._scheduleGeneratedQuery).toHaveBeenCalledWith();
      });
    });

    describe("The onCreate() method", function() {
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
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.query).toEqual(jasmine.any(layer.Query));
        expect(el.query.model).toEqual(layer.Query.Identity);

        // Alt test 1
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el._queryModel = '';
        el._setupGeneratedQuery();
        expect(el.query).toBe(null);

        // Alt test 2
        var tmp = layerUI.appId;
        layerUI.appId = '';
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.query).toBe(null);
        layerUI.appId = tmp;

        // Alt test 3
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el.query = query;
        el._setupGeneratedQuery();
        expect(el.query).toBe(query);
      });

      it("Should set hasGeneratedQuery if the query was set", function() {
        // Main test
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(true);

        // Alt test 1
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el._queryModel = '';
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);

        // Alt test 2
        var tmp = layerUI.appId;
        layerUI.appId = '';
        testRoot.innerHTML = '<layer-identities-list></layer-identities-list>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);
        layerUI.appId = tmp;

        // Alt test 3
        testRoot.innerHTML = '<layer-identities-list app-id="' + client.appId + '"></layer-identities-list>';
        CustomElements.takeRecords();
        layer.Util.defer.flush();
        var el = testRoot.firstChild;
        el.query = query;
        el._setupGeneratedQuery();
        expect(el.hasGeneratedQuery).toBe(false);
      });
    });
  });