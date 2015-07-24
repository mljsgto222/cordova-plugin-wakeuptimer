
module.exports = function(context){
	var path = context.requireCordovaModule('path'),
        fs = context.requireCordovaModule('fs'),
        projectRoot = context.opts.projectRoot,
        ConfigParser = context.requireCordovaModule('cordova-lib').configparser,
        config = new ConfigParser(path.join(projectRoot, 'config.xml'));

    console.log('setting android wake up...');
    var packageNames = config.android_packageName() || config.packageName();
    var targetFile = path.join(projectRoot, 'platforms', 'android', 'src', packageNames.replace(/\./g, path.sep), 'MainActivity.java');

    var content = fs.readFileSync(targetFile, {encoding: 'utf8'});
    if(content.indexOf('org.nypr.cordova.wakeupplugin.WakeupPlugin') === -1){
    	content = content.replace('import org.apache.cordova.*', 'import org.apache.cordova.*;\nimport org.nypr.cordova.wakeupplugin.WakeupPlugin');

    	if(content.indexOf('onNewIntent') === -1){
    		content = content.replace('public void onCreate', 'public void onNewIntent(android.content.Intent intent){\nsuper.onNewIntent(intent);\nif(intent.hasExtra("extra")){ WakeupPlugin.extra = intent.getStringExtra("extra"); }\n}\n@Override\npublic void onCreate');
    	}else{
    		content = content.replace('super.onNewIntent(intent);', 'super.onNewIntent(intent);\nif(intent.hasExtra("extra")){ WakeupPlugin.extra = intent.getStringExtra("extra"); }\n');
    	}

    	if(content.indexOf('onResume') === -1){
    		content = content.replace('public void onCreate', 'public void onResume(){\nsuper.onResume();\nWakeupPlugin.inBackground = false;\n}\n@Override\npublic void onCreate');
    	}else{
    		content = content.replace('super.onResume();', 'super.onResume();\nWakeupPlugin.inBackground = false;\n');
    	}

    	if(content.indexOf('onPause') === -1){
    		content = content.replace('public void onCreate', 'public void onPause(){\nsuper.onPause();\nWakeupPlugin.inBackground = true;\n}\n@Override\npublic void onCreate');
    	}else{
    		content = content.replace('super.onPause();', 'super.onPause();\nWakeupPlugin.inBackground = true;\n');
    	}

    	fs.writeFileSync(targetFile, content);
    }
};