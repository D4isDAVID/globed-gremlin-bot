import { ApplicationCommandType, MessageFlags } from '@discordjs/core';
import { prisma } from '../../../../env.js';
import { MessageCommand } from '../../../data.js';
import { SUBMISSION_EMOJI } from '../constants.js';

export default {
    data: {
        type: ApplicationCommandType.Message,
        name: 'Remove Gremlin',
        default_member_permissions: '0',
        dm_permission: false,
    },
    async execute({ data: interaction, api }) {
        const messageId = interaction.data.target_id;

        await api.interactions.defer(interaction.id, interaction.token, {
            flags: MessageFlags.Ephemeral,
        });

        const count = await prisma.gremlin.count({
            where: {
                channelId: interaction.channel.id,
                messageId,
            },
        });
        if (count === 0) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: "This gremlin isn't submitted.",
                },
            );
            return;
        }

        await prisma.gremlin.deleteMany({
            where: {
                channelId: interaction.channel.id,
                messageId,
            },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: `${count} gremlins removed.`,
            },
        );

        await api.channels.deleteOwnMessageReaction(
            interaction.channel.id,
            messageId,
            SUBMISSION_EMOJI,
        );
    },
} satisfies MessageCommand;
