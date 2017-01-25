describe("State property", function() {
  var testRoot;

  beforeAll(function() {
    layerUI.init({layer: layer});
  });

  beforeEach(function() {
    jasmine.clock().install();
    testRoot = document.createElement('div');
    document.body.appendChild(testRoot);
  });

  afterEach(function() {
    try {
      jasmine.clock().uninstall();
      document.body.removeChild(testRoot);
    } catch(e) {}
  });

  it("Should trigger onRenderState", function() {
    layerUI.registerComponent('state-test1', {});
    var el = document.createElement('state-test1');
    layer.Util.defer.flush();

    spyOn(el, "onRenderState");
    el.state = {hey: "ho"};
    expect(el.onRenderState).toHaveBeenCalledWith();
  });

  it("Should be set to its parent when onAttached is called", function() {
    layerUI.registerComponent('state-test2', {});
    var elParent = document.createElement('layer-avatar');
    elParent.state = {hey: "ho2"};
    var el = document.createElement('state-test2');
    elParent.nodes.el = el;
    spyOn(el, "onRenderState");
    elParent.appendChild(el);
    testRoot.appendChild(elParent);

    layer.Util.defer.flush();
    expect(el.state).toEqual({hey: "ho2"});
    expect(el.onRenderState).toHaveBeenCalledWith();
    expect(el.onRenderState.calls.count()).toEqual(1);

    elParent.state = {hey: "ho3"};
    expect(el.onRenderState.calls.count()).toEqual(2);
  });

  it("Should not call onRenderState if no state is set", function() {
    layerUI.registerComponent('state-test3', {});
    var elParent = document.createElement('layer-avatar');
    var el = document.createElement('state-test3');
    spyOn(el, "onRenderState");
    elParent.appendChild(el);
    testRoot.appendChild(elParent);
    layer.Util.defer.flush();
    expect(el.state).toEqual(null);
    expect(el.onRenderState).not.toHaveBeenCalled();
  });
});
