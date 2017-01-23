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
      expect(el.nodes.lastMessage.item).toBe(c2);
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

  describe("The deletechannelEnabled property", function() {
    it("Should pass value on to layer-delete", function() {
      el.deletechannelEnabled = true;
      expect(el.nodes.delete.enabled).toBe(true);

      el.deletechannelEnabled = false;
      expect(el.nodes.delete.enabled).toBe(false);
    });
  });

  describe("The onRerender() method", function() {


    it("Should update layer-avatar users", function() {
      el.item = channel;
      channel.addParticipants(['layer:///identities/GandalfTheGruesome']);
      el.onRerender();
      expect(el.nodes.avatar.users).toEqual([client.getIdentity('layer:///identities/GandalfTheGruesome')]);
    });

    it("Should update layer-channel-unread-messages class", function() {
      el.item = channel;
      var message = new layer.Message({client: client});
      message.isRead = false;
      channel.lastMessage = message;
      el.onRerender();
      expect(el.classList.contains('layer-channel-unread-messages')).toBe(true);

      channel.lastMessage.isRead = true;
      el.onRerender();
      expect(el.classList.contains('layer-channel-unread-messages')).toBe(false);
    });
  });

  describe("The _runFilter() method", function() {
    beforeEach(function() {
      el.item = channel;
    });
    it("Should add layer-item-filtered if not a match", function() {
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter('Samwise');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
    });

    it("Should remove layer-item-filtered if it is a match", function() {
      el.classList.add('layer-item-filtered');
      el._runFilter('Frodo');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match on substring against metadata.channelName, displayName, firstName, lastName and emailAddress", function() {
      channel.setMetadataProperties({channelName: 'AraAcorn, returning king of squirrels'});
      el._runFilter('araacorn');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter('WringRaith');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.firstName = 'Mojo';
      el._runFilter('MoJo');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter('POJO');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.lastName = 'pojO';
      el._runFilter('POJO');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter('pojo@layer');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.emailAddress = 'pojo@layer.com';
      el._runFilter('pojo@layer');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match on RegEx against displayName, firstName, lastName and emailAddress", function() {
      channel.setMetadataProperties({channelName: 'AraAcorn, returning king of squirrels'});
      el._runFilter(/Araacorn/);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
      el._runFilter(/AraAcorn/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter(/moJo/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.firstName = 'Mojo';
      el._runFilter(/moJo/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter(/POJO/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.lastName = 'pojO';
      el._runFilter(/POJO/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter(/pojo@layer/);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.emailAddress = 'pojo@layer.com';
      el._runFilter(/pojo@layer/);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match on Callback against displayName, firstName, lastName and emailAddress", function() {
      channel.setMetadataProperties({channelName: 'AraAcorn, returning king of squirrels'});

      function test(channel) {
        return channel.metadata.channelName == 'AraAcorn, returning king of squirrels';
      }
      el._runFilter(test);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      channel.setMetadataProperties({channelName: 'Frodo ala Modo'});
      el._runFilter(test);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
    });

    it("Should match if no filter", function() {
      el._runFilter(null);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });
  });
});