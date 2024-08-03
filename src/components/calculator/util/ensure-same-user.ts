import { API, APIInteraction, MessageFlags } from '@discordjs/core';

export async function ensureSameUser(
    api: API,
    interaction: APIInteraction,
    userId: string,
): Promise<boolean> {
    const user = interaction.user ?? interaction.member!.user;
    if (user.id !== userId) {
        await api.interactions.reply(interaction.id, interaction.token, {
            content: 'You did not open this calculator!',
            flags: MessageFlags.Ephemeral,
        });
        return false;
    }

    return true;
}
