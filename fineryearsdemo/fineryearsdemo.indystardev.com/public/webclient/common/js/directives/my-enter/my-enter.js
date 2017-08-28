/* global angular */
/**
 * @brief my-enter directive for listening on an input for the enter keypress and assigning an event handler
 * @note  http://stackoverflow.com/questions/17470790/how-to-use-a-keypress-event-in-angularjs
 */
'use strict';
angular.module('myEnter', [])
  .directive('myEnter', function () {
      return function (scope, element, attrs) {
          element.bind("keydown keypress", function (event) {
              if(event.which === 13) {
                  scope.$apply(function (){
                      scope.$eval(attrs.myEnter);
                  });
                  event.preventDefault();
              }
          });
      };
  })
;