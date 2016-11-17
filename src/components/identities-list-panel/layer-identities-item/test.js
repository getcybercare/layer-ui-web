describe('layer-identity-item', function() {
  var el, testRoot, client;
  beforeEach(function() {
    client = new layer.Client({
      appId: 'Fred'
    });
    client.user = new layer.Identity({
      client: client,
      userId: 'FrodoTheDodo',
      id: 'layer:///identities/FrodoTheDodo',
      displayName: 'Frodo is a Dodo',
      isFullIdentity: true
    });
    client._clientAuthenticated();

    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
    el = document.createElement('layer-identity-item');
    testRoot.appendChild(el);
    el.item = client.user;
  });
  afterEach(function() {
    document.body.removeChild(testRoot);
  });

  describe("The selected property", function() {
    it("Should update checkbox state", function() {
      expect(el.nodes.checkbox.checked).toBe(false);
      el.selected = true;
      expect(el.nodes.checkbox.checked).toBe(true);
      el.selected = false;
      expect(el.nodes.checkbox.checked).toBe(false);
    });

    it("Should update layer-identity-item-selected class", function() {
      expect(el.innerNode.classList.contains('layer-identity-item-selected')).toBe(false);
      el.selected = true;
      expect(el.innerNode.classList.contains('layer-identity-item-selected')).toBe(true);
      el.selected = false;
      expect(el.innerNode.classList.contains('layer-identity-item-selected')).toBe(false);
    });

    it("Should get the checkbox state", function() {
      el.nodes.checkbox.checked = false;
      expect(el.selected).toBe(false);
      el.nodes.checkbox.checked = true;
      expect(el.selected).toBe(true);
    });

    it("Should get the selected state if no checkbox", function() {
      el.nodes.checkbox = null;
      el.properties.selected = false;
      expect(el.selected).toBe(false);
      el.properties.selected = true;
      expect(el.selected).toBe(true);
    });
  });

  describe("The create() method", function() {
    it("Should initialize selected to true from innerHTML", function() {
      testRoot.innerHTML = '<layer-identity-item selected="true"></layer-identity-item>';
      CustomElements.takeRecords();
      expect(testRoot.firstChild.selected).toBe(true);
      expect(testRoot.firstChild.nodes.checkbox.checked).toBe(true);
    });

    it("Should initialize selected to false from innerHTML", function() {
      testRoot.innerHTML = '<layer-identity-item selected="false"></layer-identity-item>';
      CustomElements.takeRecords();
      expect(testRoot.firstChild.selected).toBe(false);
      expect(testRoot.firstChild.nodes.checkbox.checked).toBe(false);
    });

    it("Should initialize selected with default of false from innerHTML", function() {
      testRoot.innerHTML = '<layer-identity-item></layer-identity-item>';
      CustomElements.takeRecords();
      expect(testRoot.firstChild.selected).toBe(false);
      expect(testRoot.firstChild.nodes.checkbox.checked).toBe(false);
    });

    it("Should wire up the _onChange event handler", function() {
      var called = false;
      el.addEventListener('layer-identity-item-selected', function(evt) {
        called = true;
      });

      // Run
      el.nodes.checkbox.click();

      // Posttest
      expect(called).toBe(true);
    });

    it("Should setup the label for attribute", function() {
      expect(el.nodes.checkbox.id.length > 0).toBe(true);
      expect(el.nodes.title.getAttribute('for')).toEqual(el.nodes.checkbox.id);
    });
  });

  describe("The _onChange() method", function() {
    it("Should trigger layer-identity-item-selected", function() {
      var selectedCalled = false,
        deselectedCalled = false;
      el.addEventListener('layer-identity-item-selected', function(evt) {
        selectedCalled = true;
      });
      el.addEventListener('layer-identity-item-deselected', function(evt) {
        deselectedCalled = true;
      });

      // Run
      el.nodes.checkbox.click();

      // Posttest
      expect(deselectedCalled).toBe(false);
      expect(selectedCalled).toBe(true);
    });

    it("Should trigger layer-identity-item-deselected", function() {
      el.selected = true;

      var selectedCalled = false,
        deselectedCalled = false;
      el.addEventListener('layer-identity-item-selected', function(evt) {
        selectedCalled = true;
      });
      el.addEventListener('layer-identity-item-deselected', function(evt) {
        deselectedCalled = true;
      });

      // Run
      el.nodes.checkbox.click();

      // Posttest
      expect(deselectedCalled).toBe(true);
      expect(selectedCalled).toBe(false);
    });

    it("Should update the layer-identity-item-selected if evt.preventDefault not called", function() {
      expect(el.innerNode.classList.contains('layer-identity-item-selected')).toBe(false);
      el.nodes.checkbox.click();
      expect(el.innerNode.classList.contains('layer-identity-item-selected')).toBe(true);
      el.nodes.checkbox.click();
      expect(el.innerNode.classList.contains('layer-identity-item-selected')).toBe(false);
    });

    it("Should undo the change if evt.preventDefault was called", function() {
      el.addEventListener('layer-identity-item-selected', function(evt) {
        evt.preventDefault();
      });
      el.addEventListener('layer-identity-item-deselected', function(evt) {
        evt.preventDefault();
      });

      expect(el.innerNode.classList.contains('layer-identity-item-selected')).toBe(false);
      expect(el.nodes.checkbox.checked).toBe(false);
      el.nodes.checkbox.click();
      expect(el.innerNode.classList.contains('layer-identity-item-selected')).toBe(false);
      expect(el.nodes.checkbox.checked).toBe(false);

      el.selected = true;
      expect(el.innerNode.classList.contains('layer-identity-item-selected')).toBe(true);
      expect(el.nodes.checkbox.checked).toBe(true);
      el.nodes.checkbox.click();
      expect(el.innerNode.classList.contains('layer-identity-item-selected')).toBe(true);
      expect(el.nodes.checkbox.checked).toBe(true);
    });
  });

  describe("The _render() method", function() {
    it("Should setup the layer-avatar users", function() {
      el.nodes.avatar.users = [];
      el._render();
      expect(el.nodes.avatar.users).toEqual([client.user]);
    });

    it("Should _render the displayName", function() {
      el.nodes.title.innerHTML = '';
      el._render();
      expect(el.nodes.title.innerHTML).toEqual(client.user.displayName);
    });

    it("Should update the displayName when it changes", function() {
      client.user.displayName = 'Quick change it back!';
      client.user.trigger('identities:change', {property: 'displayName', oldValue: 'Frodo', newValue: client.user.displayName});
      expect(el.nodes.title.innerHTML).toEqual(client.user.displayName);
    });
  });

  describe("The _runFilter() method", function() {
    it("Should add layer-item-filtered if not a match", function() {
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter('Samwise');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
    });

    it("Should remove layer-item-filtered if it is a match", function() {
      el.classList.add('layer-item-filtered');
      el._runFilter('Frodo');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match on substring against displayName, firstName, lastName and emailAddress", function() {
      var user = client.user;
      el._runFilter('froDo');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter('MoJo');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      user.firstName = 'Mojo';
      el._runFilter('MoJo');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter('POJO');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      user.lastName = 'pojO';
      el._runFilter('POJO');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter('pojo@layer');
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      user.emailAddress = 'pojo@layer.com';
      el._runFilter('pojo@layer');
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match on RegEx against displayName, firstName, lastName and emailAddress", function() {
      var user = client.user;
      el._runFilter(/froDo/);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);
      el._runFilter(/froDo/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter(/moJo/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      user.firstName = 'Mojo';
      el._runFilter(/moJo/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter(/POJO/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      user.lastName = 'pojO';
      el._runFilter(/POJO/i);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
      el._runFilter(/pojo@layer/);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      user.emailAddress = 'pojo@layer.com';
      el._runFilter(/pojo@layer/);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match on Callback against displayName, firstName, lastName and emailAddress", function() {
      function test(user) {
        return user.firstName == 'Frodo';
      }
      el._runFilter(test);
      expect(el.classList.contains('layer-item-filtered')).toBe(true);

      client.user.firstName = 'Frodo';
      el._runFilter(test);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });

    it("Should match if no filter", function() {
      el._runFilter(null);
      expect(el.classList.contains('layer-item-filtered')).toBe(false);
    });
  });

  describe("Mixin list-item", function() {
    describe("The customNodeAbove property", function() {
      it("Should add a string", function() {
        el.customNodeAbove = 'hello';
        expect(el.customNodeAbove.innerHTML).toEqual('hello');
        expect(el.firstChild).toBe(el.customNodeAbove);
        expect(el.childNodes.length).toEqual(2);
      });

      it("Should replace a string", function() {
        el.customNodeAbove = 'hello';
        el.customNodeAbove = 'there';
        expect(el.customNodeAbove.innerHTML).toEqual('there');
        expect(el.firstChild).toBe(el.customNodeAbove);
        expect(el.childNodes.length).toEqual(2);
      });

      it("Should remove a string", function() {
        el.customNodeAbove = 'hello';
        el.customNodeAbove = '';
        expect(el.customNodeAbove).toBe(null);
        expect(el.firstChild).toBe(el.innerNode);
        expect(el.childNodes.length).toEqual(1);
      });

      it("Should add a node", function() {
        var div1 = document.createElement('div');
        el.customNodeAbove = div1;
        expect(el.customNodeAbove).toBe(div1);
        expect(el.firstChild).toBe(div1);
        expect(el.childNodes.length).toEqual(2);
      });

      it("Should replace a node", function() {
        var div1 = document.createElement('div');
        var div2 = document.createElement('div');
        el.customNodeAbove = div1;
        el.customNodeAbove = div2;
        expect(el.customNodeAbove).toBe(div2);
        expect(el.firstChild).toBe(div2);
        expect(el.childNodes.length).toEqual(2);
        expect(div1.parentNode).toBe(null);
      });

      it("Should remove a node", function() {
        var div1 = document.createElement('div');
        el.customNodeAbove = div1;
        el.customNodeAbove = null;
        expect(el.customNodeAbove).toBe(null);
        expect(el.firstChild).toBe(el.innerNode);
        expect(el.childNodes.length).toEqual(1);
      });
    });

    describe("The customNodeBelow property", function() {
      it("Should add a string", function() {
        el.customNodeBelow = 'hello';
        expect(el.customNodeBelow.innerHTML).toEqual('hello');
        expect(el.childNodes[1]).toBe(el.customNodeBelow);
        expect(el.childNodes.length).toEqual(2);
      });

      it("Should replace a string", function() {
        el.customNodeBelow = 'hello';
        el.customNodeBelow = 'there';
        expect(el.customNodeBelow.innerHTML).toEqual('there');
        expect(el.childNodes[1]).toBe(el.customNodeBelow);
        expect(el.childNodes.length).toEqual(2);
      });

      it("Should remove a string", function() {
        el.customNodeBelow = 'hello';
        el.customNodeBelow = '';
        expect(el.customNodeBelow).toBe(null);
        expect(el.firstChild).toBe(el.innerNode);
        expect(el.childNodes.length).toEqual(1);
      });

      it("Should add a node", function() {
        var div1 = document.createElement('div');
        el.customNodeBelow = div1;
        expect(el.customNodeBelow).toBe(div1);
        expect(el.childNodes[1]).toBe(div1);
        expect(el.childNodes.length).toEqual(2);
      });

      it("Should replace a node", function() {
        var div1 = document.createElement('div');
        var div2 = document.createElement('div');
        el.customNodeBelow = div1;
        el.customNodeBelow = div2;
        expect(el.customNodeBelow).toBe(div2);
        expect(el.childNodes[1]).toBe(div2);
        expect(el.childNodes.length).toEqual(2);
        expect(div1.parentNode).toBe(null);
      });

      it("Should remove a node", function() {
        var div1 = document.createElement('div');
        el.customNodeBelow = div1;
        el.customNodeBelow = null;
        expect(el.customNodeBelow).toBe(null);
        expect(el.firstChild).toBe(el.innerNode);
        expect(el.childNodes.length).toEqual(1);
      });
    });

    describe("The innerNode property", function() {
      it("Should point to our user data", function() {
        expect(el.innerNode.childNodes[0].tagName).toEqual('LAYER-AVATAR');
        expect(el.innerNode.childNodes[1].tagName).toEqual('LABEL');
        expect(el.innerNode.childNodes[2].tagName).toEqual('INPUT');
      });
    });

    describe("The firstInSeries property", function() {
      it("Should default to false", function() {
        expect(el.classList.contains('layer-list-item-first')).toBe(false);
      });
      it("Should update layer-list-item-first class", function() {
        el.firstInSeries = true;
        expect(el.classList.contains('layer-list-item-first')).toBe(true);

        el.firstInSeries = false;
        expect(el.classList.contains('layer-list-item-first')).toBe(false);
      });
    })

    describe("The lastInSeries property", function() {
      it("Should default to false", function() {
        expect(el.classList.contains('layer-list-item-last')).toBe(false);
      });
      it("Should update layer-list-item-last class", function() {
        el.lastInSeries = true;
        expect(el.classList.contains('layer-list-item-last')).toBe(true);

        el.lastInSeries = false;
        expect(el.classList.contains('layer-list-item-last')).toBe(false);
      });
    });
  });
});