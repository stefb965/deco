import Ember from 'ember';
export default Ember.View.extend({
    setup: function () {
        $('select').material_select();
    }.on('didInsertElement')
});
