const { MessageCollector } = require('discord.js')
const momentTimezone = require('moment-timezone')

const scheduledSchema = require('../models/scheduled-schema')

module.exports = {
    requiredPermissions: ['ADMINISTRATOR'],
    expectedArgs: '<Channel tag> <YYYY/MM/DD> <HH:MM> <"AM" or "PM"> <Timezone>',

    // If user enters any other quantity of arugments, the bot will then show the user the correct syntax
    maxArgs: 5,
    minArgs: 5,
    category: 'testing',
    description: 'joe',
    name: 'schedule',

    init: (client) => {
        const checkForPosts = async () => {
            const query = {
              date: {
                $lte: Date.now(),
              },
            }
      
            const results = await scheduledSchema.find(query)
      
            for (const post of results) {
              const { guildId, channelId, content } = post
      
              const guild = await client.guilds.fetch(guildId)
              if (!guild) {
                continue
              }
      
              const channel = guild.channels.cache.get(channelId)
              if (!channel) {
                continue
              }
      
              channel.send(content)
            }
      
            await scheduledSchema.deleteMany(query)
      
            setTimeout(checkForPosts, 1000 * 10)
          }
      
          checkForPosts()
    },

    callback: async ({message, args}) => {
        const {mentions, guild, channel} = message

        const targetChannel = mentions.channels.first();
        if(!targetChannel){
            message.reply('Please add the desired channel you want to send your message in')
            return
        }

        // Remove the channel rag from the args array
        args.shift()

        const [date, time, clockType, timeZone] = args

        if(clockType !== 'AM' && clockType !== 'PM') {
            message.reply(`You must provide ether "AM" or "PM", you provided " ${clockType}"`)
            return
        }

        const validTimeZones = momentTimezone.tz.names()
        if(!validTimeZones.includes(timeZone)) {
            message.reply('Oh no, Unknown timezone! Please use one of the following: <https://gist.github.com/diogocapela/12c6617fc87607d11fd62d2a4f42b02a>')
            return
        }
        
        const targetDate = momentTimezone.tz(
            `${date} ${time} ${clockType}`,
            'YYYY/MM/DD HH:mm A',
            timeZone
        )

        message.reply('Please send the message you would like to schedule!')

        const filter = (newMessage) => {
            return newMessage.author.id === message.author.id;
        }

        const collector = new MessageCollector(channel, filter, {
            max: 1,
            time: 1000 * 60 // 1 minute

        })

        collector.on('end', async (collected) => {
            const collectedMessage = collected.first()

            if(!collectedMessage) {
                message.reply('You did not reply in time.')
                return
            }

            message.reply('Your message has been scheduled.')

            await new scheduledSchema({
                date: targetDate.valueOf(),
                content: collectedMessage.content,
                guildId: guild.id,
                channelId: targetChannel.id,
            }).save()
        })
    },
}