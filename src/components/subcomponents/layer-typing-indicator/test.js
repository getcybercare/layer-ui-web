describe('layer-typing-indicator', function() {
  var el, testRoot, client, conversation, user1;

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

    user1 = new layer.Identity({
      client: client,
      userId: 'SaurumanTheMildlyAged',
      displayName: 'Sauruman the Mildly Aged',
      id: 'layer:///identities/SaurumanTheMildlyAged',
      isFullIdentity: true
    });

    client._clientAuthenticated();

    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-typing-indicator');
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe('The conversation property', function() {
    it("Should setup the client property from the conversation", function() {
      expect(el.client).toBe(null);
      el.conversation = conversation;
      expect(el.client).toBe(client);
    });
  });

  describe("The client property", function() {
    it("Should wire up typing-indicator-change event to rerender", function() {
      spyOn(el, "_rerender");
      el.client = client;
      expect(el._rerender).not.toHaveBeenCalled();
      client.trigger('typing-indicator-change');
      expect(el._rerender).toHaveBeenCalled();
    });
  });

  describe("The value property", function() {
    it("Should set the text in the typing indicator panel", function() {
      el.value = "Frodo is typing while being eaten";
      expect(el.nodes.panel.innerHTML).toEqual("Frodo is typing while being eaten");
    });

    it("Should setup the layer-typing-occuring class", function() {
      expect(el.classList.contains('layer-typing-occuring')).toBe(false);
      el.value = "Frodo is typing while being eaten";
      expect(el.classList.contains('layer-typing-occuring')).toBe(true);
      el.value = "";
      expect(el.classList.contains('layer-typing-occuring')).toBe(false);
    });
  });

  describe("The created() method", function() {

    it("Should setup panel", function() {
      expect(el.nodes.panel).toEqual(jasmine.any(HTMLElement));
    });
  });

  describe("The rerender() method", function() {
    beforeEach(function() {
      el.conversation = conversation;
    });

    it("Should render a typing user if typing into same conversation", function() {
      el._rerender({
        conversationId: conversation.id,
        typing: [user1]
      });
      expect(el.nodes.panel.innerHTML).toEqual(user1.displayName + ' is typing');
    });

    it("Should render multiple typing users if typing into same conversation", function() {
      el._rerender({
        conversationId: conversation.id,
        typing: [user1, client.user]
      });
      expect(el.nodes.panel.innerHTML).toEqual(user1.displayName + ' and ' + client.user.displayName + ' are typing');
    });

    it("Should trigger layer-typing-indicator-change and not render typing users if prevented", function() {
      var called = false;
      document.body.addEventListener('layer-typing-indicator-change', function(evt) {
        called = true;
        evt.preventDefault();
      });
      el._rerender({
        conversationId: conversation.id,
        typing: [user1]
      });

      expect(called).toBe(true);
      expect(el.nodes.panel.innerHTML).toEqual("");
    });

    it("Should ignore typing users if typing into anohter conversation", function() {
      el._rerender({
        conversationId: conversation.id + "a",
        typing: [user1]
      });
      expect(el.nodes.panel.innerHTML).toEqual("");
    });
  });
});