import Ember from 'ember';

/**
 * Ember Welcome Route
 */
export default Ember.Route.extend({
    /**
     * Get all accounts, set them as model
     */
    model: function () {
        return this.store.find('account');
    },

    /**
     * AfterModel: Track PageView
     */
    afterModel: function () {
        appInsights.trackPageView('Welcome');
    },

    /**
     * When we transition to the explorer view, let's do some housekeeping
     * @param  {Ember.Controller}  controller
     * @param  {Boolean} isExiting
     */
    resetController: function (controller, isExiting) {
        if (isExiting) {
            controller.set('loading', false);
            controller.set('addNewUi', false);
            controller.set('editUi', false);
        }
    },

    actions: {
        /**
         * Setup Materialize's dumb <select>
         */
        selectize: function () {
            Ember.run.scheduleOnce('afterRender', this, function () {
                Ember.$('select').material_select();
            });
        },

        /**
         * Setup Materialize's dumb <select>
         */
        didTransition: function () {
            this.controller.send('selectize');
        },

        /**
         * Refresh the current model
         */
        refresh: function () {
            return this.refresh();
        }
    }
});
