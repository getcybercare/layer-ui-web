describe('layer-date', function() {
  var el;
  beforeEach(function() {
    if (layerUI.components['layer-conversation-panel'] && !layerUI.components['layer-conversation-panel'].classDef) layerUI.init({});
    el = document.createElement('layer-date');
    layer.Util.defer.flush();
  });

  it('Should accept a date parameter', function() {
    var d = new Date();
    el.date = d;
    expect(el.date).toEqual(d);
  });

  it('Should render time only if today', function() {
    var d = new Date();
    el.date = d;
    expect(el.innerHTML).toEqual(d.toLocaleTimeString());
  });

  it('Should render date and time if not today', function() {
    var d = new Date();
    d.setDate(d.getDate() - 1);
    el.date = d;
    expect(el.innerHTML).toEqual(d.toLocaleDateString() + ' ' + d.toLocaleTimeString());
  });

  it('Should rerender to new date', function() {
    var d = new Date();
    el.date = d;

    var d2 = new Date();
    d2.setDate(d.getDate() - 1);
    el.date = d2;
    expect(el.innerHTML).toEqual(d2.toLocaleDateString() + ' ' + d2.toLocaleTimeString());
  });

  it('Should rerender to empty', function() {
    var d = new Date();
    el.date = d;
    el.date = null;
    expect(el.innerHTML).toEqual('');
  });

  it("Should use dateRenderer if provided", function() {
    var f = function() {return "Some Day";}
    el.dateRenderer = f;
    var d = new Date();
    el.date = d;
    expect(el.innerHTML).toEqual("Some Day");
  });
});