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
        }
    }
});
