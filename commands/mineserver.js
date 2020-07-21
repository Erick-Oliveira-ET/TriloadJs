const { prefix } = require('../config.json');
const puppeteer = require('puppeteer');


module.exports = {
    name: 'mineserver',
    aliases: ["mineServer"],
	description: "Open Tera's Minecraft server",
    args: true,
    usage: '<start>, <close> or <restart>',
    execute(message, args) {
        
        if (['start', 'close', 'restart'].includes(args[0])) {
            //Login the site to give access to the server. Because all three options
            //Have to login, the bot login before confirm the option
            (async () => {
                //Try to open server directly but get hold on login middleware and then log in
                const browser = await puppeteer.launch({headless: false});
                const loginPage = await browser.newPage();
                await loginPage.goto('https://aternos.org/server/');
                await loginPage.screenshot({path: 'example.png'});
                await loginPage.type('#user','TeraGeneral');
                await loginPage.type('#password', '3J8&R@!hZ9b,:-!');
                await loginPage.click('#login');

                let serverRunning;

                
                await Promise.all([ 
                    await loginPage.waitForNavigation(),
                    await loginPage.click('body > div > main > section > div.page-content.page-servers > div.servers.single > div > div.server-body')
                ])

                await loginPage
                    .waitForSelector('#nope > main > section > div.page-content.page-server > div.server-status > div.status.offline > div > span.statuslabel-label-container > span', {visible: true})
                    .then((async () => {            
                        const disconnected = await loginPage.$eval('#nope > main > section > div.page-content.page-server > div.server-status > div.status.offline > div > span.statuslabel-label-container > span', el => el.textContent).catch(()=>{})
                        
                        if(disconnected.includes('Desconectado'))
                            serverRunning = false;
                            console.log("Entrou no if de desconectado " + serverRunning);
                    })).catch(() => {console.log("Esperou por muito tempo e nao achou nada")})
                
                console.log("Trying things " + serverRunning !== false);
                
                if (serverRunning !== false) {
                    await loginPage
                        .waitForSelector('#nope > main > section > div.page-content.page-server > div.server-status > div.status.online > div > span.statuslabel-label-container > span', {visible: true})
                        .then((async () => {            
                            const connected = await loginPage.$eval('#nope > main > section > div.page-content.page-server > div.server-status > div.status.online > div > span.statuslabel-label-container > span', el => el.textContent).catch(()=>{})
                            if(connected.includes('Conectado')){
                                serverRunning = true;
                                console.log("Entrou no if de conectado " + serverRunning);
                            }
                        }))
                    
                }
                
                if (args[0] === 'start') {
                    console.log("Entrou no if de start " + serverRunning)
                    if (!serverRunning) {
                        //Waits for start button appear to click it
                        await Promise.all([ 
                            await loginPage.waitForNavigation(),
                            await loginPage.click('#start')
                        ])
        
                        //Waits for close button on the modal appear to click it
                        loginPage
                            .waitForSelector('#nope > main > div > div > div > main > div > a.btn.btn-red', {visible: true})
                            .then((async () => {
                                await loginPage.click('#nope > main > div > div > div > main > div > a.btn.btn-red'); 
                            }))
                        
                        //After the countdown start, notify the user
                        message.channel.send("O server irá abrir em, no mínimo, 5 minutos.\n"
                        + "É possível acompanhar o tempo restante no status do server no minecraft.");
                        
                        //Waits for confirm button appear to click it
                        loginPage
                            .waitForSelector('#confirm', {visible: true, timeout: 0})
                            .then((async () => { 
                                await loginPage.click('#confirm');
                                message.channel.send("O server está abrindo. Falta pelo menos 2 min.\n" + 
                                "Se ninguém entrar em 3 min após abrir, o server será encerrado!!!");
                            }))
                        
                    } else {
                        message.channel.send("Servidor já está aberto ou entre processos!!!");
                    }
                    
                    
                } else if (args[0] === 'close') {
                    if (serverRunning) {
                        await loginPage.click('#stop');
                        message.channel.send("O servidor está fechando.");
                        serverRunning = false;
                    } else {
                        message.channel.send("Servidor já está fechado ou entre processos!!!");

                    }
        
                
                } else if (args[0] === 'restart') {
                    if (!serverRunning) {
                        message.channel.send("Não há como reiniciar o servidor pois o mesmo está fechado ou entre processos.");
                    } else {
                        await loginPage.click('#restart');
                        message.channel.send("O servidor está reiniciando.")
                    }
                
                }

                await browser.close();
            })();


            
        } else { 
            message.channel.send("Argumento inválido! \n" + 
            `Arguementos válidos são: \n1- ${prefix}mineServer start\n`+
            `2- ${prefix}mineServer close\n` + `3- ${prefix}mineServer restart`);
        }


	}
};