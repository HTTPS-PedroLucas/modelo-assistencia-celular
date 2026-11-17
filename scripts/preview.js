/** Prévia isolada em memória. Nunca se conecta a um banco real. */
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
if(process.env.NODE_ENV==='production')throw new Error('Preview indisponível em produção. Use npm start.');
process.env.NODE_ENV='test';process.env.JWT_SECRET=crypto.randomBytes(32).toString('hex');
process.env.LOCAL_UPLOADS='true';
const {newDb,DataType}=require('pg-mem');
const memory=newDb({autoCreateForeignKeyIndices:true});
memory.public.registerFunction({name:'jsonb_typeof',args:[DataType.jsonb],returns:DataType.text,implementation:v=>Array.isArray(v)?'array':typeof v});
const pool=new(memory.adapters.createPg().Pool)();
const database=require('../src/lib/db');database.setPoolForTests(pool);
async function prepararApp(){
 const directory=path.join(__dirname,'../migrations');
 for(const file of fs.readdirSync(directory).filter(f=>f.endsWith('.sql')).sort()){
  memory.public.none(fs.readFileSync(path.join(directory,file),'utf8'));
  if(file==='001_initial.sql')memory.public.none('ALTER TABLE leads DROP CONSTRAINT leads_constraint_1');
 }
 const data=structuredClone(require('../src/lib/defaults'));
 for(const name of ['produtos','servicos','campanhas','equipe','depoimentos','clientes'])for(const row of data[name])delete row.id;
 await require('../src/lib/store').importSnapshot(data);
 const senha=process.env.PREVIEW_ADMIN_PASSWORD||crypto.randomBytes(12).toString('base64url');
 await require('../src/lib/auth').criarUsuario('preview@suacell.local',senha,'Prévia Sua Cell');
  return {app:require('../src/server').app,senha};
}
module.exports={prepararApp};
if(require.main===module)prepararApp().then(({app,senha})=>{
 app.listen(Number(process.env.PORT)||3001,'127.0.0.1',()=>{
  console.log('Sua Cell — prévia em http://localhost:'+(process.env.PORT||3001));
  console.log('Dados temporários, descartados ao reiniciar.');
  console.log('Administrador local: preview@suacell.local / '+senha);
 });
}).catch(err=>{console.error(err);process.exitCode=1;});
