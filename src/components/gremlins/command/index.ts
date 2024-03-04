import { ApplicationCommandType } from '@discordjs/core';
import { createSubcommandsCommand } from '../../subcommands.js';
import list from './list/index.js';
import remove from './remove/index.js';

export default createSubcommandsCommand(
    {
        data: {
            type: ApplicationCommandType.ChatInput,
            name: 'gremlins',
            description: 'Gremlin submissions',
            default_member_permissions: '0',
            dm_permission: false,
        },
    },
    [remove, list],
);
