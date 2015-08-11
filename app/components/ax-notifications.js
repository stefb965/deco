import Ember from 'ember';

export default Ember.Component.extend({
	notifications: Ember.inject.service('notifications'),

	// Actions
    // ------------------------------------------------------------------------------
    actions: {
        /**
         * Toggles the 'isPulloutVisible' property, pulling out the
         * notifications list in the UI (if there is one);
         */
        togglePullout: function () {

            // This hack is required since Chrome isn't smart enough
            // to trigger our animations right away. We're just
            // redrawing those elements.
            Ember.$('div.pullout').hide().show(0);

            this.get('notifications').toggleProperty('isPulloutVisible');
        },

        removeNotification: function (notification) {
            if (!notification.get('isRunning')) {
                this.get('notifications').removeNotification(notification);
            }
        }
    }
});
