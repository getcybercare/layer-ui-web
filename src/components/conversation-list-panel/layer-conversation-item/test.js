describe('layer-conversation-item', function() {
  var el, testRoot, client, conversation, user;

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
    el = document.createElement('layer-conversation-item');
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo']
    });
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe('The item property', function() {
    it("Should update layer-delete, layer-conversation-last-message and layer-conversation-title", function() {
      var c2 = client.createConversation({
        participants: ['layer:///identities/GolumTheCutie']
      });
      el.item = c2;
      expect(el.nodes.delete.item).toBe(c2);
      expect(el.nodes.lastMessage.item).toBe(c2);
      expect(el.nodes.title.item).toBe(c2);
    });

    it("Should wire up the _rerender event", function() {
      spyOn(el, "_rerender");
      el.item = conversation;
      el._rerender.calls.reset();
      conversation.trigger('conversations:change', {property: 'unreadCount', oldValue: 5, newValue: 6});
      expect(el._rerender).toHaveBeenCalledWith(jasmine.any(layer.LayerEvent));
    });

    it("Should unwire up the _rerender event if prior Conversation", function() {
      spyOn(el, "_rerender");
      el.item = conversation;
      el.item = null;
      el._rerender.calls.reset();
      conversation.trigger('conversations:change', {property: 'unreadCount', oldValue: 5, newValue: 6});
      expect(el._rerender).not.toHaveBeenCalled();
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

  describe("The _rerender() method", function() {


    it("Should update layer-avatar users", function() {
      el.item = conversation;
      conversation.addParticipants(['layer:///identities/GandalfTheGruesome']);
      el._rerender();
      expect(el.nodes.avatar.users).toEqual([client.getIdentity('layer:///identities/GandalfTheGruesome')]);
    });

    it("Should update layer-conversation-unread-messages class", function() {
      el.item = conversation;
      var message = new layer.Message({client: client});
      message.isRead = false;
      conversation.lastMessage = message;
      el._rerender();
      expect(el.classList.contains('layer-conversation-unread-messages')).toBe(true);

      conversation.lastMessage.isRead = true;
      el._rerender();
      expect(el.classList.contains('layer-conversation-unread-messages')).toBe(false);
    });
  });

  describe("The _runFilter() method", function() {
    beforeEach(function() {
      el.item = conversation;
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

    it("Should match on substring against metadata.conversationName, displayName, firstName, lastName and emailAddress", function() {
      conversation.setMetadataProperties({conversationName: 'AraAcorn, returning king of squirrels'});
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
      conversation.setMetadataProperties({conversationName: 'AraAcorn, returning king of squirrels'});
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
      conversation.setMetadataProperties({conversationName: 'AraAcorn, returning king of squirrels'});

      function test(conversation) {
        return conversation.metadata.conversationName == 'AraAcorn, returning king of squirrels';
      }
      el._runFilter(test);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      conversation.setMetadataProperties({conversationName: 'Frodo ala Modo'});
      el._runFilter(test);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
    });

    it("Should match if no filter", function() {
      el._runFilter(null);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });
  });
});