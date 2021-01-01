import { Message, MessageEmbed } from 'discord.js';
import * as SQL from 'sqlite';
import sqlite3 from 'sqlite3';
import { Command, Commands, Param, get_command_usage } from '../commands';
import fs from 'fs';

import * as General from '../general';

async function run(db:SQL.Database<sqlite3.Database, sqlite3.Statement>,message:Message,args:string[]){
  let Embed = new MessageEmbed()
  .setColor(General.colors.default)

  if(args.length > 0){
    let cmd:Command = Commands[args[0]];
    if(cmd === undefined) throw new Error('No such command. For lists of command type without arguments.');

    Embed
    .setTitle(cmd.name)
    .setDescription(cmd.description)
    .addField(
      'Usage',get_command_usage(cmd)
    );

    var str = '';
    for(const p of cmd.params){
      str += `${p.required ? '<' : '['}${p.name}:${p.type}${p.required ? '>' : ']'} - ${p.description}\n`;
    }
    Embed.addField('Parameters',str);
  }else{
    Embed.setTitle('Commands List');
    var cmdnames:string[] = [];
    for(let file of fs.readdirSync(__dirname)){
      if(!file.endsWith('.js')) continue;
      file = file.substring(0,file.length-3);
      cmdnames.push(file);
    }
    Embed.setDescription(cmdnames.join(', '));
  }
  return Embed;
}

const params:Param[] = [
  {
    name: 'command',
    type: 'string',
    description: 'A command you wish to be helped with',
    required: false
  }
]

const description:string =
`List all commands or find help for a specific command.
<> is **required**
[] is **optional**
Every argument must be entered in the specific, displayed order.
You can skip optional params you don't want to use with *.
In most cases, substitude spaces for underscores (_) as spaces define breaks between parameters.`

export{
  run,
  params,
  description
}