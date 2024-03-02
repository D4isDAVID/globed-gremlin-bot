import { Component } from '../data.js';
import addQuoteButton from './command/add/add-quote/index.js';
import addQuoteModal from './command/add/add-quote/modal.js';
import add from './command/add/context.js';
import command from './command/index.js';
import listPageButton from './command/list/page-button.js';
import remove from './command/remove/context.js';
import configCommand from './config/command.js';
import configViewButton from './config/view/button.js';
import guildCreate from './cron/guild-create.js';
import guildDelete from './cron/guild-delete.js';
import ready from './cron/ready.js';
import editQuote from './edit-quote/index.js';
import editQuoteModal from './edit-quote/modal.js';

export default {
    gatewayEvents: [guildCreate, guildDelete, ready],
    commands: [configCommand, command, add, remove, editQuote],
    messageComponents: [configViewButton, addQuoteButton, listPageButton],
    modals: [addQuoteModal, editQuoteModal],
} satisfies Component;
