import Ember from 'ember';
import filesize from '../utils/filesize';
import stringResources from '../utils/string-resources';
import Notification from '../models/notification';
/**
 * Controller for the list of blobs, used together with the {{each}} helper
 */
export default Ember.Controller.extend({
    needs: ['notifications'],
    /**
     * Returns the filesize in a format that humans can read
     */
    prettySize: function () {
        var size = this.get('model.size');
        return filesize(size).human('si');
    }.property('model.size'),

    notifications: Ember.computed.alias('controllers.notifications'),

    isLocked: function () {
        return this.get('model.leaseState') !== 'available' || this.get('model.leaseStatus') === 'locked';
    }.property('model.leaseState', 'model.leaseStatus'),

    actions: {
        /**
         * Save properties for Blob model
         */
        setProperties: function () {
            if (this.get('isLocked')) {
                return;
            }

            this.get('notifications').addPromiseNotification(this.get('model').save(),
                Notification.create({
                    type: 'UpdateBlobProperties',
                    text: stringResources.updateBlobPropsMessage(this.get('model.name'))
                })
            );
        },

        /**
         * Clears unsaved attributes on the Blob model
         */
        discardUnsavedChanges: function () {
            this.get('model').rollback();
        }
    }
});
