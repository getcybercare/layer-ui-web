describe('layer-delete', function() {
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
    el = document.createElement('layer-delete');
    testRoot.appendChild(el);
    el.enabled = true;
    layer.Util.defer.flush();
  });
  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe('The enabled property', function() {
    it('Should add layer-delete-enabled if not disabled at initialization', function() {
      testRoot.innerHTML = "<layer-delete enabled='true'>fred</layer-delete>";
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      expect(testRoot.firstChild.classList.contains('layer-delete-enabled')).toBe(true);
    });

    it('Should remove layer-delete-enabled if enabled not provided at initialization', function() {
      testRoot.innerHTML = '<layer-delete></layer-delete>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      expect(testRoot.firstChild.classList.contains('layer-delete-enabled')).toBe(false);
    });

    it('Should remove layer-delete-enabled if enabled=false at initialization', function() {
      testRoot.innerHTML = '<layer-delete enabled=false></layer-delete>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      expect(testRoot.firstChild.classList.contains('layer-delete-enabled')).toBe(false);
    });

    it('Should add layer-delete-enabled if not disabled after initialization', function() {
      testRoot.innerHTML = '<layer-delete enabled=true></layer-delete>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      testRoot.firstChild.enabled = false;
      expect(testRoot.firstChild.classList.contains('layer-delete-enabled')).toBe(false);
    });

    it('Should remove layer-delete-enabled if disabled after initialization', function() {
      testRoot.innerHTML = '<layer-delete enabled=false></layer-delete>';
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      testRoot.firstChild.enabled = true;
      expect(testRoot.firstChild.classList.contains('layer-delete-enabled')).toBe(true);
    });
  });

  describe('The onDeleteClick() method', function() {
    beforeEach(function() {
      spyOn(window, "confirm").and.returnValue(true);
    });

    it('Should trigger layer-message-deleted if item is a Message', function() {
      // Setup
      var calledMessage = false;
      var calledConversation = false;
      var conversation = client.createConversation({
        participants: ['layer:///identities/a', 'layer:///identities/b']
      });
      var message = conversation.createMessage('Hey ho');
      el.item = message;

      // Events
      testRoot.addEventListener('layer-message-deleted', function(evt) {
        expect(evt.detail.item).toBe(message);
        calledMessage = true;
      });
      testRoot.addEventListener('layer-conversation-deleted', function(evt) {
        calledConversation = true;
      });

      // Run
      el.click();

      // Posttest
      expect(calledMessage).toBe(true);
      expect(calledConversation).toBe(false);
    });


    it('Should trigger layer-conversation-deleted if item is a Conversation', function() {
      // Setup
      var calledMessage = false;
      var calledConversation = false;
      var conversation = client.createConversation({
        participants: ['layer:///identities/a', 'layer:///identities/b']
      });
      var message = conversation.createMessage('Hey ho');
      el.item = conversation;

      // Events
      testRoot.addEventListener('layer-message-deleted', function(evt) {
        calledMessage = true;
      });
      testRoot.addEventListener('layer-conversation-deleted', function(evt) {
        calledConversation = true;
        expect(evt.detail.item).toBe(conversation);
      });

      // Run
      el.click();

      // Posttest
      expect(calledMessage).toBe(false);
      expect(calledConversation).toBe(true);
    });

    it('Should trigger nothing if not enabled', function() {
      // Setup
      el.enabled = false;
      var calledMessage = false;
      var calledConversation = false;
      var conversation = client.createConversation({
        participants: ['layer:///identities/a', 'layer:///identities/b']
      });
      var message = conversation.createMessage('Hey ho');
      el.item = message;

      // Events
      testRoot.addEventListener('layer-message-deleted', function(evt) {
        calledMessage = true;
      });
      testRoot.addEventListener('layer-conversation-deleted', function(evt) {
        calledConversation = true;
      });

      // Run
      el.click();
      el.item = conversation;
      el.click();

      // Posttest
      expect(calledMessage).toBe(false);
      expect(calledConversation).toBe(false);
    });

    it('Should call window.confirm and Message.delete if no evt.preventDefault', function() {
      // Setup
      var conversation = client.createConversation({
        participants: ['layer:///identities/a', 'layer:///identities/b']
      });
      var message = conversation.createMessage('Hey ho');
      spyOn(message, "delete");
      el.item = message;

      // Run
      el.click();

      // Posttest
      expect(window.confirm).toHaveBeenCalled();
      expect(message.delete).toHaveBeenCalledWith(layer.Constants.DELETION_MODE.ALL);
    });

    it('Should call window.confirm and Conversation.delete if no evt.preventDefault', function() {
      // Setup
      var conversation = client.createConversation({
        participants: ['layer:///identities/a', 'layer:///identities/b']
      });
      var message = conversation.createMessage('Hey ho');
      spyOn(conversation, "delete");
      el.item = conversation;


      // Run
      el.click();

      // Posttest
      expect(window.confirm).toHaveBeenCalled();
      expect(conversation.delete).toHaveBeenCalledWith(layer.Constants.DELETION_MODE.ALL);
    });

    it('Should skip window.confirm and Message.delete if evt.preventDefault is called', function() {
      // Setup
      var conversation = client.createConversation({
        participants: ['layer:///identities/a', 'layer:///identities/b']
      });
      var message = conversation.createMessage('Hey ho');
      spyOn(message, "delete");
      el.item = message;
      testRoot.addEventListener('layer-message-deleted', function(evt) {
        evt.preventDefault();
      });

      // Run
      el.click();

      // Posttest
      expect(window.confirm).not.toHaveBeenCalled();
      expect(message.delete).not.toHaveBeenCalled();
    });

    it('Should skip window.confirm and Conversation.delete if evt.preventDefault is called', function() {
      // Setup
      var conversation = client.createConversation({
        participants: ['layer:///identities/a', 'layer:///identities/b']
      });
      var message = conversation.createMessage('Hey ho');
      spyOn(conversation, "delete");
      el.item = conversation;
      testRoot.addEventListener('layer-conversation-deleted', function(evt) {
        evt.preventDefault();
      });

      // Run
      el.click();

      // Posttest
      expect(window.confirm).not.toHaveBeenCalled();
      expect(conversation.delete).not.toHaveBeenCalled();

    });
  });
});