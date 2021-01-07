import { Message } from 'discord.js';
import * as SQL from 'sqlite';
import sqlite3 from 'sqlite3';
import { Story } from '../classes/Story';
import { Param } from '../commands';

import * as General from '../general';
import fs from 'fs/promises'

async function run(db:SQL.Database<sqlite3.Database, sqlite3.Statement>,message:Message,args:string[]){
  let story = new Story(undefined,message.author.id);
  await story.get_settings(db);
  await story.post_frame(message.client,db);
}

const params:Param[] = []

const description:string =
`Use if the bot doesn't recognize a reaction. They have a hidden time limit I cannot control, as it's the bot's message cache.`

export{
  run,
  params,
  description
}