describe('layer-conversation-title', function() {
  var el, testRoot, client, conversation, user2, user3;

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
    user2 = new layer.Identity({
      client: client,
      userId: 'SaurumanTheMildlyAged',
      displayName: 'Sauruman the Mildly Aged',
      id: 'layer:///identities/SaurumanTheMildlyAged',
      isFullIdentity: true
    });
    user3 = new layer.Identity({
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
    el = document.createElement('layer-conversation-title');
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe('The item property', function() {
    it("Should call _rerender", function() {
      spyOn(el, "_rerender");
      el.item = conversation;
      expect(el._rerender).toHaveBeenCalledWith();
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

  describe("The _rerender() method", function() {
    it("Should clear the label if no item", function(){
      el.item = conversation;
      expect(el.innerHTML).not.toEqual('');
      el.item = null;
      expect(el.innerHTML).toEqual('');
    });

    it("Should use metadata.conversationName", function() {
      el.item = conversation;
      conversation.setMetadataProperties({conversationName: "Gandalf the Gruesome"});
      jasmine.clock().tick(1);
      expect(el.innerHTML).toEqual("Gandalf the Gruesome");
    });

    it("Should list participants displayName", function() {
      el.item = conversation;
      conversation.addParticipants([user3]);
      jasmine.clock().tick(1);
      expect(el.innerHTML).toEqual(user2.displayName + ' and ' + user3.displayName);
    });

    it("Should just show No Title", function() {
      el.item = conversation;
      conversation.removeParticipants([user2]);
      jasmine.clock().tick(1);
      expect(el.innerHTML).toEqual("No Title");
    });
  });
});