import { Client, Message, MessageEmbed } from "discord.js";
import { Story } from "./classes/Story";
import { Command, Commands } from "./commands";
import { db_init, db_open } from "./database";

import * as General from './general';

require('dotenv').config();

const Bot = new Client();

Bot.on('ready',async()=>{
  console.log(`Logged in`,Bot.user)
  Bot.user?.setPresence({
    activity: {
      name: 'DMs',
      type: 'LISTENING'
    }
  })

  const db = await db_open(process.env.DATABASE ? process.env.DATABASE : ':memory:');
  await db_init(db);

  Bot.on('message',async(message)=>{
    if(message.channel.type !== 'dm') return;
    if(message.author.id === Bot.user?.id) return;

    let args:Array<any> = [];
    for(const arg of message.content.split(/ +/)){
      if(arg != undefined){
        args.push(arg);
      }
    }
    const cmd = Commands[args.shift()];
    if(cmd){
      console.log(`Running cmd`,cmd)
      try{
        let req = 0;
        for(const p of cmd.params){
          if(p.required) req++;
        }
        if(req > args.length) throw `Not enough arguments. Expected ${req}`;

        await cmd.run(db, message, args)
        .then((result:any)=>{
          message.react(General.emojis.positive).catch(()=>{});
          if(result === undefined || result === null) return;
          message.channel.send( typeof result == 'object' && !(result instanceof MessageEmbed) ? '```json\n'+JSON.stringify(result,null,'\t')+'```' : result ).catch(console.error);
        })
      } catch(reason){
        message.react(General.emojis.negative).catch(()=>{});
        message.channel.send('```\n'+reason+'```');
        console.error(reason);
      }
    }
  });

  Bot.on('messageReactionAdd',async(reaction,user)=>{
    try {
    if(reaction.message.guild || reaction.message.author.id !== Bot.user?.id || reaction.me) return;
    console.log(reaction,user);
    
    let story = new Story(undefined,user.id);
    let got = await story.get_settings(db)

    console.log(got,story)
    if(got === undefined) return;
    if(story.Frames === null) return;

    let opt = General.emojis.options.findIndex((value)=>value == reaction.emoji.name);
    if(opt == -1) return;

    // @ts-expect-error
    if(story.Frames[story.CurrentFrame].options === undefined || story.Frames[story.CurrentFrame].options[opt] === undefined) return;

    const frame = story.Frames[story.CurrentFrame];
    // @ts-expect-error
    if(frame.options[opt].varchanges && story.Variables){
      // @ts-expect-error
      for(const c of frame.options[opt].varchanges){
        switch(c.type){
          default:
            story.Variables[c.var] = c.value;
            break;
          case 'add':
            story.Variables[c.var] += c.value;
            break;
        }
      }
    }

    // @ts-expect-error
    story.CurrentFrame = story.Frames[story.CurrentFrame].options[opt].next;
    await story.save_settings(db);
    story.post_frame(Bot,db);
    } catch(e) {console.error(e)}
  });
})

console.log('Logging in...');
Bot.login(process.env.TOKEN);