describe('layer-file-upload-button', function() {
  var el, testRoot;
  beforeEach(function() {
    layerUI.init({layer: layer});
    testRoot = document.createElement('div');
    el = document.createElement('layer-file-upload-button');
    testRoot.appendChild(el);
    document.body.appendChild(testRoot);
  });

  it("Should setup a label pointing to a file input", function() {
    expect(el.nodes.label.getAttribute("for")).toEqual(el.nodes.input.id);
    expect(el.nodes.input.id.length > 0).toBe(true);
  });

  it("Should call layerUI.files.processAttachments onChange", function() {
    var spy = jasmine.createSpy('processAttachments');
    var tmp = layerUI.files.processAttachments;
    layerUI.files.processAttachments = spy;
    el.nodes.input = {
      files: []
    }

    // Run
    el._onChange();

    // Posttest
    expect(spy).toHaveBeenCalledWith([], jasmine.any(Function));

    // Cleanup
    layerUI.files.processAttachments = tmp;
  });

  it("Should trigger layer-file-selected _onChange", function() {
    var part = new layer.MessagePart({body: "Frodo is a Dodo", mimeType: "text/plain"});
    var spy = jasmine.createSpy('processAttachments').and.callFake(function(a, callback) {
      callback([part]);
    });
    var tmp = layerUI.files.processAttachments;
    layerUI.files.processAttachments = spy;
    el.nodes.input = {
      files: []
    }

    var eventSpy = jasmine.createSpy('eventListener');
    document.body.addEventListener('layer-file-selected', eventSpy);

    // Run
    el._onChange();

    // Posttest
    var args = eventSpy.calls.allArgs()[0];
    expect(args.length).toEqual(1);
    expect(args[0].detail).toEqual({ parts: [part] });

    // Cleanup
    layerUI.files.processAttachments = tmp;
  });
});