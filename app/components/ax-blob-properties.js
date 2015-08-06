import Ember from 'ember';
import Notification from '../models/notification';
import filesize from '../utils/filesize';
import stringResources from '../utils/string-resources';

export default Ember.Component.extend({
    prettySize: function () {
        return filesize(this.get('blob.size')).human('si');
    }.property('blob', 'blob.size'),

    isLocked: function () {
        return this.get('blob.leaseState') !== 'available' || this.get('blob.leaseStatus') === 'locked';
    }.property('blob', 'blob.leaseState', 'blob.leaseStatus'),

    actions: {
        /**
         * Save properties for Blob model
         */
        setProperties: function () {
            if (this.get('isLocked')) {
                return;
            }

            this.get('notifications').addPromiseNotification(this.get('blob').save(),
                Notification.create({
                    type: 'UpdateBlobProperties',
                    text: stringResources.updateBlobPropsMessage(this.get('blob.name'))
                })
            );
        },

        /**
         * Clears unsaved attributes on the Blob model
         */
        discardUnsavedChanges: function () {
            this.get('blob').rollback();
        }
    }
});
