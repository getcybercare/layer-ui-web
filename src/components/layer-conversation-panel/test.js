describe('layer-conversation-panel', function() {
  var el, testRoot, client, conversation, user1, query;

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
    el = document.createElement('layer-conversation-panel');
    testRoot.appendChild(el);
    conversation = client.createConversation({
      participants: ['layer:///identities/FrodoTheDodo', 'layer:///identities/SaurumanTheMildlyAged']
    });

    query = client.createQuery({
      model: layer.Query.Message
    });
    query.isFiring = false;
    for (i = 0; i < 100; i++) {
      query.data.push(conversation.createMessage("M " + i).send());
    }

    el.query = query;
    jasmine.clock().tick(1);
  });

  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe('Event Handling', function() {
    it("Should call onMessageDeleted when child triggers layer-message-deleted", function() {
      var spy = jasmine.createSpy('callback');
      el.onMessageDeleted = spy;
      el.firstChild.trigger('layer-message-deleted', {message: query.data[1]});
      expect(spy).toHaveBeenCalledWith(jasmine.any(CustomEvent));
    });

    it("Should call onSendMessage when child triggers layer-send-message", function() {
      var spy = jasmine.createSpy('callback');
      el.onSendMessage = spy;
      el.firstChild.trigger('layer-send-message', {message: conversation.createMessage("hey")});
      expect(spy).toHaveBeenCalledWith(jasmine.any(CustomEvent));
    });

    it("Should call onTypingIndicatorChange when child triggers layer-typing-indicator-change", function() {
      var spy = jasmine.createSpy('callback');
      el.onTypingIndicatorChange = spy;
      el.firstChild.trigger('layer-typing-indicator-change', {});
      expect(spy).toHaveBeenCalledWith(jasmine.any(CustomEvent));
    });
  });

  describe("The query properties", function() {
    beforeEach(function() {
      testRoot.innerHTML = '<layer-conversation-panel></layer-conversation-panel>';
      CustomElements.takeRecords();
      el = testRoot.firstChild;
    });

    it("Should reject a value that isnt in query id format", function() {
      el.queryId = "fred";
      expect(el.queryId).toEqual("");
      expect(el.query).toBe(null);
    });

    it("Should accept a value that is in query id format", function() {
      el.queryId = query.id;
      expect(el.queryId).toEqual(query.id);
      expect(el.query).toBe(null);
    });

    it("Should set the query from queryId if there is a client", function() {
      el.client = client;
      el.queryId = query.id;
      expect(el.queryId).toEqual(query.id);
      expect(el.query).toBe(query);
    });

    it("Should set the list query when query is set", function() {
      expect(el.nodes.list.query).toBe(null);
      el.query = query;
      expect(el.nodes.list.query).toBe(query);
    });

    it("Should destroy the existing query if hasGeneratedQuery is true", function() {
      el.client = client;
      var query2 = client.createQuery({model: layer.Conversation});
      el.query = query2;
      el.properties.hasGeneratedQuery = true;
      el.query = query;
      expect(query2.isDestroyed).toBe(true);
      expect(el.properties.hasGeneratedQuery).toBe(false);
    });

    it("Should not destroy the existing query if hasGeneratedQuery is false", function() {
      el.client = client;
      var query2 = client.createQuery({model: layer.Conversation});
      el.query = query2;
      el.properties.hasGeneratedQuery = false;
      el.query = query;
      expect(query2.isDestroyed).toBe(false);
      expect(el.properties.hasGeneratedQuery).toBe(false);
    });

    it("Should call _scheduleGeneratedQuery once the client is set", function() {
        testRoot.innerHTML = '<layer-conversation-panel></layer-conversation-panel>';
        CustomElements.takeRecords();
        var el = testRoot.firstChild;
        spyOn(el, "_scheduleGeneratedQuery");
        el.client = client;
        expect(el._scheduleGeneratedQuery).toHaveBeenCalledWith();
      });
  });

  describe("The hasGeneratedQuery property", function() {
    it("Should call _setupConversation if set to true", function() {
      el.conversationId = conversation.id;
      el.client = client;
      spyOn(el, "_setupConversation");
      el.hasGeneratedQuery = true;
      expect(el._setupConversation).toHaveBeenCalled();
    });

    it("Should not call _setupConversation if set to false", function() {
      el.conversationId = conversation.id;
      el.client = client;
      spyOn(el, "_setupConversation");
      el.hasGeneratedQuery = false;
      expect(el._setupConversation).not.toHaveBeenCalled();
    });

    it("Should not call _setupConversation if set to true but no conversationId", function() {
      el.conversationId = '';
      el.client = client;
      spyOn(el, "_setupConversation");
      el.hasGeneratedQuery = true;
      expect(el._setupConversation).not.toHaveBeenCalled();
    });

    it("Should not call _setupConversation if no client", function() {
      el.conversationId = conversation.id;
      spyOn(el, "_setupConversation");
      el.hasGeneratedQuery = true;
      expect(el._setupConversation).not.toHaveBeenCalled();
    });
  });

  describe("The conversationId property", function() {
    beforeEach(function() {
      testRoot.innerHTML = '<layer-conversation-panel></layer-conversation-panel>';
      CustomElements.takeRecords();
      el = testRoot.firstChild;
    });

    it("Should ignore if not a properly formatted id", function() {
      el.conversationId = 'Frodo';
      expect(el.conversationId).toEqual('');
    });

    it("Should call _setupConversation if there is a client", function() {
      spyOn(el, "_setupConversation");
      el.client = client;
      el.conversationId = conversation.id;
      expect(el._setupConversation).toHaveBeenCalledWith();
    });

    it("Should call not call _setupConversation if there is not a client", function() {
      spyOn(el, "_setupConversation");
      el.conversationId = conversation.id;
      expect(el._setupConversation).not.toHaveBeenCalled();
    });
  });

  describe("The autoFocusConversation property", function() {
    it("Should default to true", function() {
      testRoot.innerHTML = '<layer-conversation-panel></layer-conversation-panel>';
      CustomElements.takeRecords();
      el = testRoot.firstChild;
      expect(el.autoFocusConversation).toBe(true);
    });

    it("Should be initializable to false", function() {
      testRoot.innerHTML = '<layer-conversation-panel auto-focus-conversation="false"></layer-conversation-panel>';
      CustomElements.takeRecords();
      el = testRoot.firstChild;
      expect(el.autoFocusConversation).toBe(false);
    });

    it("Should be initializable to true", function() {
      testRoot.innerHTML = '<layer-conversation-panel auto-focus-conversation="true"></layer-conversation-panel>';
      CustomElements.takeRecords();
      el = testRoot.firstChild;
      expect(el.autoFocusConversation).toBe(true);
    });
  });

  describe("The client property", function() {
    it("Should setup the conversation if there is a conversationId", function() {
      testRoot.innerHTML = '<layer-conversation-panel conversation-id="' + conversation.id + '"></layer-conversation-panel>';
      CustomElements.takeRecords();
      el = testRoot.firstChild;
      spyOn(el, "_setupConversation");
      el.client = client;
      expect(el._setupConversation).toHaveBeenCalledWith();

      // Inverse Test
      testRoot.innerHTML = '<layer-conversation-panel></layer-conversation-panel>';
      CustomElements.takeRecords();
      el = testRoot.firstChild;
      spyOn(el, "_setupConversation");
      el.client = client;
      expect(el._setupConversation).not.toHaveBeenCalled();
    });

    it("Should setup the query if there is a queryId", function() {
      testRoot.innerHTML = '<layer-conversation-panel query-id="' + query.id + '"></layer-conversation-panel>';
      CustomElements.takeRecords();
      el = testRoot.firstChild;
      expect(el.query).toBe(null);
      el.client = client;
      expect(el.query).toBe(query);

      // Inverse test
      testRoot.innerHTML = '<layer-conversation-panel></layer-conversation-panel>';
      CustomElements.takeRecords();
      el = testRoot.firstChild;
      expect(el.query).toBe(null);
      el.client = client;
      expect(el.query).toBe(null);
    });
  });

  describe("The onRenderListItem property", function() {
    it("Should set the list onRenderListItem property", function() {
      var f = function() {};
      el.onRenderListItem = f;
      expect(el.nodes.list.onRenderListItem).toBe(f);
    });
  });

  describe("The emptyMessageListNode property", function() {
    it("Should set the list emptyNode property", function() {
      var div = document.createElement('div');
      el.emptyMessageListNode = div;
      expect(el.nodes.list.emptyNode).toBe(div);
    });
  });

  describe("The composeButtons property", function() {
    it("Should set the list composeButtons property", function() {
      var buttons = [document.createElement("button"), document.createElement("button")];
      el.composeButtons = buttons
      expect(el.nodes.composer.buttons).toBe(buttons);
    });
  });


  describe("The composeText property", function() {
    it("Should set the list composeText property", function() {
      el.composeText = "Frodo Must Cry";
      expect(el.nodes.composer.value).toEqual("Frodo Must Cry");
    });
  });

  describe("The composePlaceholder property", function() {
    it("Should set the list composePlaceholder property", function() {
      el.composePlaceholder = "Frodo Must Cry";
      expect(el.nodes.composer.placeholder).toEqual("Frodo Must Cry");
    });
  });

  describe("The dateRenderer property", function() {
    it("Should pass the property to the list", function() {
      var f = function() {}
      el.dateRenderer = f;
      expect(el.nodes.list.dateRenderer).toBe(f);
    });
  });

  describe("The messageStatusRenderer property", function() {
    it("Should pass the property to the list", function() {
      var f = function() {}
      el.messageStatusRenderer = f;
      expect(el.nodes.list.messageStatusRenderer).toBe(f);
    });
  });

  describe("The created() method", function() {
    it("Should setup basic properties", function() {
      expect(el.nodes.list.tagName).toEqual('LAYER-MESSAGES-LIST');
      expect(el.nodes.composer.tagName).toEqual('LAYER-COMPOSER');
      expect(el.nodes.typingIndicators.tagName).toEqual('LAYER-TYPING-INDICATOR');
    });

    it("Should set a tabIndex of -1 if its unset", function() {
      expect(el.tabIndex).toEqual(-1);

      // Inverse
      testRoot.innerHTML = '<layer-conversation-panel tabindex="5"></layer-conversation-panel>';
      CustomElements.takeRecords();
      el = testRoot.firstChild;
      expect(el.tabIndex).toEqual(5);
    });
  });

  describe("The _onKeyDown() method", function() {
    beforeEach(function() {
      spyOn(el, "focusText");
    });

    it("Should call focusText if a character is hit while not focusing on an input", function(done) {
      el.focus();
      jasmine.clock().uninstall();
      setTimeout(function() {
        el._onKeyDown({
          keyCode: 70,
          metaKey: false,
          ctrlKey: false
        });
        expect(el.focusText).toHaveBeenCalledWith();
        done();
      }, 1);
    });

    it("Should not call focusText if a character is hit while focusing on an input", function() {
      var input = document.createElement("input");
      testRoot.appendChild(input);
      input.focus();
      el._onKeyDown({
        keyCode: 70,
        metaKey: false,
        ctrlKey: false
      });
      expect(el.focusText).not.toHaveBeenCalled();
    });

    it("Should not call focusText if a charater is hit while holding a metaKey or ctrlKey", function() {
      el._onKeyDown({
        keyCode: 70,
        metaKey: false,
        ctrlKey: true
      });
      expect(el.focusText).not.toHaveBeenCalled();
    });

    it("Should not call focusText if a non-character key is hit", function() {
      el._onKeyDown({
        keyCode: 4,
        metaKey: false,
        ctrlKey: false
      });
      expect(el.focusText).not.toHaveBeenCalled();
    });
  });

  describe("The focusText() method", function() {
    it("Should call the composers focus method", function() {
      spyOn(el.nodes.composer, "focus");
      el.focusText();
      expect(el.nodes.composer.focus).toHaveBeenCalledWith();
    });
  });

  describe("The _setupConversation() method", function() {
    beforeEach(function() {
      el.client = client;
    });
    it("Should setup the composers Conversation", function() {
      expect(el.nodes.composer.conversation).toBe(null);
      el.conversationId = conversation.id;
      expect(el.nodes.composer.conversation).toBe(conversation);
    });

    it("Should setup the typing-indicators Conversation", function() {
      expect(el.nodes.typingIndicators.conversation).toBe(null);
      el.conversationId = conversation.id;
      expect(el.nodes.typingIndicators.conversation).toBe(conversation);

    });

    it("Should call focusText if autoFocusConversation", function() {
      spyOn(el, "focusText");
      el.conversationId = conversation.id;
      expect(el.focusText).toHaveBeenCalledWith();

      // Inverse
      el.focusText.calls.reset();
      el.autoFocusConversation = false;
      el.conversationId = conversation.id;
      expect(el.focusText).not.toHaveBeenCalled();
    });
  });
});