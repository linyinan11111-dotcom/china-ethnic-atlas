import {chromium} from 'playwright';
const suppliedUrl=process.argv[2];
if(!suppliedUrl?.startsWith('https://'))throw new Error('Pass the deployed HTTPS website URL.');
const url=suppliedUrl.endsWith('/')?suppliedUrl:suppliedUrl+'/';
const browser=await chromium.launch({channel:process.platform==='win32'?'msedge':undefined,headless:true});
try{
 const page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'});
 const errors=[],failed=[];
 page.on('pageerror',error=>errors.push(error.message));
 page.on('response',response=>{if(response.url().startsWith(url)&&response.status()>=400)failed.push({url:response.url(),status:response.status()});});
 const response=await page.goto(url+'#ethnic?ethnic='+encodeURIComponent('白族'),{waitUntil:'networkidle',timeout:60000});
 await page.locator('.map-canvas[data-rendered="true"]').waitFor({timeout:30000});
 const name=await page.locator('.magazine-cover h1').innerText();
 const avatar=await page.locator('.cover-photo img').evaluate(image=>({url:image.src,width:image.naturalWidth}));
 if(name!=='白族'||avatar.width!==100)throw new Error('Public ethnic page or avatar did not load.');
 await page.getByRole('navigation').getByRole('button',{name:'民族介绍',exact:true}).click();
 const top=await page.locator('#section-culture').evaluate(element=>element.getBoundingClientRect().top);
 if(top<0||top>130)throw new Error('Public section navigation failed.');
 await page.setViewportSize({width:390,height:844});
 await page.reload({waitUntil:'networkidle'});
 const width=await page.evaluate(()=>document.documentElement.scrollWidth);
 if(width>390)throw new Error('Public mobile page overflows.');
 if(errors.length||failed.length)throw new Error(JSON.stringify({errors,failed}));
 console.log(JSON.stringify({url,status:response.status(),name,avatar,sectionTop:top,mobileWidth:width,errors,failed},null,2));
}finally{await browser.close();}
