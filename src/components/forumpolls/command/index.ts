import { ApplicationCommandType } from '@discordjs/core';
import { createSubcommandsCommand } from '../../subcommands.js';
import { forumPollsManageSubcommand } from './manage.js';
import { forumPollsManualSubcommand } from './manual.js';

export const forumPollsCommand = createSubcommandsCommand(
    {
        data: {
            type: ApplicationCommandType.ChatInput,
            name: 'forumpolls',
            description: 'Automatic forum polls.',
            default_member_permissions: '0',
            dm_permission: false,
        },
    },
    [forumPollsManageSubcommand, forumPollsManualSubcommand],
);
