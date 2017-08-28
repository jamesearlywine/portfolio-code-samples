/* global angular */
'use strict';
// http://stackoverflow.com/questions/15266671/angular-ng-repeat-in-reverse
angular.module('filter.reverse', [])
  .filter('reverse', function () {
    return function (items) {
        if (!Array.isArray(items)) { return items; }
        return items.slice().reverse();
    };
});