const fs = require("fs");

module.exports = {
    name: 'mineworld',
    aliases: ["mineInfo"],
	description: 'Store and display minecraft coordinates',
    args: true,
    usage: '<add> <name> <x> <y> <z> or <get> <name>',
    execute(message, args) {
        message.channel.send("Entrou na função do mine");
        
        if (args[0] == "add") {
            var mineInfoDB = {
                name: args[1],
                overworld: {
                    x: args[2],
                    y: args[3],
                    z: args[4]
                },
                nether: {
                    x: args[2]/8,
                    y: args[3]/8,
                    z: args[4]/8
                }
            };
            console.log(mineInfoDB);
            
            const jsonString = JSON.stringify(mineInfoDB);
            fs.writeFile('mineInfo.json', jsonString, err => {
                if (err) {
                    console.log('Error writing file', err)
                } else {
                    console.log('Successfully wrote file')
                }
            });
            

        }
	}
};