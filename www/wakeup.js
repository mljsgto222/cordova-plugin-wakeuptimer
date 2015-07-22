var exec = require("cordova/exec");

/**
 * This is a global variable called wakeup exposed by cordova
 */
var Wakeup = function(){};

Wakeup.prototype.wakeup = function(success, error, options) {
    exec(success, error, "WakeupPlugin", "wakeup", [options]);
};

Wakeup.prototype.snooze = function(success, error, options) {
    exec(success, error, "WakeupPlugin", "snooze", [options]);
};

Wakeup.prototype.cancel = function(success, error, id){
    exec(success, error, "WakeupPlugin", "cancel", [id])
};

module.exports = new Wakeup();
