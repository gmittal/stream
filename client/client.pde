import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import android.content.IntentFilter;
import android.os.Bundle;
import android.telephony.gsm.SmsMessage;

 String message = ""; 
 String number = ""; 
 SmsReceiver mySMSReceiver = new SmsReceiver();
 void setup(){
  
   size(400,600,P3D);
   orientation(PORTRAIT);

 }
 
 void draw(){

   if(message!=""){ // waiting for new messages
     fill(0,0,0);
     rect(0,0,400,600);
     fill(255,0,0);
     text("New message !",10,40);
      text(message,10,90);
      text("From : "+number,10,130);
      message="";      
   }
 }
 
public class SmsReceiver extends BroadcastReceiver //Class to get SMS
{
    @Override
    public void onReceive(Context context, Intent intent) 
    {
        //---get the SMS message passed in---
        Bundle bundle = intent.getExtras();        
        SmsMessage[] msgs = null;
        String caller="";
        String str="";
                  
        if (bundle != null)
        {
            //---retrieve the SMS message received---
            Object[] pdus = (Object[]) bundle.get("pdus");
            msgs = new SmsMessage[pdus.length];            
            for (int i=0; i<msgs.length; i++){
                msgs[i] = SmsMessage.createFromPdu((byte[])pdus[i]);                
                caller += msgs[i].getOriginatingAddress();
                str += msgs[i].getMessageBody().toString();
            }
                    
        }   
        message=str;
        number=caller;   
        
    }
}



@Override
 public void onCreate(Bundle savedInstanceState) {
 super.onCreate(savedInstanceState);
  IntentFilter filter = new IntentFilter("android.provider.Telephony.SMS_RECEIVED");   
  registerReceiver(mySMSReceiver, filter); // launch class when SMS are RECEIVED
}