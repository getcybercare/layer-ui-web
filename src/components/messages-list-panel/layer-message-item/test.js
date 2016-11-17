describe('layer-message-item', function() {
  var el, testRoot, client, conversation, message, user1;

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
    el = document.createElement('layer-message-item');
    el._contentTag = 'layer-message-text-plain';
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    message = conversation.createMessage("M 0000").send();
    jasmine.clock().tick(1);
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe("The item property", function() {
    it("Should wire up rerender and call render if there is a value", function() {
      spyOn(el, "_render");
      spyOn(el, "_rerender");

      el.item = undefined;
      expect(el._render).not.toHaveBeenCalled();

      el.item = message;
      expect(el._render).toHaveBeenCalledWith();
      expect(el._rerender).not.toHaveBeenCalled();

      message.trigger("messages:change", {});
      expect(el._rerender).toHaveBeenCalledWith(jasmine.any(layer.LayerEvent));
    });

    it("Should unwire any prior Message", function() {
      spyOn(el, "_rerender");

      var m2 = conversation.createMessage("m2").send();
      el.item = m2;
      el.item = message;

      m2.trigger("messages:change", {});
      expect(el._rerender).not.toHaveBeenCalledWith(jasmine.any(layer.LayerEvent));
    });

    it("Should add/remove sent/received classes", function() {
      el.item = message;
      expect(el.classList.contains('layer-message-item-sent')).toBe(true);
      expect(el.classList.contains('layer-message-item-received')).toBe(false);

      var m2 = conversation.createMessage("m2").send();
      m2.sender = user1;
      el.item = m2;
      expect(el.classList.contains('layer-message-item-sent')).toBe(false);
      expect(el.classList.contains('layer-message-item-received')).toBe(true);

      el.item = null;
      expect(el.classList.contains('layer-message-item-sent')).toBe(false);
      expect(el.classList.contains('layer-message-item-received')).toBe(false);
    });
  });

  describe("The dateRenderer property", function() {
    it("Should be passed to the sentAt widget", function() {
      var f = function() {};
      el.dateRenderer = f;
      el.item = message;
      expect(el.nodes.date.dateRenderer).toBe(f);
    });
  });

  describe("The messageStatusRenderer property", function() {
    it("Should be passed to the sentAt widget", function() {
      var f = function() {};
      el.messageStatusRenderer = f;
      el.item = message;
      el._render();
      expect(el.nodes.status.messageStatusRenderer).toBe(f);
    });
  });

  describe("The render() method", function() {
    it("Should render the sent template", function() {
      message.sender = client.user;
      el.item = message;
      expect(el.querySelector('layer-message-status')).not.toBe(null);
    });

    it("Should render the received template", function() {
      message.sender = user1;
      el.item = message;
      expect(el.querySelector('layer-message-status')).toBe(null);
    });

    it("Should setup the layer-avatar", function() {
      el.item = message;
      expect(el.querySelector('layer-avatar').users).toEqual([message.sender]);
    });

    it("Should setup the layer-date", function() {
      el.item = message;
      expect(el.querySelector('layer-date').date).toEqual(message.sentAt);
    });

    it("Should setup the layer-message-status", function() {
      el.item = message;
      expect(el.querySelector('layer-message-status').message).toEqual(message);
    });

    it("Should setup the layer-delete", function() {
      el.item = message;
      expect(el.querySelector('layer-delete').item).toEqual(message);
    });

    it("Should call _applyContentTag", function() {
      spyOn(el, "_applyContentTag");
      el.item = message;
      expect(el._applyContentTag).toHaveBeenCalledWith();
    });

    it("Should call rerender", function() {
      spyOn(el, "_rerender");
      el.item = message;
      expect(el._rerender).toHaveBeenCalledWith();
    });
  });

  describe("The rerender() method", function() {
    it("Should setup read css", function() {
      el.item = message;
      message.readStatus = layer.Constants.RECIPIENT_STATE.ALL;
      el._rerender();
      expect(el.classList.contains('layer-message-status-read-by-all')).toBe(true);
      expect(el.classList.contains('layer-message-status-read-by-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-none')).toBe(false);

      message.readStatus = layer.Constants.RECIPIENT_STATE.SOME;
      el._rerender();
      expect(el.classList.contains('layer-message-status-read-by-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-some')).toBe(true);
      expect(el.classList.contains('layer-message-status-read-by-none')).toBe(false);

      message.readStatus = layer.Constants.RECIPIENT_STATE.NONE;
      el._rerender();
      expect(el.classList.contains('layer-message-status-read-by-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-none')).toBe(true);
    });

    it("Should setup delivery css", function() {
      el.item = message;
      message.deliveryStatus = layer.Constants.RECIPIENT_STATE.ALL;
      el._rerender();
      expect(el.classList.contains('layer-message-status-delivered-to-all')).toBe(true);
      expect(el.classList.contains('layer-message-status-delivered-to-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-none')).toBe(false);

      message.deliveryStatus = layer.Constants.RECIPIENT_STATE.SOME;
      el._rerender();
      expect(el.classList.contains('layer-message-status-delivered-to-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-some')).toBe(true);
      expect(el.classList.contains('layer-message-status-delivered-to-none')).toBe(false);

      message.deliveryStatus = layer.Constants.RECIPIENT_STATE.NONE;
      el._rerender();
      expect(el.classList.contains('layer-message-status-delivered-to-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-none')).toBe(true);
    });

    it("Should setup pending css", function() {
      el.item = message;
      message.syncState = layer.Constants.SYNC_STATE.SAVING;
      el._rerender();
      expect(el.classList.contains('layer-message-status-pending')).toBe(true);

      message.syncState = layer.Constants.SYNC_STATE.SYNCED;
      el._rerender();
      expect(el.classList.contains('layer-message-status-pending')).toBe(false);
    });

    it("Should setup unread css", function() {
      el.item = message;
      message.isRead = false;
      el._rerender();
      expect(el.classList.contains('layer-unread-message')).toBe(true);

      message.isRead = true;
      el._rerender();
      expect(el.classList.contains('layer-unread-message')).toBe(false);
    });
  });

  describe("The _applyContentTag() method", function() {
    it("Should create the element specified in _contentTag", function() {
      el._contentTag = "img";
      el.nodes.content = document.createElement('div');
      el.appendChild(el.nodes.content);
      expect(el.querySelector('img')).toBe(null);
      el._applyContentTag();
      expect(el.querySelector('img')).not.toBe(null);
    });

    it("Should setup message properties", function() {
      el._contentTag = 'layer-message-text-plain';
      el.nodes.content = document.createElement('div');
      el.appendChild(el.nodes.content);
      el.properties.item = message;

      el._applyContentTag();
      var handler = el.querySelector('layer-message-text-plain');

      expect(handler.message).toEqual(message);
    });

    // Dont know how to test this
    it("Should propagate the message handlers height to the content node", function() {


    });
  });
});