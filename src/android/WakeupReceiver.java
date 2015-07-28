package org.nypr.cordova.wakeupplugin;

import java.text.SimpleDateFormat;
import java.util.Date;

import org.apache.cordova.PluginResult;
import org.json.JSONException;
import org.json.JSONObject;

import android.annotation.SuppressLint;
import android.app.AlarmManager;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.avos.avoscloud.AVOSCloud;

public class WakeupReceiver extends BroadcastReceiver {

	private static final String LOG_TAG = "WakeupReceiver";
	private static final int ID = 10086;
	private Ringtone ringtone;

	@SuppressLint({ "SimpleDateFormat", "NewApi" })
	@Override
	public void onReceive(Context context, Intent intent) {
		SimpleDateFormat sdf=new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Log.d(LOG_TAG, "wakeuptimer expired at " + sdf.format(new Date().getTime()));
	
		try {
			String packageName = context.getPackageName();
			Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(packageName);
			String className = launchIntent.getComponent().getClassName();		    	
			Log.d(LOG_TAG, "launching activity for class " + className);

			@SuppressWarnings("rawtypes")
			Class c = Class.forName(className); 

			Intent i = new Intent(context, c);
			i.putExtra("wakeup", true);
			Bundle extrasBundle = intent.getExtras();
			String extras=null;
			String sound = null;
			String message = "";
			if(extrasBundle!=null) {
				if (extrasBundle.getString("extra") != null) {
					extras = extrasBundle.getString("extra");
					i.putExtra("extra", extras);
				}
				if (extrasBundle.getString("sound") != null) {
					sound = extrasBundle.getString("sound").split("\\.")[0];
				}
				if (extrasBundle.getString("message") != null){
					message = extrasBundle.getString("message");
				}
			}

			i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
			PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, i,  PendingIntent.FLAG_CANCEL_CURRENT);
			NotificationCompat.Builder builder = new NotificationCompat.Builder(context)
					.setSmallIcon(context.getApplicationInfo().icon)
					.setContentTitle(context.getString(context.getApplicationInfo().labelRes))
					.setContentText(message)
					.setTicker(message);

			builder.setDefaults(android.app.Notification.DEFAULT_LIGHTS | android.app.Notification.DEFAULT_VIBRATE);
			builder.setContentIntent(pendingIntent);
			builder.setAutoCancel(true);
			Uri uri = null;
			if(sound != null){
				sound = sound.split("\\.")[0];
				int soundId = AVOSCloud.applicationContext.getResources().getIdentifier(sound, "raw", AVOSCloud.applicationContext.getPackageName());
				if(soundId > 0){
					uri = Uri.parse("android.resource://" + AVOSCloud.applicationContext.getPackageName() + "/" + soundId);
				}else{
					uri = RingtoneManager.getActualDefaultRingtoneUri(AVOSCloud.applicationContext, RingtoneManager.TYPE_NOTIFICATION);
				}
			}else{
				uri = RingtoneManager.getActualDefaultRingtoneUri(AVOSCloud.applicationContext, RingtoneManager.TYPE_NOTIFICATION);
			}
			initSound(uri);
			ringtone.play();
			NotificationManager manager = (NotificationManager) AVOSCloud.applicationContext.getSystemService(Context.NOTIFICATION_SERVICE);
			manager.notify(ID, builder.build());

			if(WakeupPlugin.connectionCallbackContext!=null && !WakeupPlugin.inBackground) {
				JSONObject o=new JSONObject();
				o.put("type", "wakeup");
				if (extras!=null) {
					o.put("extra", extras);
				}
				PluginResult pluginResult = new PluginResult(PluginResult.Status.OK, o);
				pluginResult.setKeepCallback(true);
				WakeupPlugin.connectionCallbackContext.sendPluginResult(pluginResult);
			}
			
			if (extrasBundle!=null && extrasBundle.getString("type")!=null && extrasBundle.getString("type").equals("daylist")) {
				// repeat in one week
				Date next = new Date(new Date().getTime() + (7 * 24 * 60 * 60 * 1000));
				Log.d(LOG_TAG,"resetting alarm at " + sdf.format(next));
	
				Intent reschedule = new Intent(context, WakeupReceiver.class);
				if (extras!=null) {
					reschedule.putExtra("extra", intent.getExtras().get("extra").toString());
				}
				reschedule.putExtra("day", WakeupPlugin.daysOfWeek.get(intent.getExtras().get("day")));
	
				PendingIntent sender = PendingIntent.getBroadcast(context, 19999 + WakeupPlugin.daysOfWeek.get(intent.getExtras().get("day")), intent, PendingIntent.FLAG_UPDATE_CURRENT);
				AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
				if (Build.VERSION.SDK_INT>=19) {
					alarmManager.setExact(AlarmManager.RTC_WAKEUP, next.getTime(), sender);
				} else {
					alarmManager.set(AlarmManager.RTC_WAKEUP, next.getTime(), sender);
				}
			}

		} catch (JSONException e){
			e.printStackTrace();
		} catch (ClassNotFoundException e) {
			e.printStackTrace();
		}
	}

	private void initSound(Uri sound){
		if(ringtone != null && ringtone.isPlaying()){
			ringtone.stop();
		}
		ringtone = RingtoneManager.getRingtone(AVOSCloud.applicationContext, sound);
	}
}
