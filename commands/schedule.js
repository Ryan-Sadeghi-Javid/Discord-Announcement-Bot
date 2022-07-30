const { MessageCollector } = require('discord.js')
const momentTimezone = require('moment-timezone')
const { off } = require('npm')

module.exports = {
    requiredPermissions: ['ADMINSTRATOR'],
    expectedArgs: '<Channel tag> <YYYY/MM/DD> <HH:MM> <"AM" or "PM"> <Timezone>',

    // If user enters any other quantity of arugments, the bot will then show the user the correct syntax
    maxArgs: 5,
    minArgs: 5,

    init: () => {},
    callback: async ({message, args}) {
        const {mentions, guild, channel} = message

        const targetChannel = mentions.channels.first()
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
            return newMessage.author.id == message.author.id;
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

            // TODO: Save to the database
        })


    }
}