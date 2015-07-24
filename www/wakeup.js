var exec = require("cordova/exec"),
	channel = require('cordova/channel'),
    cordova = require('cordova');

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
    exec(success, error, "WakeupPlugin", "cancel", [id]);
};

Wakeup.prototype.getExtra = function(success){
	var noop = function(){};
	exec(success, noop, "WakeupPlugin", "getExtra", []);
};
var wakeup = new Wakeup();
var getExtra = function(){
	wakeup.getExtra(function(data){
        if(data){
        	var json = JSON.parse(data);
        	if(json){
        		cordova.fireDocumentEvent('appOpenWithURL', json);
        	}
        }
    }, function(error){
        console.log('get extra data error');
    });
};
channel.onResume.subscribe(function(){
    getExtra();
});

channel.onCordovaReady.subscribe(function(){
    getExtra();
});

module.exports = wakeup;
