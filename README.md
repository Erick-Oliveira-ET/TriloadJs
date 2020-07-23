# TriloadJs
Bot discord

# Programer Diary
## YoutubeAPI and play command
    When I first intended of doing a play command - a command that plays music just with the name of the music- I thought it would be really hard. And that thought continue after I read the documentation on the discordJS documentation because there was a lot of packages that it was asking to install and when I tried the packages weren't working. However, everything got easier when I saw that youtube formats and encrypts it's videos in the adequate format without those packages.
    The instructions to use youtube on the discordJS documentation uses the ytdl-core-discord package that makes everything a lot easier but there's a problem: this package just accepts the URL of the video to play music. And if you're a discord user you know if you have to search for the music on youtube to get the URL it's easier not play it on dicord. All the convinience of having a discord bot vanish away. So, I start to think of an way to the user give a name of an music to the bot and then it search on youtube an get the first item that appears. Because I had made the mineserver command in the same day, my first thought was to use puppeteer but that idea didn't last long because I remembered that API exists.
    With my experience using google's API to make possible using the google sheets as database in another project, I thought it would be easy. However, the youtube's API documentation was too generic, it just explains what the API returns and it isn't very intuitive. So, I searched on github and found a really nice node package that explained some things about making connections with the API. I connected some pieces and made everything works fine. 
    Unfortunately, the API doesn't give the URL of the video - it was nice to use google API againg anyways. So I had to search a little more until I get back to the ytdl-core-discor package's page and go to Related Projects. I saw these topics before using API but I didn't pay attention - my whole day was basically solving problems on mineserver command and it was late. Apparently, there's a package called node-ytsr that search and return everything the youtube API does but including the URL. 