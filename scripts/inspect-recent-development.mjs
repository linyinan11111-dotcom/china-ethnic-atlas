import {readFile} from 'node:fs/promises';
for(const id of process.argv.slice(2)){
 const t=(await readFile('data/raw/development/timeline/'+id+'.txt','utf8')).split('中央统战部')[0];
 console.log(id,t.slice(0,8500));
}
