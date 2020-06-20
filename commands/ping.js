module.exports = {
	name: 'ping',
	description: 'Ping!',
	args: false,
	cooldown: 5,
	execute(message, args) {
		message.channel.send('Pong.');
	},
};