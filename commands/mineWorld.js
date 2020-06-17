const mineInfoDB = require("./mineInfo.json");

module.exports = {
	name: 'mineInfo',
	description: 'Store and display minecraft coordinates',
	execute(message, args) {
        if (args[0] === "add") {
            var mineInfo = {
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
            

        }
	},
};