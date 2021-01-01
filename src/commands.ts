import { Message } from 'discord.js';
import fs from 'fs';
import * as SQL from 'sqlite';
import sqlite3 from 'sqlite3';

const Commands:Command[] = [];

for(let file of fs.readdirSync(__dirname+'//commands')){
  if(!file.endsWith('.js')) continue;
  file = file.substring(0,file.length-3);
  Commands[file] = require('./commands/'+file);
  Commands[file].name = file;
}
console.log('Loaded Commands',Commands);

interface Command {
  name:string,
  run:(db:SQL.Database<sqlite3.Database, sqlite3.Statement>,message:Message,args:string[])=>Promise<any>,
  params:Param[],
  description:string
}

interface Param {
  name:string,
  type:'string'|'number'|'integer'|'url',
  description:string,
  required?:undefined|true|false
}

function get_command_usage(cmd:Command):string {
  var str = cmd.name+' ';
  for(const p of cmd.params){
    str += `${p.required ? '<' : '['}${p.name}:${p.type}${p.required ? '>' : ']'} `;
  }
  return str;
}

export{
  Command,
  Param,
  Commands,
  get_command_usage
}