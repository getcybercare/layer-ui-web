describe('layer-conversation-last-message', function() {
  var el, testRoot, client, conversation, message;

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

    client._clientAuthenticated();

    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-conversation-last-message');
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });
    message = conversation.createMessage("Hello Earthlings").send();
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
      conversation.trigger('conversations:change', {});
      expect(el._rerender).toHaveBeenCalledWith(jasmine.any(layer.LayerEvent));
    });

    it("Should unwire up the _rerender event if prior Conversation", function() {
      spyOn(el, "_rerender");
      el.item = conversation;
      el.item = null;
      el._rerender.calls.reset();
      conversation.trigger('conversations:change', {});
      expect(el._rerender).not.toHaveBeenCalled();
    });
  });

  describe("The _rerender() method", function() {
    it("Should generate a layer-message-text-plain saying Hello Earthlings", function() {
      expect(el.querySelector('layer-message-text-plain')).toBe(null);
      el.item = conversation;
      expect(el.querySelector('layer-message-text-plain')).not.toBe(null);
    });

    it("Should remove the layer-message-text-plain if changing item to null", function(){
      el.item = conversation;
      el.item = null;
      expect(el.querySelector('layer-message-text-plain')).toBe(null);
    });

    it("Should use suitable Handler", function() {
      message = conversation.createMessage({
        parts: {
          body: 'blah',
          mimeType: 'image/png'
        }
      }).send();
      el.item = conversation;
      expect(el.querySelector('layer-message-text-plain')).toBe(null);
      expect(el.querySelector('layer-message-image')).not.toBe(null);
    });

    it("Should replace old Handler", function() {
      el.item = conversation;
      expect(el.querySelector('layer-message-text-plain')).not.toBe(null);
      expect(el.querySelector('layer-message-image')).toBe(null);
      message = conversation.createMessage({
        parts: {
          body: 'blah',
          mimeType: 'image/png'
        }
      }).send();
      jasmine.clock().tick(1);
      expect(el.querySelector('layer-message-text-plain')).toBe(null);
      expect(el.querySelector('layer-message-image')).not.toBe(null);
    });
  });
});