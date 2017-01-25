describe('Components', function() {
  var el, testRoot, client, query;

  beforeAll(function() {
    layerUI.init({});
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

  describe("The Lifecycle and Mixin Methods", function() {
    it("Should call lifecycle methods in correct order", function() {
      // Setup
      var calls = [];
      layerUI.registerComponent('lifecycle-test', {
        properties: {
          prop1: {
            value: 55,
            set: function(inValue) {
              expect(this.properties.prop1).toEqual(inValue);
              expect(this.properties.prop1).toEqual(55);
              calls.push('prop1');
            }
          }
        },
        methods: {
          onCreate: function() {calls.push('onCreate');},
          onAfterCreate: function() {calls.push('onAfterCreate');},
          onAttach: function() {calls.push('onAttach');},
          onRender: function() {calls.push('onRender');},
          onDetach: function() {calls.push('onDetach');},
          onDestroy: function() {calls.push('onDestroy');}
        }
      });

      // Run create
      var el = document.createElement('lifecycle-test');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      layer.Util.defer.flush();

      expect(calls).toEqual(['onCreate', 'prop1', 'onAfterCreate', 'onRender', 'onAttach']);

      // Run removal
      testRoot.removeChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();
      expect(calls).toEqual(['onCreate', 'prop1', 'onAfterCreate', 'onRender', 'onAttach', 'onDetach']);

      jasmine.clock().tick(1000000);
      expect(calls).toEqual(['onCreate', 'prop1', 'onAfterCreate', 'onRender', 'onAttach', 'onDetach', 'onDestroy']);
    });

    it("Should call mixins in correct order", function() {
      // Setup
      var calls = [];
      var mixin1 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.AFTER,
            value: function() {
              calls.push('after');
            }
          }
        }
      };

      var mixin2 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.BEFORE,
            value: function() {
              calls.push('before');
            }
          }
        }
      };

      var mixin3 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.DEFAULT,
            value: function() {
              calls.push('middle1');
            }
          }
        }
      };

      var mixin4 = {
        methods: {
          onCreate: function() {
            calls.push('middle2');
          }
        }
      };

      layerUI.registerComponent('mixin-test1', {
        mixins: [mixin1, mixin2, mixin3, mixin4],
        methods: {
          onCreate: function() {
            calls.push('widget');
          }
        }
      });

      // Run
      var el = document.createElement('mixin-test1');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(calls).toEqual(['before', 'widget', 'middle1', 'middle2', 'after']);
    });

    it("Should call mixin overwrite only", function() {
      // Setup
      var calls = [];
      var mixin1 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.AFTER,
            value: function() {
              calls.push('after');
            }
          }
        }
      };

      var mixin2 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.BEFORE,
            value: function() {
              calls.push('before');
            }
          }
        }
      };

      var mixin3 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.OVERWRITE,
            value: function() {
              calls.push('overwrite');
            }
          }
        }
      };

      var mixin4 = {
        methods: {
          onCreate: function() {
            calls.push('middle2');
          }
        }
      };

      layerUI.registerComponent('mixin-test2', {
        mixins: [mixin1, mixin2, mixin3, mixin4],
        methods: {
          onCreate: function() {
            calls.push('widget');
          }
        }
      });


      // Run
      var el = document.createElement('mixin-test2');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(calls).toEqual(['overwrite']);
    });

    it("Should call method if overwrite allows", function() {
      // Setup
      var calls = [];
      var mixin1 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.AFTER,
            value: function() {
              calls.push('after');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin2 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.BEFORE,
            value: function() {
              calls.push('before');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin3 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.DEFAULT,
            value: function() {
              calls.push('middle1');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin4 = {
        methods: {
          onCreate: function() {
            calls.push('middle2');
          }
        }
      };

      layerUI.registerComponent('mixin-conditional-test1', {
        mixins: [mixin1, mixin2, mixin3, mixin4],
        methods: {
          onCreate: function() {
            calls.push('widget');
          }
        }
      });

      // Run
      var el = document.createElement('mixin-conditional-test1');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(calls).toEqual(['before', 'widget', 'middle1', 'middle2', 'after']);

    });

    it("Should not call method if any overwrite returns false", function() {
      // Setup
      var calls = [];
      var mixin1 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.AFTER,
            value: function() {
              calls.push('after');
            },
            conditional: function() {return false;}
          }
        }
      };

      var mixin2 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.BEFORE,
            value: function() {
              calls.push('before');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin3 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.DEFAULT,
            value: function() {
              calls.push('middle1');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin4 = {
        methods: {
          onCreate: function() {
            calls.push('middle2');
          }
        }
      };

      layerUI.registerComponent('mixin-conditional-test2', {
        mixins: [mixin1, mixin2, mixin3, mixin4],
        methods: {
          onCreate: function() {
            calls.push('widget');
          }
        }
      });

      // Run
      var el = document.createElement('mixin-conditional-test2');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(calls).toEqual([]);
    });

    it("Should not call method if a standalone overwrite returns false", function() {
      // Setup
      var calls = [];
      var mixin1 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.AFTER,
            value: function() {
              calls.push('after');
            },
            conditional: function() {return false;}
          }
        }
      };

      var mixin2 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.BEFORE,
            value: function() {
              calls.push('before');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin3 = {
        methods: {
          onCreate: {
            mode: layerUI.registerComponent.MODES.DEFAULT,
            value: function() {
              calls.push('middle1');
            },
            conditional: function() {return true;}
          }
        }
      };

      var mixin4 = {
        methods: {
          onCreate: {
            conditional: function() {return false;}
          }
        }
      };

      layerUI.registerComponent('mixin-conditional-test3', {
        mixins: [mixin1, mixin2, mixin3, mixin4],
        methods: {
          onCreate: function() {
            calls.push('widget');
          }
        }
      });

      // Run
      var el = document.createElement('mixin-conditional-test3');
      testRoot.appendChild(el);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(calls).toEqual([]);
    });

    it("Should make attributes available in onCreate", function() {
      var foundValue;
      layerUI.registerComponent('mixin-conditional-test4', {
        properties: {
          hasValue: {
            type: Number
          }
        },
        methods: {
          onCreate: function() {
            foundValue = this.hasValue;
          }
        }
      });

      // Run
      testRoot.innerHTML = '<mixin-conditional-test4 has-value="66"></mixin-conditional-test4>';
      var el2 = testRoot.firstChild;
      CustomElements.takeRecords();
      expect(foundValue).toEqual(66);
    });

    it("Should cast property setters before properties are resolved", function() {
      var setterCalled = false;
      layerUI.registerComponent('mixin-conditional-test5', {
        properties: {
          hasValue: {
            type: Number,
            set: function() {
              setterCalled = true;
            }
          }
        }
      });

      var el1 = document.createElement('mixin-conditional-test5');
      el1.hasValue = "55";
      expect(el1.hasValue).toEqual(55);
      expect(setterCalled).toBe(false);
      expect(el1.properties._internalState.onAfterCreateCalled).toBe(false);
      expect(el1.properties._internalState.disableSetters).toBe(true);

      layer.Util.defer.flush();
      expect(el1.hasValue).toEqual(55);
      expect(setterCalled).toBe(true);
      expect(el1.properties._internalState.onAfterCreateCalled).toBe(true);
      expect(el1.properties._internalState.disableSetters).toBe(false);
    });

    it("Should call setters in the designated order", function() {
      var calls = [];
      layerUI.registerComponent('mixin-ordering-test1', {
        properties: {
          prop10: {
            order: 10,
            value: 1,
            set: function() {
              calls.push(10);
            }
          },
          prop5: {
            order: 5,
            value: 1,
            set: function() {
              calls.push(5);
            }
          },
          prop15: {
            order: 15,
            value: 1,
            set: function() {
              calls.push(15);
            }
          },
          prop3: {
            order: 3,
            value: 1,
            set: function() {
              calls.push(3);
            }
          },
          prop35: {
            order: 35,
            value: 1,
            set: function() {
              calls.push(35);
            }
          },
          propX: {
            value: 1,
            set: function() {
              calls.push("X");
            }
          },
        }
      });

      var el1 = document.createElement('mixin-ordering-test1');

      layer.Util.defer.flush();
      expect(calls).toEqual([3, 5, 10, 15, 35, "X"]);
    });

    it("Should call setters only once", function() {
      var calls = [];
      layerUI.registerComponent('mixin-ordering-test1', {
        properties: {
          prop10: {
            order: 10,
            value: 1,
            set: function() {
              calls.push(10);
            }
          },
          prop5: {
            order: 5,
            value: 1,
            set: function() {
              calls.push(5);
              this.prop10 = this.prop10 + 1;
            }
          },
          prop15: {
            order: 15,
            value: 1,
            set: function() {
              calls.push(15);
            }
          },
          prop3: {
            order: 3,
            value: 1,
            set: function() {
              calls.push(3);
              this.prop5 = this.prop5 + 1;
            }
          },
          prop35: {
            order: 35,
            value: 1,
            set: function() {
              calls.push(35);
            }
          },
          propX: {
            value: 1,
            set: function() {
              calls.push("X");
            }
          },
        }
      });

      var el1 = document.createElement('mixin-ordering-test1');

      layer.Util.defer.flush();
      expect(calls).toEqual([3, 5, 10, 15, 35, "X"]);
    });
  });

  describe("The onRender() method", function() {
    var called = false;
    beforeAll(function() {
      layerUI.registerComponent('onrender-test1', {
        methods: {
          onRender: function() {
            called = true;
          }
        }
      });
    });
    beforeEach(function() {
      called = false;
    });

    it("Should do nothing if called before onAfterCreate", function() {
      var el = document.createElement('onrender-test1');
      el.onRender();
      expect(called).toBe(false);
    });

    it("Should be called directly from onAfterCreate", function() {
      var el = document.createElement('onrender-test1');
      el.onAfterCreate();
      expect(called).toBe(true);
    });

    it("Should run if called after onAfterCreate", function() {
      var el = document.createElement('onrender-test1');
      el.onAfterCreate();
      called = false;
      el.onRender();
      expect(called).toBe(true);
    });

    it("Should eventually run if called after onAfterCreate", function() {
      var el = document.createElement('onrender-test1');
      el.onRender();
      layer.Util.defer.flush();
      expect(called).toBe(true);
    });
  });

  describe("The onAttach() method", function() {
    it("Should be called after inserting a node", function() {
      var called = false;
      layerUI.registerComponent('oninsert-test1', {
        methods: {
          onAttach: function() {
            called = true;
          }
        }
      });

      var el = document.createElement('oninsert-test1');
      testRoot.appendChild(el);
      jasmine.clock().tick(10);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(called).toBe(true);
    });

    it("Should be called after onAfterCreate even if onAfterCreate is delayed to after insertion", function() {
      var called = false;
      layerUI.registerComponent('oninsert-test2', {
        properties: {
          hasValue: {}
        },
        methods: {
          onAfterCreate: {
            conditional: function() {
              return this.hasValue;
            }
          },
          onAttach: function() {
            called = true;
          }
        }
      });

      var el = document.createElement('oninsert-test2');
      testRoot.appendChild(el);
      jasmine.clock().tick(10);
      CustomElements.takeRecords();
      layer.Util.defer.flush();

      expect(called).toBe(false);
      el.onAfterCreate();
      expect(called).toBe(false);
      el.hasValue = 5;
      el.onAfterCreate();
      expect(called).toBe(true);
    });
  });
});