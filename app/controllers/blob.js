import Ember from 'ember';
import filesize from '../utilities/filesize.js';

export default Ember.ObjectController.extend({
    prettySize: function () {
        var size = this.get('size');
        return filesize(parseInt(size)).human('si');
    }.property('size')
});
