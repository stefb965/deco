import Ember from 'ember';
import contextMenu from '../utils/context-menu';

/**
 * Ember Application Route
 */
export default Ember.Route.extend({
    /**
     * Setup the context menu and Materialize's dumb <select>,
     * then transition to the welcome screen
     */
    beforeModel: function () {
        Ember.run.scheduleOnce('afterRender', this, function () {
            Ember.$('select').material_select();
            contextMenu.setup();
        });

        this.transitionTo('welcome');
    },

    actions: {
        /**
         * Open the modal containing "about us" info
         */
        openAboutModal: function () {
            Ember.$('#modal-about').openModal();
        },

        openErrorModal: function () {
            Ember.$('#modal-error').openModal();
        },

        /**
         * Handle various errors during route transitions
         */
        error: function (error, transition) {
            if (error) {
                let welcomeController = this.controllerFor('welcome');

                welcomeController.set('loading', false);
                welcomeController.set('addNewUi', false);
                welcomeController.set('editUi', false);

                if (error.code && error.code === 'ENOTFOUND') {
                    this.controller.set('lastError', 'Connection to ' + error.host + ' failed. Please check your connection and the account name before trying again.');
                } else if (error.code && error.code === 'AuthenticationFailed') {
                    this.controller.set('lastError', 'The connection succeeded, but the Azure rejected the account key. Please check it and try again.');
                } else if (error.message && error.message.indexOf('is not a valid base64 string') > -1) {
                    this.controller.set('lastError', 'The provided account key is invalid. Please check it and try again.');
                }

                console.log(error);

                transition.abort();
                this.transitionTo('welcome');
                this.send('openErrorModal');
                welcomeController.send('selectize');
            }
        }
    }
});
