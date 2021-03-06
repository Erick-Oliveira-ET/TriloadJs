const { prefix, mineserver } = require('../config/config.json');
const puppeteer = require('puppeteer');


module.exports = {
    name: 'mineserver',
    aliases: ["mineServer"],
	description: "Open Tera's Minecraft server",
    args: true,
    usage: '<start or open>, <stop or close> or <restart>',
    execute(message, args) {
        
        //Confirm if the arg is valid
        if (['start', 'open', 'stop', 'close', 'restart'].includes(args[0])) {
            //Login the site to give access to the server. Because all three options
            //Have to login, the bot login before confirm the option
            (async () => {
                //Try to open server directly but get hold on login middleware and then log in
                //and notify the user
                message.channel.send("Processo iniciado. Pode demorar alguns instantes.")
                const browser = await puppeteer.launch({headless: false});
                const loginPage = await browser.newPage();
                await loginPage.goto('https://aternos.org/server/');
                await loginPage.screenshot({path: 'example.png'});
                await loginPage.type('#user',mineserver.user);
                await loginPage.type('#password', mineserver.password);
                await loginPage.click('#login');

                let serverRunning;

                //wait for page finish load to click on the div
                await Promise.all([ 
                    await loginPage.waitForNavigation(),
                    await loginPage.click('body > div > main > section > div.page-content.page-servers > div.servers.single > div > div.server-body')
                ])

                //Tries to find the mesage "Desconectado". If succeed serverRunning = false
                //If not just finish the promise without doing anything
                await loginPage
                    .waitForSelector('#nope > main > section > div.page-content.page-server > div.server-status > div.status.offline > div > span.statuslabel-label-container > span', {visible: true, timeout: 5000})
                    .then((async () => {            
                        const disconnected = await loginPage.$eval('#nope > main > section > div.page-content.page-server > div.server-status > div.status.offline > div > span.statuslabel-label-container > span', el => el.textContent).catch(()=>{})
                        
                        if(disconnected.includes('Desconectado'))
                            serverRunning = false;
                    })).catch(() => {})

                //Tries to find the mesage "Conectado". If succeed serverRunning = true
                //If not just finish the promise without doing anything
                if (serverRunning !== false) {
                    await loginPage
                        .waitForSelector('#nope > main > section > div.page-content.page-server > div.server-status > div.status.online > div > span.statuslabel-label-container > span', {visible: true, timeout: 1500})
                        .then((async () => {            
                            const connected = await loginPage.$eval('#nope > main > section > div.page-content.page-server > div.server-status > div.status.online > div > span.statuslabel-label-container > span', el => el.textContent).catch(()=>{})
                            if(connected.includes('Conectado')){
                                serverRunning = true;
                            }
                        })).catch(() => {})
                    
                }
                
                if (args[0] === 'start' || args[0] === 'open') {
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
                            //Wait for button start appear and click on it
                            await loginPage
                                .waitForSelector('#start', {visible: true})
                                .then(async () => {
                                    await loginPage.click('#start');
                                })
                                .catch(() => {message.channel.send("Falha no processo! [1/1]");})
                                
                            //Wait for close modal button appear and click on it
                            await loginPage
                                .waitForSelector('#nope > main > div > div > div > main > div > a.btn.btn-red', {visible: true})
                                .then((async () => {
                                    await loginPage.click('#nope > main > div > div > div > main > div > a.btn.btn-red'); 
                                }))
                                .catch(() => {message.channel.send("Falha no processo! [1/2]");})
                                
                            //After the countdown start, notify the user
                            message.channel.send("O server irá abrir em, no mínimo, 5 minutos.\n"
                            + "É possível acompanhar o tempo restante no status do server no minecraft.");
                            
                            //Waits for confirm button appear to click it. 
                            //"Timeout: 0" set the waitForSelector() to wait indefinitely
                            await loginPage
                                .waitForSelector('#confirm', {visible: true, timeout: 0})
                                .then((async () => { 
                                    await loginPage.click('#confirm');
                                    message.channel.send("O server está abrindo. Falta pelo menos 2 min.\n" + 
                                    "Se ninguém entrar em 3 min após abrir, o server será encerrado!!!");
                                }))
                                .catch(() => {message.channel.send("Falha no processo! [1/3]");})
                            
                            //Close the browser
                            await browser.close();
                        }, 1000);
                        
                    } else {
                        //If serverRunning is different then false, notify the user
                        message.channel.send("Servidor já está aberto ou entre processos!!!");
                        
                        //Close the browser
                        await browser.close();
                    }
                    
                    
                } else if (args[0] === 'close' || args[0] === 'stop') {
                    if (serverRunning === true) {
                        //The need for the "setTimeOut()" is explained on the "if" "start" 
                        setTimeout(async () => {
                            //Search and wait the stop button appear, click on it and notify the user
                            await loginPage
                                .waitForSelector('#stop', {visible: true})
                                .then((async () => { 
                                    await loginPage.click('#stop');
                                    message.channel.send("O servidor está fechando.");
                                    serverRunning = false;
                                
                                }))
                                .catch((e) => {message.channel.send("Falha no processo! [2/1]");})
                            
                            //Close the browser
                            await browser.close();
                        }, 1000);
                        
                    } else {
                        //If serverRunning is false, notify user
                        message.channel.send("Servidor já está fechado ou entre processos!!!");
                        
                        //Close the browser
                        await browser.close();
                    }
        
                
                } else if (args[0] === 'restart') {
                    if (serverRunning === true) {
                        //Search and wait the stop button appear, click on it and notify the user
                        setTimeout(async () => {
                            //Search and wait the restart button appear and click it
                            await loginPage
                                .waitForSelector('#restart', {visible: true})
                                .then((async () => { 
                                    await loginPage.click('#restart');
                                    message.channel.send("O servidor está reiniciando.");
                                }))
                                .catch(() => {message.channel.send("Falha no processo! [3/1]");})
                            
                            //Close the browser
                            await browser.close();

                        }, 1000);
                        
                } else {
                    //If serverRunning is false, notify user
                    message.channel.send("Não há como reiniciar o servidor pois o mesmo está fechado ou entre processos.");
                    
                    //Close the browser
                    await browser.close();
                }
                    
                }

               
            })();


            
        } else {
            //If the arg doesn't match any of the valid words, notify the user which keywords work 
            message.channel.send("Argumento inválido! \n" + 
            `Arguementos válidos são: \n1- ${prefix}mineServer start ou ${prefix}mineServer open\n`+
            `2- ${prefix}mineServer stop or ${prefix}mineServer close\n` + `3- ${prefix}mineServer restart`);
        }


	}
};