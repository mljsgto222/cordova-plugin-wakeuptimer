
module.exports = function(context){
	var path = context.requireCordovaModule('path'),
        fs = context.requireCordovaModule('fs'),
        projectRoot = context.opts.projectRoot,
        ConfigParser = context.requireCordovaModule('cordova-lib').configparser,
        config = new ConfigParser(path.join(projectRoot, 'config.xml')),
        appName = config.name() || 'CordovaApp';

    console.log('setting ios local notification...');

    var targetFile = path.join(projectRoot, 'platforms', 'ios', appName, 'Classes', 'AppDelegate.m');
    var content = fs.readFileSync(targetFile, {encoding: 'utf8'});

    if(content.indexOf('//add wake up notfiication') === -1){
    	content = content.replace('[self.window makeKeyAndVisible];', '[self.window makeKeyAndVisible];\n//add wake up notfiication\nUILocalNotification* notification = [launchOptions objectForKey:UIApplicationLaunchOptionsLocalNotificationKey];\nif(notification){\n[[NSNotificationCenter defaultCenter] postNotificationName:CDVLocalNotification object:notification];\n}\n');
    	fs.writeFileSync(targetFile, content);
    }
};