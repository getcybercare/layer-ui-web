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

    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-message-item-sent');
    el._contentTag = 'layer-message-text-plain';
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    message = conversation.createMessage("M 0000").send();
    layer.Util.defer.flush();
    jasmine.clock().tick(1);
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe("The item property", function() {
    it("Should wire up rerender and call it", function() {
      spyOn(el, "onRender");
      spyOn(el, "onRerender");

      el.item = message;
      layer.Util.defer.flush();
      expect(el.onRender).toHaveBeenCalledWith();
      el.onRender.calls.reset();

      el.item = null;
      expect(el.onRender).toHaveBeenCalledWith();
      expect(el.onRerender).not.toHaveBeenCalled();

      el.item = message;
      message.trigger("messages:change", {});
      expect(el.onRerender).toHaveBeenCalledWith(jasmine.any(layer.LayerEvent));
    });

    it("Should unwire any prior Message", function() {
      spyOn(el, "onRerender");

      var m2 = conversation.createMessage("m2").send();
      el.item = m2;
      layer.Util.defer.flush();
      el.item = message;

      m2.trigger("messages:change", {});
      expect(el.onRerender).not.toHaveBeenCalledWith(jasmine.any(layer.LayerEvent));
    });
  });

  describe("The dateRenderer property", function() {
    it("Should be passed to the sentAt widget", function() {
      var f = function() {};
      el.dateRenderer = f;
      el.item = message;
      layer.Util.defer.flush();
      expect(el.nodes.date.dateRenderer).toBe(f);
    });
  });

  describe("The messageStatusRenderer property", function() {
    it("Should be passed to the sentAt widget", function() {
      var f = function() {};
      el.messageStatusRenderer = f;
      el.item = message;
      layer.Util.defer.flush();
      el.onRender();
      expect(el.nodes.status.messageStatusRenderer).toBe(f);
    });
  });

  describe("The onRender() method", function() {
    it("Should setup the layer-avatar", function() {
      el.item = message;
      layer.Util.defer.flush();
      expect(el.querySelector('layer-avatar').users).toEqual([message.sender]);
      expect(el.querySelector('layer-presence')).toBe(null);
    });

    it("Should setup the layer-date", function() {
      el.item = message;
      layer.Util.defer.flush();
      expect(el.querySelector('layer-date').date).toEqual(message.sentAt);
    });

    it("Should setup the layer-message-status", function() {
      el.item = message;
      layer.Util.defer.flush();
      expect(el.querySelector('layer-message-status').item).toEqual(message);
    });

    it("Should setup the layer-delete", function() {
      el.item = message;
      layer.Util.defer.flush();
      expect(el.querySelector('layer-delete').item).toEqual(message);
    });

    it("Should call _applyContentTag", function() {
      spyOn(el, "_applyContentTag");
      el.item = message;
      layer.Util.defer.flush();
      expect(el._applyContentTag).toHaveBeenCalledWith();
    });

    it("Should call rerender", function() {
      spyOn(el, "onRerender");
      el.item = message;
      layer.Util.defer.flush();
      expect(el.onRerender).toHaveBeenCalledWith();
    });
  });

  describe("The rerender() method", function() {
    it("Should setup read css", function() {
      el.item = message;
      layer.Util.defer.flush();
      message.readStatus = layer.Constants.RECIPIENT_STATE.ALL;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-read-by-all')).toBe(true);
      expect(el.classList.contains('layer-message-status-read-by-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-none')).toBe(false);

      message.readStatus = layer.Constants.RECIPIENT_STATE.SOME;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-read-by-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-some')).toBe(true);
      expect(el.classList.contains('layer-message-status-read-by-none')).toBe(false);

      message.readStatus = layer.Constants.RECIPIENT_STATE.NONE;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-read-by-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-read-by-none')).toBe(true);
    });

    it("Should setup delivery css", function() {
      el.item = message;
      layer.Util.defer.flush();
      message.deliveryStatus = layer.Constants.RECIPIENT_STATE.ALL;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-delivered-to-all')).toBe(true);
      expect(el.classList.contains('layer-message-status-delivered-to-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-none')).toBe(false);

      message.deliveryStatus = layer.Constants.RECIPIENT_STATE.SOME;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-delivered-to-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-some')).toBe(true);
      expect(el.classList.contains('layer-message-status-delivered-to-none')).toBe(false);

      message.deliveryStatus = layer.Constants.RECIPIENT_STATE.NONE;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-delivered-to-all')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-some')).toBe(false);
      expect(el.classList.contains('layer-message-status-delivered-to-none')).toBe(true);
    });

    it("Should setup pending css", function() {
      el.item = message;
      layer.Util.defer.flush();
      message.syncState = layer.Constants.SYNC_STATE.SAVING;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-pending')).toBe(true);

      message.syncState = layer.Constants.SYNC_STATE.SYNCED;
      el.onRerender();
      expect(el.classList.contains('layer-message-status-pending')).toBe(false);
    });

    it("Should setup unread css", function() {
      el.item = message;
      layer.Util.defer.flush();
      message.isRead = false;
      el.onRerender();
      expect(el.classList.contains('layer-unread-message')).toBe(true);

      message.isRead = true;
      el.onRerender();
      expect(el.classList.contains('layer-unread-message')).toBe(false);
    });
  });

  describe("The _applyContentTag() method", function() {
    it("Should create the element specified in _contentTag", function() {
      el.item = message;
      layer.Util.defer.flush();
      el._contentTag = "img";
      el.nodes.content = document.createElement('div');
      el.appendChild(el.nodes.content);
      expect(el.querySelector('img')).toBe(null);
      el._applyContentTag();
      expect(el.querySelector('img')).not.toBe(null);
    });

    it("Should setup message properties", function() {
      el.item = message;
      layer.Util.defer.flush();
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