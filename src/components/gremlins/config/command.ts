import { ApplicationCommandType } from '@discordjs/core';
import { createSubcommandsCommand } from '../../subcommands.js';
import dailyChannel from './daily-channel.js';
import dailyDay from './daily-day.js';
import dailyGmtHour from './daily-gmt-hour.js';
import submissionsChannel from './submissions-channel.js';
import view from './view/index.js';

export default createSubcommandsCommand(
    {
        data: {
            type: ApplicationCommandType.ChatInput,
            name: 'gremlins-config',
            description: 'Configurate gremlin submission options',
            default_member_permissions: '0',
            dm_permission: false,
        },
    },
    [dailyDay, dailyChannel, dailyGmtHour, submissionsChannel, view],
);
