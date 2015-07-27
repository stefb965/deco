import Ember from 'ember';
import filesize from '../utils/filesize';

/**
 * Controller for the list of blobs, used together with the {{each}} helper
 */
export default Ember.Controller.extend({
    /**
     * Returns the filesize in a format that humans can read
     * @return {[type]} [description]
     */
    prettySize: function () {
        var size = this.get('model.size');
        return filesize(size).human('si');
    }.property('model.size'),

    isLocked: function () {
        return this.get('model.leaseState') !== 'available' || this.get('model.leaseStatus') === 'locked';
    }.property('model.leaseState', 'model.leaseStatus')
});
