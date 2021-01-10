import { Url } from 'url';
import * as General from '../general';
import * as SQL from 'sqlite';
import sqlite3 from 'sqlite3';
import { Client, MessageEmbed, User } from 'discord.js';
import { promisify } from 'util';

class Story {
  Frames:{[key: string]:Frame}|null
  Description: string|null;
  Player: string;
  CurrentFrame: string;
  Variables: General.LooseObject|null;
  User: null|User;
  LastMessage: null|string;
  /**
   * @param object The '.story.json' object. Check for integrity before loading cuz I'm too lazy to code that in.
   * @param player Discord ID of the player.
   */
  constructor(object:General.LooseObject|undefined,player:string){
    if(object !== undefined){
      this.Frames = object.Frames;
      this.Description = object.Description;
      this.Variables = object.Variables;
    }else{
      this.Frames = null;
      this.Description = null;
      this.Variables = null;
    }

    this.Player = player;
    this.CurrentFrame = 'index';
    this.LastMessage = null;
    
    this.User = null;
  }
  async get_settings(db:SQL.Database<sqlite3.Database, sqlite3.Statement>){
    let got = await db.get('SELECT * FROM OngoingStories WHERE Player = ?',[this.Player]);

    try {
      got.Variables = JSON.parse(got.Variables);
      got.Frames = JSON.parse(got.Frames);

      for(const p in got){
        if(this[p] !== undefined) this[p] = got[p];
      }

      return got;
    } catch {
      return undefined;
    }
  }
  async save_settings(db:SQL.Database<sqlite3.Database, sqlite3.Statement>){
    await this.delete_settings(db);
    return db.run('INSERT INTO OngoingStories ("CurrentFrame","Variables","Player","Frames","LastMessage") VALUES(?,?,?,?,?)',[this.CurrentFrame,JSON.stringify(this.Variables),this.Player,JSON.stringify(this.Frames),this.LastMessage])
  }
  async delete_settings(db:SQL.Database<sqlite3.Database, sqlite3.Statement>){
    return db.run('DELETE FROM OngoingStories WHERE Player = ?',[this.Player])
  }
  async post_frame(client:Client,db:SQL.Database<sqlite3.Database, sqlite3.Statement>,frame=this.CurrentFrame){
    if(this.Frames == undefined) return;
    this.User = await client.users.fetch(this.Player,true);
    const Frame = this.Frames[frame];

    var text = Frame.dialog.text;

    if(this.Variables){
      for(const v in this.Variables){
        text = General.replaceAll(text,`{${v}}`,String(this.Variables[v]));
      }
    }

    let Embed = new MessageEmbed()
    .setTitle(Frame.dialog.title)
    .setDescription(text);
    if(Frame.dialog.image) Embed.setThumbnail(Frame.dialog.image);
    if(Frame.dialog.color) Embed.setColor(Frame.dialog.color);

    var react:string[] = [];
    var opts = '';
    const opt = (o) =>{
      if(!Frame.options) return;
      if(Frame.options[o].qualify && this.Variables){
        // @ts-expect-error
        for(const q of Frame.options[o].qualify){
          console.log(q);
          if(typeof q.value == 'number'){
            switch(q.check){
              default:
                if(this.Variables[q.var] !== q.value) return 1;
                break;
              case 'not':
                if(this.Variables[q.var] === q.value) return 1;
                break;
              case 'greater':
                console.log(this.Variables[q.var])
                if(this.Variables[q.var] <= q.value) return 1;
                break;
              case 'lesser':
                if(this.Variables[q.var] >= q.value) return 1;
                break;
            }
          }else{
            switch(q.check){
              default:
                if(q.value !== this.Variables[q.var]) return 1;
                break;
              case 'not':
                if(q.value === this.Variables[q.var]) return 1;
                break;
            }
          }
        }
      }

      return 0;
    }
    for(const o in Frame.options){
      if(opt(o) == 0){
        opts += `${General.emojis.options[o]} ${Frame.options[o].text}\n`;
        react.push(General.emojis.options[o]);
        continue;
      }
      if(Frame.options[o].gray){
        opts += `*${General.emojis.lock} ${Frame.options[o].text}*\n`;
      }
    }

    if(Frame.options !== undefined){
      Embed.addField(
        "Options", opts
      );
    }else{
      Embed.addField(
        "End", "You've reached the end."
      )
      this.delete_settings(db);
    }

    try {
      let s = await this.User.send(Embed);
      for(const e of react){
        await s.react(e).catch(console.error);
      }
      this.LastMessage = s.id;
      this.save_settings(db);
    } catch(e) {
      console.error(e);
    }
  }
  check_integrity(){
    if(this.Frames == null) throw new Error('Integrity Error; Frames are not present.');
    if(this.Variables != null){
      for(const v in this.Variables){
        if(typeof this.Variables[v] !== 'number' && typeof this.Variables[v] !== 'string') throw new Error(`Integrity Error; Unsupported variable type ${typeof this.Variables[v]} (${v})`);
      }
    }
    for(const f in this.Frames){
      const frame = this.Frames[f];
      if(frame.dialog === undefined) throw new Error(`Integrity Error; Frame Dialog ${f}; undefined`);
      if(frame.dialog.title === undefined || frame.dialog.title === null) throw new Error(`Integrity Error; Frame Dialog ${f}; invalid title`);
      if(frame.dialog.text === undefined || frame.dialog.text === null) throw new Error(`Integrity Error; Frame Dialog ${f}; invalid body`);
      if(frame.options !== undefined){
        for(const o in frame.options){
          const opt = frame.options[o];
          if(typeof opt.next !== 'string') throw new Error(`Integrity Error; Frame Dialog ${f} Option ${o}; invalid next type. Should be string`);
          if(opt.gray !== undefined && typeof opt.gray !== 'boolean') throw new Error(`Integrity Error; Frame Dialog ${f} Option ${o}; invalid gray type. Should be undefined or boolean`);
          if(typeof opt.text !== 'string') throw new Error(`Integrity Error; Frame Dialog ${f} Option ${o}; invalid text type. Should be string`);
        }
      }
    }
  }
}

interface Frame {
  dialog:Dialog,
  options?:Option[]
}

interface Dialog {
  title:string,
  text:string,
  image?:string|null,
  color?:string|null
}

interface Option {
  next:string,
  text:string,
  qualify?:Check[],
  varchanges?:Changes[],
  gray?:boolean
}

interface Check {
  var:string,
  value:number|string,
  check:'greater'|'lesser'|'equal'|'not'
}

interface Changes {
  var:string,
  value:number|string,
  type:'set'|'add'
}

export{Story}