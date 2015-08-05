import Ember from 'ember';
import filesize from '../utils/filesize';

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
        selectBlob: function () {
            this.sendAction('selectBlob', this.get('blob'));
        },

        contextMenu: function () {
            this.sendAction('selectBlob', this.get('blob'));
        }
    }
});
