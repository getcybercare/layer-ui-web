import layerUI from '../base';

/**
 * Call this function to initialize all of the angular 1.x directives needed to handle the Layer UI for Web widgets.
 *
 * When passing scope values/function into widget properties, prefix the property with `ng-`;
 * for functions, replace `on-` with `ng-`.  If passing in a literal, do NOT prefix with `ng-`:
 *
 * ```
 *    <layer-notifier notify-in-foreground="toast"></layer-notifier>
 *    <layer-conversation-panel ng-query="myscopeProp.query"></layer-conversation-panel>
 *    <layer-conversations-list ng-conversation-selected="myscope.handleSelectionFunc"></layer-conversations-list>
 * ```
 *
 * Call this function to initialize angular 1.x Directives which will be part of the "layerUIControllers" controller:
 *
 * ```
 * layerUI.adapters.angular(angular); // Creates the layerUIControllers controller
 * angular.module('MyApp', ['layerUIControllers']);
 * ```
 *
 *   Now you can put `<layer-conversation-panel>` and other widgets into angular templates and expect them to work.
 *   Prefix ALL property names with `ng-` to insure that scope is evaluated prior to passing the value on to the webcomponent.
 *
 * @class layerUI.adapters.angular
 * @singleton
 * @param {Object} angular     Pass in the AngularJS library
 */

function initAngular(angular) {

  // Define the layerUIController
  const controllers = angular.module('layerUIControllers', []);

  // Setup the properties for the given widget that is being generated
  function setupProps(scope, elem, attrs, props) {

    /*
     * For each property we are going to do the following:
     *
     * 1. See if there is an initial value
     * 2. Evaluate it against the scope via scope.$eval() so we have a resolved value
     * 3. $observe() for any changes in the property
     * 4. $watch() for any changes in the output of scope.$eval()
     *
     * One complicating factor here: while we do support passing in values such as `query` or `query-id`, these
     * values, if placed within an html template, will be passed directly on to a webcomponent BEFORE
     * this code triggers and corrects those values.  This can cause errors.
     *
     * Instead, if one passes `ng-query` or `ng-query-id` in via the html template, there is no `ng-query` property
     * to pass this value on to until the code below triggers.  The code below will map `ng-query` to `query` AFTER
     * its been evaluated.
     *
     * The above steps are applied once for `query-id`, and a second time for `ng-query-id` so that either one works, but `ng-`
     * works better.
     *
     * Best Practice therefore: Use `ng-` prefix on all properties passed via html template files.
     */
    props.forEach((prop) => {
      const ngPropertyName = prop.propertyName.indexOf('on') === 0 ?
        'ng' + prop.propertyName.substring(2) :
        'ng' + prop.propertyName.substring(0, 1).toUpperCase() + prop.propertyName.substring(1);

      // Observe for changes to the attribute value and apply them to the property value
      attrs.$observe(prop.propertyName, (value) => {
        if (elem.properties) {
          elem[prop.propertyName] = value;
        } else {
          if (!elem._tmpdata) elem._tmpdata = {};
          elem._tmpdata[prop.propertyName] = value;
        }
      });

      // Observe for changes to the attribute value prefixed with "ng-" and watch the scoped expression for changes
      // that need to be applied to the property value.
      attrs.$observe(ngPropertyName, (expression) => {
        scope.$watch(expression, (value) => {
          if (elem.properties) {
            elem[prop.propertyName] = value;
          } else {
            if (!elem._tmpdata) elem._tmpdata = {};
            elem._tmpdata[prop.propertyName] = value;
          }
        });
      });
    });
  }

  // Gather all UI Components flagged as Main Components; other components don't require special wrappers that allow properties
  // embedded in Angular's Templates to correctly handle values.
  Object.keys(layerUI.components).filter((componentName) => {
    const component = layerUI.components[componentName];
    return component.properties.filter(prop => prop.propertyName === '_isMainComponent').length;
  })
  .forEach((componentName) => {
    const component = layerUI.components[componentName];

    // Get the camel case controller name
    const controllerName = componentName.replace(/-(.)/g, (str, value) => value.toUpperCase());


    controllers.directive(controllerName, () => {
      return {
        retrict: 'E',
        link: (scope, elem, attrs) => {
          const functionProps = component.properties;
          setupProps(scope, elem[0], attrs, functionProps);
        },
      };
    });
  });
}

module.exports = initAngular;
layerUI.addAdapter('angular', initAngular);
