/**
 * fixes malfunctioning console.log and console.warn functions for iPad Chrome
 */
 /* globals log */

window.ipadConsoleFix = {
    init: function() {
        if (window.console.warn !== undefined) {
            window.console.warnold = window.console.warn;
        }
        if (window.console.log !== undefined) {
            window.console.logold = window.console.log;
        }
        window.console.log = function() {
            if (window.log !== undefined) {
                window.log('log: ' + Array.prototype.slice.call(arguments).join(' '));
            }
        };
        window.console.warn = function() {
            if (log !== undefined) {
                window.log('warn: ' + Array.prototype.slice.call(arguments).join(' '));
            }
        };            
    }
};
if (window.isiPad || window.isIOS) {
        setTimeout(function() {
            window.ipadConsoleFix.init();
        }, 2000);
        window.ipadConsoleFix.init();
    
}
