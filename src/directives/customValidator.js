module.exports = function() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function(scope, ele, attrs, ctrl) {
      if (
        !scope.component.validate ||
        !scope.component.validate.custom
      ) {
        return;
      }
      ctrl.$validators.custom = function(modelValue, viewValue) {
        var valid = true;
        /*eslint-disable no-unused-vars */
        var input = modelValue || viewValue;
        /*eslint-enable no-unused-vars */
        var custom = scope.component.validate.custom;

        /** Special custom validation - TODO refactor required */
        var vals = [];
        var siblings = [];
        var $ = angular.element;

        if (!scope.$parent.$root.init) {
           scope.$parent.$root.init = {};
        }
        if (custom === 'grid-row-not-blank') {
          ele
            .parents('.formio-data-grid-row')
            .siblings()
            //.find('.form-control[required="required"]')
            .find('.form-control')
            .each(function(a,b) {
              if ($(b).val()) {
                vals.push($(b).val());
              }
              var c = $(b).scope().component;
              if (!scope.$parent.$root.init[c.key]) {
                scope.$parent.$root.init[c.key] = angular.copy(c.validate);
              }
              siblings.push($(b).scope());
          });
          if (!scope.$parent.$root.init[scope.component.key]) {
            scope.$parent.$root.init[scope.component.key] = angular.copy(scope.component.validate);
          }
          if (vals.length || ele.val()) {
              siblings.forEach(function(sibling, i) {
                  var c = siblings[i].component;
                  siblings[i].component.validate.required = scope.$parent.$root.init[c.key].required;
              });
              scope.component.validate.required = scope.$parent.$root.init[scope.component.key].required;
          }
          else {
              siblings.forEach(function(sibling, i) {
                  siblings[i].component.validate.required = false;
              });
              scope.component.validate.required = false;
          }
          return true;
        }
        /** END Special custom validation */

        custom = custom.replace(/({{\s+(.*)\s+}})/, function(match, $1, $2) {
          return scope.data[$2];
        });

        /* jshint evil: true */
        eval(custom);

        if (valid !== true) {
          scope.component.customError = valid;
          return false;
        }

        return true;
      };
    }
  };
};
