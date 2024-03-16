import { ApplicationCommandType, PermissionFlagsBits } from '@discordjs/core';
import { createSubcommandsCommand } from '../../subcommands.js';
import clear from './clear/index.js';
import editDescription from './edit-description/index.js';
import list from './list/index.js';
import postBonus from './post-bonus.js';
import remove from './remove/index.js';

export default createSubcommandsCommand(
    {
        data: {
            type: ApplicationCommandType.ChatInput,
            name: 'gremlins',
            description: 'Gremlin submissions',
            default_member_permissions: `${PermissionFlagsBits.ManageGuild}`,
            dm_permission: false,
        },
    },
    [editDescription, remove, list, postBonus, clear],
);
