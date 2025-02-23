const { redis } = require("../../utils/functions/redis");
const { MessageEmbed } = require("discord.js");
const { working, join_logs_channel_id } =
    require("../../configs/features.json").mod_logs;
module.exports = async (client, member) => {
    const { id, guild } = member;
    /* Mute on rejoin */
    const redisClient = await redis();
    try {
        redisClient.get(`muted-${id}-${guild.id}`, (err, result) => {
            if (err) {
                console.log(err);
            } else if (result) {
                const role = guild.roles.cache.find(
                    (role) => role.name === "Muted"
                );
                if (role) {
                    member.roles.add(role);
                }
            }
        });
    } finally {
        redisClient.quit();
    }
    /* Logs */
    if (working && join_logs_channel_id != "channel_id_here") {
        const date = `<t:${(
            new Date(member.joinedTimestamp) / 1000
        ).toFixed()}:R>`;
        const joined = `<t:${(
            new Date(member.user.createdTimestamp) / 1000
        ).toFixed()}:R>`;
        const channel = client.channels.cache.get(join_logs_channel_id);
        const embed = new MessageEmbed()
            .setColor(3092790)
            .setAuthor("Join Logs")
            .setDescription(`${member.user.tag} Joined on ${date}`)
            .setTimestamp()
            .addField("User", `${member.user.tag} - ${member.id}`)
            .addField("Joined on", `${date}`, true)
            .addField("Created on", `${joined}`, true);
        channel.send({ embeds: [embed] });
    }
};
