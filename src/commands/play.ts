import { Message } from 'discord.js';
import * as SQL from 'sqlite';
import sqlite3 from 'sqlite3';
import { Story } from '../classes/Story';
import { Param } from '../commands';

import * as General from '../general';
import fs from 'fs/promises'

async function run(db:SQL.Database<sqlite3.Database, sqlite3.Statement>,message:Message,args:string[]){
  let story = new Story(JSON.parse(String(await fs.readFile('./stories/tutorial.story.json'))),message.author.id);
  if(await story.get_settings(db)) throw new Error('You are already playing a story.')
  await story.save_settings(db);
  await story.post_frame(message.client,db);
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
`test`

export{
  run,
  params,
  description
}