module.exports = {
	name: 'server',
	description: 'Description of the server',
	execute(message, args) {
        message.channel.send(`Server name: ${message.guild.name} \nCreated at: ${message.guild.createdAt} in ${message.guild.region} \nTotal members: ${message.guild.memberCount}`);
  
	},
};