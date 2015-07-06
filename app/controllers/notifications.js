import Ember from 'ember';
import Uuid from '../utils/uuid';

/**
 * Notification Object, extending Ember.Object.
 * All the Ember benefits, but not using Ember Data.
 * @prop  {string} id                                   - UUID (use utils/uuid)
 * @prop  {string} type                                 - (upload || download || generic)
 * @prop  {string} text                                 - Text on the notification
 * @prop  {boolean} status                              - Is this an ongoing process?
 * @prop  {string} timestamp                            - When was the notification created?
 * @prop  {Ember.Controller} _notificationsCtrlRef      - Reference to the notifications controller
 */
var NotificationObject = Ember.Object.extend({
    id: null,
    type: null,
    text: null,
    status: null,
    timestamp: null,
    _notificationsCtrlRef: null,

    remove: function () {
        var notificationsCtrl = this.get('_notificationsCtrlRef');

        if (notificationsCtrl) {
            notificationsCtrl.removeNotification(this.get('id'));
        }
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
                if (item.get('status')) {
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
    }.property('notifications.@each'),

    init: function () {
        this.addNotification('generic', 'Uploading "12323.jpg" to "hjlk:/images"', true);
        this.addNotification('generic', 'Uploading "12323.jpg" to "hjlk:/images"', false);
        this.addNotification('generic', 'Uploading "12323.jpg" to "hjlk:/images"', true);
        this.addNotification('generic', 'Uploading "12323.jpg" to "hjlk:/images"', false);
        this.addNotification('generic', 'Uploading "12323.jpg" to "hjlk:/images"', true);
    },

    /**
     * Add a notification to the notification queue.
     * @param {string} type          - Type of notification
     * @param {string} text          - Text of notification
     * @param {boolean} status       - Is it a running process?
     * @return {notification}        - A notification object
     */
    addNotification: function (type, text, status) {
        var notifications = this.get('notifications'),
            uuid = Uuid.makeUUID(),
            notification;

        if (!type || !text || text === '') {
            return false;
        }

        status = (status) ? status : false;

        notification = NotificationObject.create({
            id: uuid,
            type: type,
            text: text,
            status: status,
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
     * Updates a notification in the notification array,
     * returning the new notification.
     * @param {string} type          - Type of batch notification
     * @param {string} text          - Text of batch notification
     * @param {string} uuid          - UUID of the notification to change
     * @return {notification}        - A notification object
     */
    updateNotification: function (uuid, type, text) {
        var notifications = this.get('notifications');

        if (!uuid || uuid === '') {
            return false;
        }

        notifications.forEach(notification => {
            if (notification.id === uuid) {
                if (type) {
                    notification.set('type', type);
                }
                if (text) {
                    notification.set('text', text);
                }
                notification.set('timestamp', Date.now());
            }
        });
    },

    /**
     * Remove a notification from the notifications array.
     * @param {string} uuid          - UUID of the notification to remove
     * @return {boolean}             - True for success, false for failure
     */
    removeNotification: function (uuid) {
        var notifications = this.get('notifications'),
            notification, notificationIndex;

        if (!uuid || uuid === '') {
            return false;
        }

        notification = notifications.find((item, index) => {
            if (item.get('id') === uuid) {
                notificationIndex = index;
                return true;
            } else {
                return false;
            }
        });

        if (notificationIndex) {
            notifications.removeAt(notificationIndex, 1);
            return true;
        } else {
            return false;
        }
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
        }
    }
});
