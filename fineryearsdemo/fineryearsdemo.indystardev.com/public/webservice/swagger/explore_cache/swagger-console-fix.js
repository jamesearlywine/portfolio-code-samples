/**
 * fixes malfunctioning console.log and console.warn functions for iPad Chrome
 */
 /* globals log */

window.swaggerConsoleFix = {
    init: function() {
        if (window.console.warn !== undefined) {
            window.warnold = window.console.warn;
        }
        if (window.console.log !== undefined) {
            window.logold = window.console.log;
        }
        window.console.log = function() {
            // window.logold('log: ' + Array.prototype.slice.call(arguments).join(' '));
        };
        window.console.warn = function() {
            // window.warnold('warn: ' + Array.prototype.slice.call(arguments).join(' '));
        };            
    }
};
window.swaggerConsoleFix.init();
