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
                    .waitForSelector('#nope > main > section > div.page-content.page-server > div.server-status > div.status.offline > div > span.statuslabel-label-container > span', {visible: true, timeout: 5000})
                    .then((async () => {            
                        const disconnected = await loginPage.$eval('#nope > main > section > div.page-content.page-server > div.server-status > div.status.offline > div > span.statuslabel-label-container > span', el => el.textContent).catch(()=>{})
                        
                        if(disconnected.includes('Desconectado'))
                            serverRunning = false;
                            console.log("Entrou no if de desconectado " + serverRunning);
                    })).catch(() => {console.log("Esperou por muito tempo em desconectado e nao achou nada")})
                
                if (serverRunning !== false) {
                    await loginPage
                        .waitForSelector('#nope > main > section > div.page-content.page-server > div.server-status > div.status.online > div > span.statuslabel-label-container > span', {visible: true, timeout: 1500})
                        .then((async () => {            
                            const connected = await loginPage.$eval('#nope > main > section > div.page-content.page-server > div.server-status > div.status.online > div > span.statuslabel-label-container > span', el => el.textContent).catch(()=>{})
                            if(connected.includes('Conectado')){
                                serverRunning = true;
                                console.log("Entrou no if de conectado " + serverRunning);
                            }
                        })).catch(() => {console.log("Esperou muito por conectado e não achou nada")})
                    
                }
                
                if (args[0] === 'start') {
                    console.log("Entrou no if de start " + serverRunning)
                    if (serverRunning === false) {
                        /*
                        The function waitForSelector to be visible doesn´t work because when the 
                        button is visible, the bot immediately click it, but it's so fast that the browser
                        didn't finished load and doesn't notice the click. And the waitForURL doens't work
                        because the URL doesn't change exactly (I think we're not send to another page but
                        just the name of the URL change). Puppeteer click() method has a delay between 
                        mousedown and mouseup but I thought it could fail if the page don't register 
                        the pressed dow part
                        To fix this problem, the bot wait for 5 seconds before clicking the start button 
                        */
                        
                        setTimeout(async () => {
                            await loginPage
                                .waitForSelector('#start', {visible: true})
                                .then(async () => {
                                    await loginPage.click('#start');
                                })
                                .catch(() => {console.log("Não clicou no botão de start");})
                                
                            await loginPage
                                .waitForSelector('#nope > main > div > div > div > main > div > a.btn.btn-red', {visible: true})
                                .then((async () => {
                                    await loginPage.click('#nope > main > div > div > div > main > div > a.btn.btn-red'); 
                                }))
                                .catch(() => {console.log("Não fechou o modal");})
                                
                            //After the countdown start, notify the user
                            message.channel.send("O server irá abrir em, no mínimo, 5 minutos.\n"
                            + "É possível acompanhar o tempo restante no status do server no minecraft.");
                            
                            //Waits for confirm button appear to click it. 
                            //Timeout: 0 set the waitForSelector() to wait indefinitely
                            await loginPage
                                .waitForSelector('#confirm', {visible: true, timeout: 0})
                                .then((async () => { 
                                    await loginPage.click('#confirm');
                                    message.channel.send("O server está abrindo. Falta pelo menos 2 min.\n" + 
                                    "Se ninguém entrar em 3 min após abrir, o server será encerrado!!!");
                                }))
                                .catch(() => {console.log("Não confirmou a abertura do server");})
                            
                            await browser.close();
                        }, 1000)
                        
                    } else {
                        message.channel.send("Servidor já está aberto ou entre processos!!!");
                        await browser.close();
                    }
                    
                    
                } else if (args[0] === 'close') {
                    if (serverRunning === true) {
                        setTimeout(async () => {
                            await loginPage
                                .waitForSelector('#stop', {visible: true})
                                .then((async () => { 
                                    await loginPage.click('#stop');
                                    message.channel.send("O servidor está fechando.");
                                    serverRunning = false;
                                
                                }))
                                .catch((e) => {console.log("Não confirmou o fechamento do server\n" + e);})
                            
                            await browser.close();
                        }, 1000);
                        
                    } else {
                        message.channel.send("Servidor já está fechado ou entre processos!!!");
                        await browser.close();
                    }
        
                
                } else if (args[0] === 'restart') {
                    if (serverRunning === true) {
                        setTimeout(async () => {
                            await loginPage
                                .waitForSelector('#restart', {visible: true})
                                .then((async () => { 
                                    await loginPage.click('#restart');
                                    message.channel.send("O servidor está reiniciando.");
                                }))
                                .catch(() => {console.log("Não confirmou o reiniciamento do server");})
                            
                            await browser.close();

                        }, 1000);
                        
                } else {
                    message.channel.send("Não há como reiniciar o servidor pois o mesmo está fechado ou entre processos.");
                    await browser.close();
                }
                    
                }

               
            })();


            
        } else { 
            message.channel.send("Argumento inválido! \n" + 
            `Arguementos válidos são: \n1- ${prefix}mineServer start\n`+
            `2- ${prefix}mineServer close\n` + `3- ${prefix}mineServer restart`);
        }


	}
};