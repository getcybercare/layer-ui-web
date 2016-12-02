describe('layer-composer', function() {
  var el, testRoot, client, conversation;

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
    el = document.createElement('layer-composer');
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

    it("Should call _setTypingListenerConversation", function() {
      spyOn(el, "_setTypingListenerConversation");
      el.conversation = conversation;
      expect(el._setTypingListenerConversation).toHaveBeenCalledWith();
    });
  });

  describe("The client property", function() {
    it("Should setup a typingListener, but not setup the Conversation", function() {
      spyOn(client, "createTypingListener").and.callThrough();
      el.client = client;
      expect(client.createTypingListener).toHaveBeenCalledWith(el.nodes.input);
      expect(el.properties.typingListener.conversation).toBe(null);
    });

    it("Should setup a typingListener and the Conversation", function() {
      spyOn(client, "createTypingListener").and.callThrough();
      el.conversation = conversation;
      expect(client.createTypingListener).toHaveBeenCalledWith(el.nodes.input);
      expect(el.properties.typingListener.conversation).toBe(conversation);
    });
  });

  describe("The buttons property", function() {
    it("Should pass buttons to the button panel", function() {
      var div1 = document.createElement("div"),
        div2 = document.createElement("div");
      el.buttons = [div1, div2];
      expect(el.nodes.buttonPanel.buttons).toEqual([div1, div2]);
    });
  });

  describe("The value property", function() {
    it("Should set the text in the composer", function() {
      el.value = "Please eat Frodo";
      expect(el.nodes.input.value).toEqual("Please eat Frodo");
    });

    it("Should resize the composer if needed", function() {
      var width = el.clientWidth;
      var height = el.clientHeight;
      el.value = new Array(500).join('Please eat Frodo');
      jasmine.clock().tick(100);
      expect(width).toEqual(el.clientWidth);
      expect(height * 2 < el.clientHeight).toBe(true);
    });

    it("Should retreive the value in the composer", function() {
      el.nodes.input.value = "Please Gollum, just eat him";
      expect(el.value).toEqual("Please Gollum, just eat him");
    });
  });

  describe("The placeholder property", function() {
    it("Should set the text in the composer", function() {
      el.placeholder = "Please eat Frodo";
      expect(el.nodes.input.placeholder).toEqual("Please eat Frodo");
    });

    it("Should retreive the placeholder in the composer", function() {
      el.nodes.input.placeholder = "Please Gollum, just eat him";
      expect(el.placeholder).toEqual("Please Gollum, just eat him");
    });
  });

  describe("The created() method", function() {
    it("Should add the layer-composer-one-line-of-text class", function() {
      expect(el.classList.contains('layer-composer-one-line-of-text')).toBe(true);
    });

    it("Should setup input, resizer and lineHeighter", function() {
      expect(el.nodes.input).toEqual(jasmine.any(HTMLTextAreaElement));
      expect(el.nodes.resizer).toEqual(jasmine.any(HTMLElement));
      expect(el.nodes.lineHeighter).toEqual(jasmine.any(HTMLElement));
    });

    it("Should setup buttonPanel and editPanel", function() {
      expect(el.nodes.buttonPanel).toEqual(jasmine.any(HTMLElement));
      expect(el.nodes.editPanel).toEqual(jasmine.any(HTMLElement));
    });

    it("Should wire up layer-file-selected to handleAttachments", function() {
      el.properties.conversation = conversation;
      var parts = [new layer.MessagePart({body: "After death he became Lord Dork Laugh", mimeType: "text/plain"})];
      var evt = new CustomEvent('layer-file-selected', {
        detail: {parts: parts},
        bubbles: true,
        cancelable: true
      });
      spyOn(el, 'send');

      // Run
      el.nodes.buttonPanel.dispatchEvent(evt);

      // Posttest
      expect(el.send).toHaveBeenCalled();
    });
  });

  describe("The focus() method", function() {
    it("Should set the focus", function() {
      expect(document.activeElement).toBe(document.body);
      el.focus();
      expect(document.activeElement).toBe(el.nodes.input);
    });
  });

  describe("The _setTypingListenerConversation() method", function() {
    it("Should update the conversation being reported upon", function() {
      el.client = client;
      el.properties.conversation = conversation;
      expect(el.properties.typingListener.conversation).toBe(null);
      el._setTypingListenerConversation();
      expect(el.properties.typingListener.conversation).toBe(conversation);
    });
  });

  describe("The send() method", function() {
    beforeEach(function() {
      el.value = "Frodo shall hang until he is dead or until we get tired of watching him laugh at us";
      el.conversation = conversation;
    });

    it("Should clear the input", function() {
      el.send();
      expect(el.value).toEqual("");
    });

    it("Should trigger layer-send-message and send the message typed", function() {
      var calledFor = null;
      document.body.addEventListener("layer-send-message", function(evt) {
        calledFor = evt.detail.message;
      });
      el.send();


      expect(calledFor.parts[0].body).toEqual("Frodo shall hang until he is dead or until we get tired of watching him laugh at us");
      expect(calledFor.syncState).toEqual(layer.Constants.SYNC_STATE.SAVING);
    });

    it("Should trigger layer-send-message and cancel the message on evt.preventDefault()", function() {
      var calledFor = null;
      document.body.addEventListener("layer-send-message", function(evt) {
        calledFor = evt.detail.message;
        evt.preventDefault();
      });
      el.send();

      expect(calledFor.parts[0].body).toEqual("Frodo shall hang until he is dead or until we get tired of watching him laugh at us");
      expect(calledFor.syncState).toEqual(layer.Constants.SYNC_STATE.NEW);
    });

    it("Should send optional parts and leave text as-is", function() {
      var parts = [new layer.MessagePart({body: "After death he became Lord Dork Laugh", mimeType: "text/plain"})];

      var calledFor = null;
      document.body.addEventListener("layer-send-message", function(evt) {
        calledFor = evt.detail.message;
        evt.preventDefault();
      });

      // Run
      el.send(parts);

      // Posttest
      expect(calledFor.parts.length).toEqual(1);
      expect(calledFor.parts[0].body).toEqual("After death he became Lord Dork Laugh");
      expect(el.value).toEqual("Frodo shall hang until he is dead or until we get tired of watching him laugh at us");
    });
  });

  describe("The _onKeyDown() method", function() {
    it("Should preventDefault on ENTER and call send", function() {
      spyOn(el, 'send');
      var preventSpy = jasmine.createSpy('preventDefault');
      el._onKeyDown({
        preventDefault: preventSpy,
        keyCode: 13,
        shiftKey: false,
        ctrlKey: false
      });
      expect(el.send).toHaveBeenCalledWith();
      expect(preventSpy).toHaveBeenCalledWith();
    });

    it("Should allow ENTER if shifted", function() {
      spyOn(el, 'send');
      var preventSpy = jasmine.createSpy('preventDefault');
      el._onKeyDown({
        preventDefault: preventSpy,
        keyCode: 13,
        shiftKey: true,
        ctrlKey: false,
        target: el.nodes.input
      });
      expect(el.send).not.toHaveBeenCalledWith();
      expect(preventSpy).not.toHaveBeenCalledWith();
    });

    it("Should preventDefault and insert a tab if tabs are enabled", function() {
      spyOn(el, 'send');
      var preventSpy = jasmine.createSpy('preventDefault');
      el._onKeyDown({
        preventDefault: preventSpy,
        keyCode: 9,
        shiftKey: false,
        ctrlKey: false,
        target: el.nodes.input
      });
      expect(el.send).not.toHaveBeenCalledWith();
      expect(preventSpy).toHaveBeenCalledWith();
      expect(el.nodes.input.value).toEqual("\t  ");
    });

    it("Should not preventDefault nor insert a tab if tabs are not enabled", function() {
      layerUI.settings.disableTabAsWhiteSpace = true;
      var preventSpy = jasmine.createSpy('preventDefault');
      el._onKeyDown({
        preventDefault: preventSpy,
        keyCode: 9,
        shiftKey: false,
        ctrlKey: false,
        target: el.nodes.input
      });
      expect(preventSpy).not.toHaveBeenCalledWith();
      expect(el.nodes.input.value).toEqual("");
    });

    it("Should call _resizeNode() whether its an ENTER or a letter", function() {
      spyOn(el, "_resizeNode");
      var preventSpy = jasmine.createSpy('preventDefault');
      el._onKeyDown({
        preventDefault: preventSpy,
        keyCode: 9,
        shiftKey: false,
        ctrlKey: false,
        target: el.nodes.input
      });
      expect(el._resizeNode).toHaveBeenCalledWith();
    });
  });

  describe("The _resizeNode() method", function() {
    it("Should assign resizer and lineHeighter the same value as input", function() {
      el.value = "Please eat Frodo\nand then we can at last digest the Shire";
      el.nodes.resizer.innerHTML = '';
      el.nodes.lineHeighter.innerHTML = '';

      // Run
      el._resizeNode();
      jasmine.clock().tick(100);

      // Posttest
      expect(el.nodes.resizer.innerHTML).toEqual("Please eat Frodo<br>and then we can at last digest the Shire");
      expect(el.nodes.lineHeighter.innerHTML).toEqual("Please eat Frodo<br>and then we can at last digest the Shire");
    });

    it("Should assign resizer and lineHeighter non-breaking-space if input is empty", function() {
      el.value = "";
      el.nodes.resizer.innerHTML = '';
      el.nodes.lineHeighter.innerHTML = '';

      // Run
      el._resizeNode();
      jasmine.clock().tick(100);

      // Posttest
      expect(el.nodes.resizer.innerHTML).toEqual("&nbsp;");
      expect(el.nodes.lineHeighter.innerHTML).toEqual("&nbsp;");
    });

    it("Should add and remove layer-composer-one-line-of-text", function() {
      el.value = new Array(30).join('Frodo is a Dodo');
      el.nodes.resizer.innerHTML = '';
      el.nodes.lineHeighter.innerHTML = '';

      // Run
      el._resizeNode();
      jasmine.clock().tick(100);

      // Posttest
      expect(el.classList.contains('layer-composer-one-line-of-text')).toBe(false);

      // Run 2
      el.value = new Array(1).join('Frodo is a Dodo');
      el.nodes.resizer.innerHTML = '';
      el.nodes.lineHeighter.innerHTML = '';
      el._resizeNode();
      jasmine.clock().tick(100);

      // Posttest
      expect(el.classList.contains('layer-composer-one-line-of-text')).toBe(true);
    });
  });

  describe("The handleAttachments() method", function() {
    it("Should call send with its parts", function() {
      var parts = [new layer.MessagePart({body: "After death he became Lord Dork Laugh", mimeType: "text/plain"})];
      var evt = new CustomEvent('layer-file-selected', {
        detail: {parts: parts},
        bubbles: true,
        cancelable: true
      });
      spyOn(el, 'send');

      // Run
      el.nodes.buttonPanel.dispatchEvent(evt);

      // Posttest
      expect(el.send).toHaveBeenCalledWith(parts);
    });
  });
});