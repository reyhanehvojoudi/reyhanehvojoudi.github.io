/** Reyhaneh Vojoudi: anonymous enquiries -> private Sheet -> owner email.
 * Deploy as a Web app: Execute as Me; Who has access: Anyone.
 * Run setup() once in the editor while signed into the receiving account.
 * No Gmail inbox access, no visitor login, no third-party credentials.
 */
const RECIPIENT = 'reyhaneh.vojoudi@gmail.com';
const HEADERS = ['Received at','Lead ID','Status','Enquiry type','Name','Email','Phone','City / time zone','Message','Language','Source','Email notification','Last email attempt','Follow-up date','Notes'];
const TOPICS = {general:'General enquiry',teaching:'Online teaching',vellum:'Vellum House',collaboration:'Collaboration / science event'};

function setup() {
  const props=PropertiesService.getScriptProperties();
  let id=props.getProperty('LEAD_SHEET_ID');
  const book=id?SpreadsheetApp.openById(id):SpreadsheetApp.create('Reyhaneh Vojoudi — Website Leads');
  props.setProperty('LEAD_SHEET_ID',book.getId());
  book.setSpreadsheetTimeZone('Asia/Tehran');
  let sheet=book.getSheetByName('Leads');
  if(!sheet){sheet=book.getSheets()[0];sheet.setName('Leads');}
  if(sheet.getLastRow()===0){
    sheet.getRange(1,1,1,HEADERS.length).setValues([HEADERS]).setBackground('#142030').setFontColor('#ead0a6').setFontWeight('bold');
    sheet.setFrozenRows(1);sheet.getRange(1,1,sheet.getMaxRows(),HEADERS.length).createFilter();
    sheet.setColumnWidths(1,HEADERS.length,150);sheet.setColumnWidth(9,380);sheet.setColumnWidth(15,300);
    sheet.getRange('C2:C').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['New','Contacted','Consultation booked','Won','Closed'],true).setAllowInvalid(false).build());
    sheet.getRange('A2:A').setNumberFormat('yyyy-mm-dd hh:mm');sheet.getRange('M2:M').setNumberFormat('yyyy-mm-dd hh:mm');sheet.getRange('N2:N').setNumberFormat('yyyy-mm-dd');
  }
  // Hourly retry protects leads when email has a temporary failure or daily quota is exhausted.
  if(!ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='retryNotifications')){
    ScriptApp.newTrigger('retryNotifications').timeBased().everyHours(1).create();
  }
  MailApp.getRemainingDailyQuota(); // Request sending permission during owner setup.
  console.log('Your private lead tracker: '+book.getUrl());
  return book.getUrl();
}
function doGet() {
  return json_({service:'Reyhaneh Vojoudi enquiry form',ready:!!PropertiesService.getScriptProperties().getProperty('LEAD_SHEET_ID')});
}
function doPost(e) {
  let lock;
  try {
    if(!e || !e.postData || e.postData.contents.length>16000)return json_({ok:false,code:'validation'});
    const raw=JSON.parse(e.postData.contents);
    const lead=validate_(raw);
    if(!lead)return json_({ok:false,code:'validation'});
    lock=LockService.getScriptLock();
    if(!lock.tryLock(15000))return json_({ok:false,code:'busy'});
    const sheet=sheet_();
    // Persistent deduplication allows safe retries after a network timeout.
    const found=sheet.getLastRow()>1?sheet.getRange(2,2,sheet.getLastRow()-1,1).createTextFinder(lead.id).matchEntireCell(true).findNext():null;
    if(found)return json_({ok:true,id:lead.id});
    const cache=CacheService.getScriptCache();
    const key='rate:'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,lead.email.toLowerCase()));
    const count=Number(cache.get(key)||0);
    if(count>=3)return json_({ok:false,code:'rate'});
    // Simple public-form protections; this is not a CAPTCHA or strong bot barrier.
    const props=PropertiesService.getScriptProperties();
    const day=Utilities.formatDate(new Date(),'UTC','yyyy-MM-dd');
    const bucket=JSON.parse(props.getProperty('DAILY_LEADS')||'{}');
    const total=bucket.day===day?Number(bucket.count)||0:0;
    if(total>=300)return json_({ok:false,code:'rate'});
    sheet.appendRow([new Date(),lead.id,'New',TOPICS[lead.topic],safe_(lead.name),safe_(lead.email),safe_(lead.phone),safe_(lead.zone),safe_(lead.message),lead.language,safe_(lead.source),'Pending','','','']);
    SpreadsheetApp.flush();
    const row=sheet.getLastRow();
    cache.put(key,String(count+1),900);
    props.setProperty('DAILY_LEADS',JSON.stringify({day,count:total+1}));
    try { notify_(sheet,row); } catch(err) { /* Persisted lead remains Pending for hourly retry. */ }
    return json_({ok:true,id:lead.id});
  } catch(err) {
    return json_({ok:false,code:'unavailable'});
  } finally { if(lock && lock.hasLock())lock.releaseLock(); }
}
function validate_(p) {
  if(!p || typeof p!=='object' || p.website)return null;
  const limits={id:80,name:100,email:180,phone:40,zone:100,message:2500,source:500,language:2,topic:30};
  const v={};
  for(const k in limits){if(typeof p[k]!=='string'||p[k].length>limits[k])return null;v[k]=p[k].trim();}
  if(!/^[A-Za-z0-9-]{12,80}$/.test(v.id)||!v.name||!v.message||!Object.prototype.hasOwnProperty.call(TOPICS,v.topic))return null;
  if(!/^[^\s@<>;,]+@[^\s@<>;,]+\.[^\s@<>;,]+$/.test(v.email)||/[\r\n]/.test(v.name))return null;
  if(!/^\+?[\d\s().-]{7,40}$/.test(v.phone)||v.phone.replace(/\D/g,'').length<7)return null;
  if(!['en','fa'].includes(v.language))return null;
  if(!/^https:\/\/(reyhanehvojoudi\.ir|www\.reyhanehvojoudi\.ir|reyhanehvojoudi\.github\.io)(\/|$)/i.test(v.source))return null;
  return v;
}
function safe_(text) { return /^[\s]*[=+\-@]/.test(text)?"'"+text:text; }
function sheet_() {
  const id=PropertiesService.getScriptProperties().getProperty('LEAD_SHEET_ID');
  if(!id)throw new Error('Run setup first');
  return SpreadsheetApp.openById(id).getSheetByName('Leads');
}
function notify_(sheet,row) {
  if(MailApp.getRemainingDailyQuota()<1)return;
  const v=sheet.getRange(row,1,1,HEADERS.length).getValues()[0];
  if(v[11]==='Sent')return;
  sheet.getRange(row,13).setValue(new Date());
  const message=['New website enquiry', '', ...HEADERS.slice(0,11).map((label,i)=>label+': '+v[i]),'', 'Manage this lead: '+sheet.getParent().getUrl()].join('\n');
  MailApp.sendEmail({to:RECIPIENT,replyTo:String(v[5]).replace(/^'/,''),subject:'Website enquiry — '+v[3],body:message,name:'Reyhaneh website enquiries'});
  sheet.getRange(row,12).setValue('Sent');
}
function retryNotifications() {
  const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
  try {
    const sheet=sheet_();if(sheet.getLastRow()<2)return;
    const values=sheet.getRange(2,12,sheet.getLastRow()-1,1).getValues();
    let attempts=0;
    for(let i=0;i<values.length && attempts<30;i++){
      if(values[i][0]==='Pending'){
        if(MailApp.getRemainingDailyQuota()<1)break;
        attempts++;try{notify_(sheet,i+2);}catch(err){break;}
      }
    }
  } finally {lock.releaseLock();}
}
function json_(data) {return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);}
