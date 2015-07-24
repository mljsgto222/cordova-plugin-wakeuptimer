
module.exports = function(context){
	var path = context.requireCordovaModule('path'),
        fs = context.requireCordovaModule('fs'),
        projectRoot = context.opts.projectRoot,
        ConfigParser = context.requireCordovaModule('cordova-lib').configparser,
        config = new ConfigParser(path.join(projectRoot, 'config.xml'));

    console.log('removing android wake up...');
    var packageNames = config.android_packageName() || config.packageName();
    var targetFile = path.join(projectRoot, 'platforms', 'android', 'src', packageNames.replace(/\./g, path.sep), 'MainActivity.java');

    var content = fs.readFileSync(targetFile, {encoding: 'utf8'});
    if(content.indexOf('org.nypr.cordova.wakeupplugin.WakeupPlugin') >= 0){
    	content = content.replace('import org.nypr.cordova.wakeupplugin.WakeupPlugin;', '')
    	.replace('if(intent.hasExtra("extra")){ WakeupPlugin.extra = intent.getStringExtra("extra"); }\n', '')
    	.replace('WakeupPlugin.inBackground = false;\n', '')
    	.replace('WakeupPlugin.inBackground = true;\n', '');

    	fs.writeFileSync(targetFile, content);
    }
};