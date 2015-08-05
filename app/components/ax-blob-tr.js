import Ember from 'ember';
import filesize from '../utils/filesize';
import stringResources from '../utils/string-resources';
import Notification from '../models/notification';

export default Ember.Component.extend({
    tagName: 'tr',
    classNameBindings: ['selected'],
    selected: Ember.computed.alias('blob.selected'),

    /**
     * Returns the filesize in a format that humans can read
     */
    prettySize: function () {
        var size = this.get('blob.size');
        return filesize(size).human('si');
    }.property('blob.size'),

    isLocked: function () {
        return this.get('blob.leaseState') !== 'available' || this.get('blob.leaseStatus') === 'locked';
    }.property('blob.leaseState', 'blob.leaseStatus'),

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
        },

        selectBlob: function () {
            this.sendAction('selectBlob', this.get('blob'));
        },

        contextMenu: function () {
            this.sendAction('selectBlob', this.get('blob'));
        }
    }
});
