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

        const gremlin = await prisma.gremlin.findFirst({
            where: {
                channelId: interaction.channel.id,
                messageId: messageId,
            },
        });
        if (!gremlin) {
            await api.interactions.editReply(
                interaction.application_id,
                interaction.token,
                {
                    content: "This gremlin isn't submitted.",
                },
            );
            return;
        }

        await prisma.gremlin.delete({
            where: {
                id: gremlin.id,
            },
        });

        await api.interactions.editReply(
            interaction.application_id,
            interaction.token,
            {
                content: 'Gremlin removed.',
            },
        );

        await api.channels.deleteOwnMessageReaction(
            gremlin.channelId,
            gremlin.messageId,
            SUBMISSION_EMOJI,
        );
    },
} satisfies MessageCommand;
