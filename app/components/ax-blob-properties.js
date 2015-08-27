import Ember from 'ember';
import Notification from '../models/notification';
import filesize from '../utils/filesize';
import stringResources from '../utils/string-resources';

export default Ember.Component.extend({

  notifications: Ember.inject.service('notifications'),

    prettySize: function () {
        return filesize(this.get('blob.size')).human('si');
    }.property('blob', 'blob.size'),

    isLocked: function () {
        return this.get('blob.leaseState') !== 'available' || this.get('blob.leaseStatus') === 'locked';
    }.property('blob.leaseState', 'blob.leaseStatus'),

    showProperties: true,

    showUpdateButton: function () {
        return !this.get('isLocked') && this.get('showProperties') && this.get('blob.hasDirtyAttributes');
    }.property('isLocked', 'showProperties', 'blob.hasDirtyAttributes'),

    SASOptions: ['READ', 'WRITE', 'DELETE', 'LIST'],

    SAS: null,

    sasExpiration: 200,

    inputBlobId: Ember.computed.alias('blob.id'),

    actions: {
        /**
         * Save properties for Blob blob
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
         * Clears unsaved attributes on the Blob blob
         */
        discardUnsavedChanges: function () {
            this.get('blob').rollback();
            this.set('SAS', null);
            this.set('showProperties', true);
        },

        actionProperties: function () {
            this.set('showProperties', true);
        },

        actionSAS: function () {
            this.set('showProperties', false);
            Ember.run.scheduleOnce('afterRender', this, () => {
                Ember.$('select').material_select();
            });
        },

        generateSAS: function () {
            this.get('blob').getLink(this.get('sasExpiration'),
                this.get('selectedSASOption'))
            .then(SAS => this.set('SAS', SAS));
        }
    }
});
