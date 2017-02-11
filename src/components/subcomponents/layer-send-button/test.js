describe('layer-send-button', function() {
  var el, testRoot;
  beforeEach(function() {
    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({});
    testRoot = document.createElement('div');
    el = document.createElement('layer-send-button');
    testRoot.appendChild(el);
    document.body.appendChild(testRoot);
    layer.Util.defer.flush();
  });

  it("Should use the text property", function() {
    el.text = "hey ho";
    expect(el.firstChild.innerHTML).toEqual("hey ho");
  });

  it("Should trigger layer-send-click onClick", function() {
    var eventSpy = jasmine.createSpy('eventListener');
    document.body.addEventListener('layer-send-click', eventSpy);

    // Run
    el.click();

    // Posttest
    expect(eventSpy).toHaveBeenCalledWith(jasmine.any(Event));
  });
});