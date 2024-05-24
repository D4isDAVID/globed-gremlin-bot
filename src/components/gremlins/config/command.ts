import { ApplicationCommandType, PermissionFlagsBits } from '@discordjs/core';
import { createSubcommandsCommand } from '../../subcommands.js';
import dailyChannel from './daily-channel.js';
import dailyDay from './daily-day.js';
import dailyTimeUnix from './daily-time-unix.js';
import dailyTime from './daily-time.js';
import monthlyGremlinCount from './monthly-gremlin-count.js';
import monthlyResetKeep from './monthly-reset-keep.js';
import monthlyResetTimeUnix from './monthly-reset-time-unix.js';
import monthlyResetTime from './monthly-reset-time.js';
import monthlyReset from './monthly-reset.js';
import monthlyTimeUnix from './monthly-time-unix.js';
import monthlyTime from './monthly-time.js';
import submissionsChannel from './submissions-channel.js';
import view from './view/index.js';

export default createSubcommandsCommand(
    {
        data: {
            type: ApplicationCommandType.ChatInput,
            name: 'gremlins-config',
            description: 'Configurate gremlin submission options',
            default_member_permissions: `${PermissionFlagsBits.ManageGuild}`,
            dm_permission: false,
        },
    },
    [
        dailyDay,
        dailyChannel,
        dailyTime,
        dailyTimeUnix,
        monthlyTime,
        monthlyTimeUnix,
        monthlyGremlinCount,
        submissionsChannel,
        view,
        monthlyReset,
        monthlyResetKeep,
        monthlyResetTime,
        monthlyResetTimeUnix,
    ],
);
