import { ApplicationCommandType } from '@discordjs/core';
import { createSubcommandsCommand } from '../../subcommands.js';
import dailyChannel from './daily-channel.js';
import dailyDay from './daily-day.js';
import dailyHour from './daily-hour.js';
import dailyMinute from './daily-minute.js';
import dailyTime from './daily-time.js';
import monthlyResetKeep from './monthly-reset-keep.js';
import monthlyReset from './monthly-reset.js';
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
    [
        dailyDay,
        dailyChannel,
        dailyHour,
        dailyMinute,
        dailyTime,
        submissionsChannel,
        view,
        monthlyReset,
        monthlyResetKeep,
    ],
);
