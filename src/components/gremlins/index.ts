import { Component } from '../data.js';
import add from './command/add/context.js';
import editNewGremlinDescription from './command/add/edit-new-gremlin-description/index.js';
import editNewGremlinDescriptionModal from './command/add/edit-new-gremlin-description/modal.js';
import clearButton from './command/clear/button.js';
import editDescription from './command/edit-description/context.js';
import editDescriptionModal from './command/edit-description/modal.js';
import command from './command/index.js';
import listPageButton from './command/list/page-button.js';
import remove from './command/remove/context.js';
import configCommand from './config/command.js';
import configViewButton from './config/view/button.js';
import guildCreate from './cron/guild-create.js';
import guildDelete from './cron/guild-delete.js';
import ready from './cron/ready.js';

export default {
    gatewayEvents: [guildCreate, guildDelete, ready],
    commands: [configCommand, command, add, remove, editDescription],
    messageComponents: [
        configViewButton,
        editNewGremlinDescription,
        listPageButton,
        clearButton,
    ],
    modals: [editNewGremlinDescriptionModal, editDescriptionModal],
} satisfies Component;
