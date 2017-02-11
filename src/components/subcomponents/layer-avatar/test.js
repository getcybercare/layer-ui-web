describe('layer-avatar', function() {
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
    client._clientAuthenticated();

    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-avatar');
    testRoot.appendChild(el);
    el.enabled = true;
    layer.Util.defer.flush();
  });
  afterEach(function() {
    //document.body.removeChild(testRoot);
  });

  it('Should start without a layer-has-user class', function() {
    expect(el.classList.contains('layer-has-user')).toEqual(false);
  });

  it('Should start with users as empty array', function() {
    expect(el.users).toEqual([]);
  });

  it('Should have a layer-has-user class if one user', function() {
    el.users = [client.user];
    expect(el.classList.contains('layer-has-user')).toEqual(true);
  });

  it('Should have a layer-has-user class if two users', function() {
    el.users = [client.user, client.user];
    expect(el.classList.contains('layer-has-user')).toEqual(true);
  });

  it('Should resume not having a layer-has-user class', function() {
    el.users = [client.user, client.user];
    el.users = [];
    expect(el.classList.contains('layer-has-user')).toEqual(false);
  });

  it("Should generate an img for one user with an avatar", function() {
    client.user.avatarUrl = 'http://abby.normal.frankentein/';
    el.users = [client.user];
    expect(el.childNodes.length).toEqual(2);
    expect(el.firstChild.tagName).toEqual('IMG');
    expect(el.firstChild.src).toEqual(client.user.avatarUrl);
    expect(el.childNodes[1].tagName).toEqual('LAYER-PRESENCE');
  });

  it("Should generate a span with initials if firstName/lastName", function() {
    client.user.firstName = 'Abby';
    client.user.lastName = 'Normal'
    el.users = [client.user];
    expect(el.childNodes.length).toEqual(2);
    expect(el.firstChild.tagName).toEqual('SPAN');
    expect(el.firstChild.firstChild.textContent).toEqual('AN');
    expect(el.childNodes[1].tagName).toEqual('LAYER-PRESENCE');
  });

  it("Should generate a span with first two letters of displayName", function() {
    client.user.displayName = 'Abby';
    client.user.lastName = 'Normal'
    el.users = [client.user];
    expect(el.childNodes.length).toEqual(2);
    expect(el.firstChild.tagName).toEqual('SPAN');
    expect(el.firstChild.firstChild.textContent).toEqual('AB');
    expect(el.childNodes[1].tagName).toEqual('LAYER-PRESENCE');
  });

  it("Should generate multiple spans for multiple users", function() {
    client.user.firstName = 'Abby';
    client.user.lastName = 'Normal'
    el.users = [client.user, client.user];
    expect(el.childNodes.length).toEqual(2);
    expect(el.childNodes[0].tagName).toEqual('SPAN');
    expect(el.childNodes[1].tagName).toEqual('SPAN');
    expect(el.childNodes[0].firstChild.textContent).toEqual('AN');
    expect(el.childNodes[1].firstChild.textContent).toEqual('AN');
  });

  it("Should not set cluster class if one user", function() {
    el.users = [client.user];
    expect(el.classList.contains('layer-avatar-cluster')).toBe(false);
  });

  it("Should set cluster class if multiple users", function() {
    el.users = [client.user, client.user];
    expect(el.classList.contains('layer-avatar-cluster')).toBe(true);
  });

  it("Should have a layer-presence widget with its user set", function() {
    el.users = [client.user];
    expect(el.nodes.presence.tagName).toEqual('LAYER-PRESENCE');
    expect(el.nodes.presence.item).toBe(client.user);
  });

  it("Should respect showPresence of false", function() {
    el.showPresence = false;
    el.users = [client.user];
    expect(el.nodes.presence).toBe(undefined);
  });
});