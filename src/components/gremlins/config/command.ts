import { ApplicationCommandType, PermissionFlagsBits } from '@discordjs/core';
import { createSubcommandsCommand } from '../../subcommands.js';
import dailyChannel from './daily-channel.js';
import dailyDay from './daily-day.js';
import dailyTimeUnix from './daily-time-unix.js';
import dailyTime from './daily-time.js';
import monthlyResetKeep from './monthly-reset-keep.js';
import monthlyResetTimeUnix from './monthly-reset-time-unix.js';
import monthlyResetTime from './monthly-reset-time.js';
import monthlyReset from './monthly-reset.js';
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
        submissionsChannel,
        view,
        monthlyReset,
        monthlyResetKeep,
        monthlyResetTime,
        monthlyResetTimeUnix,
    ],
);
