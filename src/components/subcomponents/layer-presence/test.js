describe('layer-presence', function() {
  var el, testRoot, client;
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
    client.user.presence.status = 'available';
    client._clientAuthenticated();

    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-presence');
    testRoot.appendChild(el);
    el.item = client.user;
    layer.Util.defer.flush();
  });
  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  it('Should start with available class', function() {
    expect(el.classList.contains('layer-presence-available')).toBe(true);
  });

  it('Should update its class', function() {
    client.user.presence.status = 'away';
    client.user.trigger('identities:change');
    expect(el.classList.contains('layer-presence-available')).toBe(false);
    expect(el.classList.contains('layer-presence-away')).toBe(true);
  });
});