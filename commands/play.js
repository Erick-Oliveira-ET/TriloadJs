const Discord = require('discord.js');
const { youtube_api } = require('../config/config.json');
const ytdl = require('ytdl-core-discord');
const {google} = require('googleapis');

const yt = google.youtube({
  version: 'v3',
  auth: youtube_api.api_key
});


const client = new Discord.Client();

module.exports = {
    name: 'play',
    aliases: ["play"],
	description: 'Play music',
    args: false,
    usage: '<>',
    execute(message, args) {
        yt.search.list({part: 'id,snippet',q: args[0], maxResults: 1})
            .then((result) => {
                console.log(result.data.items);
                message.channel.send("ok");
            })



















        // // Join the same voice channel of the author of the message
        // if (message.member.voice.channel.name) {
        //     const connection = await message.member.voice.channel.join();
        //     const dispacher = await play(connection, 'https://www.youtube.com/watch?v=4sgXyNdxjHg&list=PL_uO_IGxlxamAFSdRAg9x9V3C30pZ2NcD&index=2&t=0s');
        //     async function play(connection, url) {
        //         return connection.play(await ytdl(url), { type: 'opus' });
        //     }
        //     dispatcher.on(args[0], () => {
        //         console.log('audio.mp3 is now playing!');
        //     });
    
        //     dispatcher.on(args[0], () => {
        //         console.log('audio.mp3 has finished playing!');
        //     });
    
        //     // Always remember to handle errors appropriately!
        //     dispatcher.on('error', console.error);
            
        // }
        
        
    }
};