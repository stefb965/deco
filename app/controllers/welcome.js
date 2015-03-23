import Ember from 'ember';

export default Ember.Controller.extend({
    actions: {
        toggleAddNew: function () {
            this.toggleProperty('addNewUi');
        }
    }
});
