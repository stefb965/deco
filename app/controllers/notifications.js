import Ember from 'ember';
import Uuid from '../utils/uuid';

/**
 * Notification Object, extending Ember.Object.
 * All the Ember benefits, but not using Ember Data.
 * @prop  {string} id                                   - UUID (use utils/uuid)
 * @prop  {string} type                                 - (upload || download || generic)
 * @prop  {string} text                                 - Text on the notification
 * @prop  {int} progress                                - -1: Ongoing, status unknown. 0-100: Progress in %
 * @prop  {string} timestamp                            - When was the notification created?
 * @prop  {Ember.Controller} _notificationsCtrlRef      - Reference to the notifications controller
 *
 *
 * ## Usage Example
 * addNotification('generic', 'Uploading "12323.jpg" to "hjlk:/images"', true);
 */
var NotificationObject = Ember.Object.extend({
    id: null,
    type: null,
    text: null,
    progress: null,
    timestamp: null,
    _notificationsCtrlRef: null,

    isRunning: function () {
        return (this.get('progress') && this.get('progress') < 100);
    }.property('progress'),

    progressStyle: function () {
        let width = 100 - this.get('progress'),
            widthDone = this.get('progress'),
            style = `background: linear-gradient(90deg, #c2d9a5 ${widthDone}%, #e7e7e8 ${width}%)`;

        return (this.get('progress') > -1) ? style.htmlSafe() : '';
    }.property('progress'),

    remove: function () {
        var notificationsCtrl = this.get('_notificationsCtrlRef');

        if (notificationsCtrl) {
            notificationsCtrl.removeNotification(this);
        }

        this.destroy();
    }
});

export default Ember.Controller.extend({
    notifications: [],
    isPulloutVisible: false,

    /**
     * Do we have at least one notification that is representing a
     * currently running process?
     * @return {Boolean} - True if a process is running
     */
    isActive: function () {
        var notifications = this.get('notifications');

        if (notifications && notifications.length > 0) {
            let firstActiveNotification = notifications.find((item) => {
                if (item.get('progress') && item.get('progress') < 100) {
                    return true;
                } else {
                    return false;
                }
            });

            if (firstActiveNotification) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }.property('notifications.@each.progress'),

    /**
     * Add a notification to the notification queue.
     * @param {string} type          - Type of notification
     * @param {string} text          - Text of notification
     * @param {int} progress         - -1: Ongoing, status unknown. 0-100: Progress in %
     * @return {notification}        - A notification object
     */
    addNotification: function (type, text, progress) {
        var notifications = this.get('notifications'),
            uuid = Uuid.makeUUID(),
            notification;

        if (!type || !text || text === '') {
            return false;
        }

        progress = (progress) ? progress : -1;

        notification = NotificationObject.create({
            id: uuid,
            type: type,
            text: text,
            progress: progress,
            timestamp: Date.now(),
            _notificationsCtrlRef: this
        });

        notifications.pushObject(notification);
        return notification;
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
    addPromiseNotification: function (promise, type, text) {
        console.log('Not implemented! ', promise, type, text, name);
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
            if (notification) {
                notification.remove();
            }
        }
    }
});
