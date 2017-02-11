describe("List Item Mixin", function() {

  var el, testRoot, client;
  beforeEach(function() {
    jasmine.clock().install();
    client = new layer.Client({
      appId: 'Fred'
    });
    client.user = new layer.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      id: 'layer:///identities/FrodoTheDodo',
      displayName: 'Frodo is a Dodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-identity-item');
    testRoot.appendChild(el);
    el.item = client.user;
    layer.Util.defer.flush();
    jasmine.clock().tick(1000);
    layer.Util.defer.flush();
    jasmine.clock().tick(10);
  });

  afterEach(function() {
    jasmine.clock().uninstall();
    document.body.removeChild(testRoot);
  });

  describe("The customNodeAbove property", function() {
    it("Should add a string", function() {
      el.customNodeAbove = 'hello';
      expect(el.customNodeAbove.innerHTML).toEqual('hello');
      expect(el.firstChild).toBe(el.customNodeAbove);
      expect(el.childNodes.length).toEqual(2);
    });

    it("Should replace a string", function() {
      el.customNodeAbove = 'hello';
      el.customNodeAbove = 'there';
      expect(el.customNodeAbove.innerHTML).toEqual('there');
      expect(el.firstChild).toBe(el.customNodeAbove);
      expect(el.childNodes.length).toEqual(2);
    });

    it("Should remove a string", function() {
      el.customNodeAbove = 'hello';
      el.customNodeAbove = '';
      expect(el.customNodeAbove).toBe(null);
      expect(el.firstChild).toBe(el.innerNode);
      expect(el.childNodes.length).toEqual(1);
    });

    it("Should add a node", function() {
      var div1 = document.createElement('div');
      el.customNodeAbove = div1;
      expect(el.customNodeAbove).toBe(div1);
      expect(el.firstChild).toBe(div1);
      expect(el.childNodes.length).toEqual(2);
    });

    it("Should replace a node", function() {
      var div1 = document.createElement('div');
      var div2 = document.createElement('div');
      el.customNodeAbove = div1;
      el.customNodeAbove = div2;
      expect(el.customNodeAbove).toBe(div2);
      expect(el.firstChild).toBe(div2);
      expect(el.childNodes.length).toEqual(2);
      expect(div1.parentNode).toBe(null);
    });

    it("Should remove a node", function() {
      var div1 = document.createElement('div');
      el.customNodeAbove = div1;
      el.customNodeAbove = null;
      expect(el.customNodeAbove).toBe(null);
      expect(el.firstChild).toBe(el.innerNode);
      expect(el.childNodes.length).toEqual(1);
    });
  });

  describe("The customNodeBelow property", function() {
    it("Should add a string", function() {
      el.customNodeBelow = 'hello';
      expect(el.customNodeBelow.innerHTML).toEqual('hello');
      expect(el.childNodes[1]).toBe(el.customNodeBelow);
      expect(el.childNodes.length).toEqual(2);
    });

    it("Should replace a string", function() {
      el.customNodeBelow = 'hello';
      el.customNodeBelow = 'there';
      expect(el.customNodeBelow.innerHTML).toEqual('there');
      expect(el.childNodes[1]).toBe(el.customNodeBelow);
      expect(el.childNodes.length).toEqual(2);
    });

    it("Should remove a string", function() {
      el.customNodeBelow = 'hello';
      el.customNodeBelow = '';
      expect(el.customNodeBelow).toBe(null);
      expect(el.firstChild).toBe(el.innerNode);
      expect(el.childNodes.length).toEqual(1);
    });

    it("Should add a node", function() {
      var div1 = document.createElement('div');
      el.customNodeBelow = div1;
      expect(el.customNodeBelow).toBe(div1);
      expect(el.childNodes[1]).toBe(div1);
      expect(el.childNodes.length).toEqual(2);
    });

    it("Should replace a node", function() {
      var div1 = document.createElement('div');
      var div2 = document.createElement('div');
      el.customNodeBelow = div1;
      el.customNodeBelow = div2;
      expect(el.customNodeBelow).toBe(div2);
      expect(el.childNodes[1]).toBe(div2);
      expect(el.childNodes.length).toEqual(2);
      expect(div1.parentNode).toBe(null);
    });

    it("Should remove a node", function() {
      var div1 = document.createElement('div');
      el.customNodeBelow = div1;
      el.customNodeBelow = null;
      expect(el.customNodeBelow).toBe(null);
      expect(el.firstChild).toBe(el.innerNode);
      expect(el.childNodes.length).toEqual(1);
    });
  });

  describe("The innerNode property", function() {
    it("Should point to our user data", function() {
      expect(el.innerNode.childNodes[0].tagName).toEqual('LAYER-AVATAR');
      expect(el.innerNode.childNodes[1].tagName).toEqual('LABEL');
      expect(el.innerNode.childNodes[2].tagName).toEqual('INPUT');
    });
  });

  describe("The firstInSeries property", function() {
    it("Should default to false", function() {
      expect(el.classList.contains('layer-list-item-first')).toBe(false);
    });
    it("Should update layer-list-item-first class", function() {
      el.firstInSeries = true;
      expect(el.classList.contains('layer-list-item-first')).toBe(true);

      el.firstInSeries = false;
      expect(el.classList.contains('layer-list-item-first')).toBe(false);
    });
  })

  describe("The lastInSeries property", function() {
    it("Should default to false", function() {
      expect(el.classList.contains('layer-list-item-last')).toBe(false);
    });
    it("Should update layer-list-item-last class", function() {
      el.lastInSeries = true;
      expect(el.classList.contains('layer-list-item-last')).toBe(true);

      el.lastInSeries = false;
      expect(el.classList.contains('layer-list-item-last')).toBe(false);
    });
  });
});
