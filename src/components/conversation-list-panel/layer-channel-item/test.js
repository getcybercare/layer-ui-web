describe('layer-channel-item', function() {
  var el, testRoot, client, channel, user;

  afterEach(function() {
    jasmine.clock().uninstall();
  });

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

    user = new layer.Identity({
      client: client,
      userId: 'GandalfTheGruesome',
      displayName: 'Gandalf the Gruesome',
      id: 'layer:///identities/GandalfTheGruesome',
      isFullIdentity: true
    });

    client._clientAuthenticated();


    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-channel-item');
    testRoot.appendChild(el);
    channel = client.createChannel({
      name: "Channel1",
      participants: ['layer:///identities/FrodoTheDodo']
    });
    layer.Util.defer.flush();
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe('The item property', function() {
    it("Should update layer-delete, layer-channel-last-message and layer-channel-title", function() {
      var c2 = client.createChannel({
        participants: ['layer:///identities/GolumTheCutie']
      });
      el.item = c2;
      expect(el.nodes.delete.item).toBe(c2);
      expect(el.nodes.title.item).toBe(c2);
    });

    it("Should wire up the onRerender event", function() {
      spyOn(el, "onRerender");
      el.item = channel;
      el.onRerender.calls.reset();
      channel.trigger('channels:change', {property: 'unreadCount', oldValue: 5, newValue: 6});
      expect(el.onRerender).toHaveBeenCalledWith(jasmine.any(layer.LayerEvent));
    });

    it("Should unwire up the onRerender event if prior channel", function() {
      spyOn(el, "onRerender");
      el.item = channel;
      el.item = null;
      el.onRerender.calls.reset();
      channel.trigger('channels:change', {property: 'unreadCount', oldValue: 5, newValue: 6});
      expect(el.onRerender).not.toHaveBeenCalled();
    });
  });

  describe("The deleteConversationEnabled property", function() {
    it("Should pass value on to layer-delete", function() {
      el.deleteConversationEnabled = true;
      expect(el.nodes.delete.enabled).toBe(true);

      el.deleteConversationEnabled = false;
      expect(el.nodes.delete.enabled).toBe(false);
    });
  });

  describe("The onRerender() method", function() {

  });

  describe("The _runFilter() method", function() {
    beforeEach(function() {
      el.item = channel;
    });

    it("Should remove layer-item-filtered if it is a match", function() {
      el.classList.add('layer-item-filtered');
      el._runFilter('Channel');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should add layer-item-filtered if not a match", function() {
      el._runFilter('Frodo');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
    });

    it("Should match on substring against channel name", function() {
      el._runFilter('Channel1');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter('Channel2');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
    });

    it("Should match on RegEx against channel name", function() {
      el._runFilter(/flannel/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
      el._runFilter(/channel/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match on Callback against channel name", function() {
      function test(channel) {
        return channel.name == 'Channel5';
      }
      el._runFilter(test);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
      channel.name = 'Channel5';
      el._runFilter(test);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match if no filter", function() {
      el._runFilter(null);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });
  });
});