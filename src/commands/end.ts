import { Message } from 'discord.js';
import * as SQL from 'sqlite';
import sqlite3 from 'sqlite3';
import { Story } from '../classes/Story';
import { Param } from '../commands';

import * as General from '../general';
import fs from 'fs/promises'

async function run(db:SQL.Database<sqlite3.Database, sqlite3.Statement>,message:Message,args:string[]){
  let story = new Story(undefined,message.author.id);
  await story.delete_settings(db);
}

const params:Param[] = [
  /*{
    name: 'story',
    type: 'string',
    description: 'A story you wish to play. Available right now: `tutorial`',
    required: true
  }*/
]

const description:string =
`End your playthrough. Use if you're stuck or wanna restart.`

export{
  run,
  params,
  description
}