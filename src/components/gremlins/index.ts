import { Component } from '../data.js';
import add from './command/add/context.js';
import editQuoteButton from './command/add/edit-quote/index.js';
import editQuoteModal from './command/add/edit-quote/modal.js';
import command from './command/index.js';
import listPageButton from './command/list/page-button.js';
import remove from './command/remove/context.js';
import configCommand from './config/command.js';
import configViewButton from './config/view/button.js';
import guildCreate from './cron/guild-create.js';
import guildDelete from './cron/guild-delete.js';
import ready from './cron/ready.js';
import editDailyQuote from './edit-daily-quote/index.js';
import editDailyQuoteModal from './edit-daily-quote/modal.js';

export default {
    gatewayEvents: [guildCreate, guildDelete, ready],
    commands: [configCommand, command, add, remove, editDailyQuote],
    messageComponents: [configViewButton, editQuoteButton, listPageButton],
    modals: [editQuoteModal, editDailyQuoteModal],
} satisfies Component;
