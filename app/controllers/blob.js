import Ember from 'ember';
import { filesize as filesize } from 'filesize';

export default Ember.ObjectController.extend({
    prettySize: function () {
        var size = this.get('size');

        return filesize(size);
    }.property('size')
});
