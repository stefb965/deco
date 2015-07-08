import Ember from 'ember';
import Uuid from '../utils/uuid';

export default Ember.Controller.extend({
    notifications: [],
    isPulloutVisible: false,

    // Properties
    // ------------------------------------------------------------------------------
    /**
     * Do we have at least one notification that is representing a
     * currently running process?
     * @return {Boolean} - True if a process is running
     */
    isActive: function () {
        var notifications = this.get('notifications');

        if (notifications && notifications.length > 0) {
            let firstActiveNotification = notifications.find((item) => {
                let pro = item.get('progress');
                return (pro !== undefined && pro !== null && pro >= 0 && pro < 100) ? true : false;
            });

            return (firstActiveNotification) ? true : false;
        } else {
            return false;
        }
    }.property('notifications.@each.progress'),

    // Class Functions
    // ------------------------------------------------------------------------------
    /**
     * Add a notification to the notification queue.
     * @param {Notification} notification          - A notification object
     * @return {null}
     */
    addNotification: function (notification) {
        var notifications = this.get('notifications');

        if (!notification.type || !notification.text) {
            return false;
        }

        this._fillInNotification(notification);
        notifications.pushObject(notification);
        return;
    },

    /**
     * [addBatchNotification description]
     * @param {string} type          - Type of batch notification (for the 1st level notification)
     * @param {string} text          - Text of batch notification (for the 1st level notification)
     * @param {Array} notifications  - Array filled with notification objects
     */
    addBatchNotification: function (type, text, notifications) {
        console.log('Not implemented! ', type, text, notifications);
    },

    /**
     * Takes a promise and automatically turns it into a self-resolving notification.
     * @param {promise} promise      - Promise to use
     * @param {string} type          - Type of batch notification
     * @param {string} text          - Text of batch notification
     */
    addPromiseNotification: function (promise, notification) {
        var notifications = this.get('notifications');

        if (!notification.type || !notification.text) {
            return false;
        }

        this._fillInNotification(notification);
        notifications.pushObject(notification);

        // Todo, it would be nice to display elapsed time to resolution
        promise.then(() => {
            notification.set('progress', 100);
        }).catch (err => {
            notification.set('text', err);
            notification.set('progress', -1);
        }).finally (() => {
            if (notification.cleanup) {
                notification.cleanup();
            }
        });
    },

    /**
     * Remove a notification from the notifications array.
     * @param {object} notification  - Notification to remove
     * @return {boolean}             - True for success, false for failure
     */
    removeNotification: function (notification) {
        var notifications = this.get('notifications');

        if (!notification) {
            return false;
        }

        notifications.removeObject(notification);
    },

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

            this.toggleProperty('isPulloutVisible');
        },

        removeNotification: function (notification) {
            if (!notification.get('isRunning')) {
                this.removeNotification(notification);
            }
        }
    },

    // Helpers
    // ------------------------------------------------------------------------------
    _fillInNotification: function (notification) {
        notification.set('id', notification.get('id') ? notification.get('id') : Uuid.makeUUID());
        notification.set('timestamp', notification.get('timestamp') ? notification.get('timestamp') :  Date.now());
        notification.set('progress', (notification.get('progress') !== undefined || notification.get('progress') !== null) ? notification.get('progress') : 0);
        notification.get('notificationsCtrlRef', notification.notificationsCtrlRef ? notification.notificationsCtrlRef : this);
    }
});
