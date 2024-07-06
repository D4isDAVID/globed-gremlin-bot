import { Component } from '../data.js';
import { createButton } from './command/create-button.js';
import { backButton } from './command/edit/components/back-button.js';
import { deleteButton } from './command/edit/components/delete/button.js';
import { deleteCancelButton } from './command/edit/components/delete/cancel-button.js';
import { deleteConfirmButton } from './command/edit/components/delete/confirm-button.js';
import { editPollButton } from './command/edit/components/edit-poll/button.js';
import { editDurationButton } from './command/edit/components/edit-poll/edit-duration/button.js';
import { editDurationCancelButton } from './command/edit/components/edit-poll/edit-duration/cancel-button.js';
import { editDurationModal } from './command/edit/components/edit-poll/edit-duration/modal.js';
import { editDurationStringSelect } from './command/edit/components/edit-poll/edit-duration/string-select.js';
import { editQuestionButton } from './command/edit/components/edit-poll/edit-question/button.js';
import { editQuestionModal } from './command/edit/components/edit-poll/edit-question/modal.js';
import { multiselectDisableButton } from './command/edit/components/edit-poll/multiselect/disable-button.js';
import { multiselectEnableButton } from './command/edit/components/edit-poll/multiselect/enable-button.js';
import { pinDisableButton } from './command/edit/components/edit-poll/pin/disable-button.js';
import { pinEnableButton } from './command/edit/components/edit-poll/pin/enable-button.js';
import { addAnswerButton } from './command/edit/components/manage-answers/add-answer/button.js';
import { addAnswerModal } from './command/edit/components/manage-answers/add-answer/modal.js';
import { manageAnswersButton } from './command/edit/components/manage-answers/button.js';
import { deleteAnswerButton } from './command/edit/components/manage-answers/delete-answer/button.js';
import { deleteAnswerCancelButton } from './command/edit/components/manage-answers/delete-answer/cancel-button.js';
import { deleteAnswerConfirmButton } from './command/edit/components/manage-answers/delete-answer/confirm-button.js';
import { deleteAnswerStringSelect } from './command/edit/components/manage-answers/delete-answer/string-select.js';
import { editAnswerButton } from './command/edit/components/manage-answers/edit-answer/button.js';
import { editAnswerCancelButton } from './command/edit/components/manage-answers/edit-answer/cancel-button.js';
import { editAnswerModal } from './command/edit/components/manage-answers/edit-answer/modal.js';
import { editAnswerStringSelect } from './command/edit/components/manage-answers/edit-answer/string-select.js';
import { reloadButton } from './command/edit/components/reload-button.js';
import { forumPollsCommand } from './command/index.js';
import { threadCreate } from './events/thread-create.js';

export default {
    gatewayEvents: [threadCreate],
    commands: [forumPollsCommand],
    messageComponents: [
        createButton,
        editPollButton,
        editQuestionButton,
        editDurationButton,
        editDurationStringSelect,
        editDurationCancelButton,
        multiselectEnableButton,
        multiselectDisableButton,
        pinEnableButton,
        pinDisableButton,
        manageAnswersButton,
        addAnswerButton,
        editAnswerButton,
        editAnswerStringSelect,
        editAnswerCancelButton,
        deleteAnswerButton,
        deleteAnswerStringSelect,
        deleteAnswerConfirmButton,
        deleteAnswerCancelButton,
        backButton,
        reloadButton,
        deleteButton,
        deleteConfirmButton,
        deleteCancelButton,
    ],
    modals: [
        editQuestionModal,
        editDurationModal,
        addAnswerModal,
        editAnswerModal,
    ],
} satisfies Component;
