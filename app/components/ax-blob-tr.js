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
        return filesize(this.get('blob.size')).human('si');
    }.property('blob', 'blob.size'),

    isLocked: function () {
        return this.get('blob.leaseState') !== 'available' || this.get('blob.leaseStatus') === 'locked';
    }.property('blob', 'blob.leaseState', 'blob.leaseStatus'),

    contextMenu: function () {
        this.sendAction('selectBlob', this.get('blob'));
    },

    actions: {
        selectBlob: function () {
            this.sendAction('selectBlob', this.get('blob'));
        }
    }
});
