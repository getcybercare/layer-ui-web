describe('layer-message-status', function() {
  var el, testRoot, client, conversation, message;
  beforeEach(function() {
    client = new layer.Client({
      appId: 'Fred'
    });
    client.user = new layer.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      id: 'layer:///identities/FrodoTheDodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-message-status');
    testRoot.appendChild(el);
    el.enabled = true;

    conversation = client.createConversation({
      participants: ['layer:///identities/a', 'layer:///identities/b']
    });
    message = conversation.createMessage('Hey ho');
  });
  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  it('Should call rerender on any message change events', function() {
    spyOn(el, "_rerender");
    el.message = message;
    el._rerender.calls.reset();

    message.trigger('messages:change', {});
    expect(el._rerender).toHaveBeenCalledWith(jasmine.any(layer.LayerEvent));
  });

  it('Should not call rerender on any message change events once its no longer the right message', function() {
    spyOn(el, "_rerender");
    el.message = message;
    el.message = null;
    el._rerender.calls.reset();

    message.trigger('messages:change', {});
    expect(el._rerender).not.toHaveBeenCalled();
  });

  it('Should show pending', function() {
    message.syncState = layer.Constants.SYNC_STATE.SAVING;
    el.message = message;
    expect(el.innerHTML).toEqual('pending');
  });

  it('Should show sent', function() {
    message.deliveryStatus = layer.Constants.RECIPIENT_STATE.NONE;
    el.message = message;
    expect(el.innerHTML).toEqual('sent');
  });

  it('Should show delivered', function() {
    message.deliveryStatus = layer.Constants.RECIPIENT_STATE.SOME;
    message.readStatus = layer.Constants.RECIPIENT_STATE.NONE;
    el.message = message;
    expect(el.innerHTML).toEqual('delivered');
  });

  it('Should show read by some', function() {
    message.recipientStatus['a'] = 'read';
    message.recipientStatus['b'] = 'read';
    message.deliveryStatus = layer.Constants.RECIPIENT_STATE.SOME;
    message.readStatus = layer.Constants.RECIPIENT_STATE.SOME;
    el.message = message;
    expect(el.innerHTML).toEqual('read by 2 participants');
  });

  it('Should show read', function() {
    message.deliveryStatus = layer.Constants.RECIPIENT_STATE.SOME;
    message.readStatus = layer.Constants.RECIPIENT_STATE.ALL;
    el.message = message;
    expect(el.innerHTML).toEqual('read');
  });

  it("Should use messageStatusRenderer if provided", function() {
    var f = function() {return "who cares?"};
    el.messageStatusRenderer = f;
    el.message = message;
    expect(el.innerHTML).toEqual("who cares?");
  });
});