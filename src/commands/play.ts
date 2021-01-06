import { Message } from 'discord.js';
import * as SQL from 'sqlite';
import sqlite3 from 'sqlite3';
import { Story } from '../classes/Story';
import { Param } from '../commands';

import * as General from '../general';
import fs from 'fs/promises'

import YAML from 'js-yaml';

async function run(db:SQL.Database<sqlite3.Database, sqlite3.Statement>,message:Message,args:string[]){
  async function get_story(story:string){
    var file;
    try {
      file = JSON.parse(
        String(await fs.readFile(`./stories/${General.escapeRegExp(story.toLowerCase())}.story.json`))
      )
    } catch {
      try {
        file = YAML.load(
          String(await fs.readFile(`./stories/${General.escapeRegExp(story.toLowerCase())}.story.yml`))
        )
      } catch {
        file = YAML.load(
          String(await fs.readFile(`./stories/${General.escapeRegExp(story.toLowerCase())}.story.yaml`))
        )
      }
    }
    return file;
  }
  try {
    let story = new Story(await get_story(args[0]),
      message.author.id
    );

    if(await story.get_settings(db)) throw new Error('You are already playing a story.')
    await story.save_settings(db);
    await story.post_frame(message.client,db);
  } catch(e){
    console.error(e);
    if(e.message.includes('no such file')){
      throw new Error('No such story.');
    }else{
      throw new Error(e.message)
    }
  }
}

const params:Param[] = [
  {
    name: 'story',
    type: 'string',
    description: 'A story you wish to play.',
    required: true
  }
]

const description:string =
`Play a story! Here's a list of all available ones:
tutorial`

export{
  run,
  params,
  description
}