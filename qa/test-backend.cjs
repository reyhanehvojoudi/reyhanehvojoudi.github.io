const fs=require('fs'),vm=require('vm'),assert=require('assert');
let rows=[Array(15).fill('Header')],emails=[],failEmail=false;
const props=new Map([['LEAD_SHEET_ID','test']]),cache=new Map();
const sheet={
 getLastRow:()=>rows.length,
 appendRow:r=>rows.push(r),
 getParent:()=>({getUrl:()=> 'https://docs.google.com/spreadsheets/d/test'}),
 getRange:(row,col,n=1,width=1)=>({
  getValues:()=>rows.slice(row-1,row-1+n).map(r=>r.slice(col-1,col-1+width)),
  setValue:v=>{rows[row-1][col-1]=v;},
  createTextFinder:value=>({matchEntireCell:()=>({findNext:()=>{const i=rows.findIndex((r,j)=>j>0&&r[1]===value);return i<0?null:{getRow:()=>i+1};}})})
 })
};
const context={console,Date,JSON,
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>props.get(k),setProperty:(k,v)=>props.set(k,v)})},
 SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet}),flush:()=>{}},
 LockService:{getScriptLock:()=>({tryLock:()=>true,hasLock:()=>true,releaseLock:()=>{}})},
 CacheService:{getScriptCache:()=>({get:k=>cache.get(k),put:(k,v)=>cache.set(k,v)})},
 Utilities:{base64EncodeWebSafe:v=>v,computeDigest:(_,v)=>v,DigestAlgorithm:{SHA_256:'sha'},formatDate:()=> '2026-10-10'},
 MailApp:{getRemainingDailyQuota:()=>100,sendEmail:m=>{if(failEmail)throw Error('mail failure');emails.push(m);}},
 ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})}
};
vm.createContext(context);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../google-setup/Code.gs'),'utf8'),context);
const lead={id:'12345678-1234-1234-1234-123456789012',name:'Test Visitor',email:'test@example.com',phone:'+98 912 345 6789',zone:'Tehran',topic:'teaching',message:'Physics class enquiry',source:'https://reyhanehvojoudi.ir/#teaching',language:'en',website:''};
const post=v=>context.doPost({postData:{contents:JSON.stringify(v)}});
assert.equal(post(lead).ok,true);assert.equal(rows.length,2);assert.equal(emails.length,1);assert.equal(rows[1][11],'Sent');
assert.equal(post(lead).ok,true);assert.equal(rows.length,2);assert.equal(emails.length,1);
for(const change of [{email:'bad'},{phone:'hi'},{message:''},{website:'spam'},{topic:'__proto__'},{source:'https://evil.example'},{name:'A\nB'}])assert.equal(post({...lead,...change}).ok,false);
failEmail=true;assert.equal(post({...lead,id:'22345678-1234-1234-1234-123456789012',name:'=HYPERLINK("bad")'}).ok,true);
assert.equal(rows[2][11],'Pending');assert.equal(rows[2][4][0],"'");
failEmail=false;context.retryNotifications();assert.equal(rows[2][11],'Sent');assert.equal(emails.length,2);
post({...lead,id:'32345678-1234-1234-1234-123456789012'});
assert.equal(post({...lead,id:'42345678-1234-1234-1234-123456789012'}).code,'rate');
assert.equal(context.doGet().ready,true);
console.log('PASS: valid lead, email, sheet, duplicate retry, invalid data, honeypot, formula protection, email failure/retry, rate limit. No real email was sent.');
