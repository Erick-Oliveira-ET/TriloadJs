const Discord = require('discord.js');
const { youtube_api } = require('../config/config.json');
const ytdl = require('ytdl-core-discord');
const ytsr = require('ytsr');

const client = new Discord.Client();

module.exports = {
    name: 'song',
    aliases: ["song"],
	description: 'Play music',
    args: true,
    usage: '<>',
    async execute(message, args) {
        let songCommand = args.shift();
        let songName = args.join(" ");
        message.channel.send(songName + " " + songCommand);
        let songURL;
        await ytsr(songName)
            .then(resp => {
                songURL = resp.items[0].link
            })
            .catch(()=>{});

        console.log(songURL);

        // Join the same voice channel of the author of the message
        if (message.member.voice.channel.name) {
            const connection = await message.member.voice.channel.join();
            const dispatcher = connection.play(await ytdl(songURL), {type: 'opus'});
            // async function play(connection, url) {
            //     return connection.play(await ytdl(songURL), { type: 'opus' });
            // }

            dispatcher.on('start', () => {
                console.log('audio.mp3 is now playing!');
            });
                
            dispatcher.on('finish', () => {
                console.log('audio.mp3 has finished playing!');
            });
            
            if (songCommand == 'stop') {
                dispatcher.destroy();
            }
            
    
    
            // Always remember to handle errors appropriately!
            dispatcher.on('error', console.error);
            
        }
        
        
    }
};