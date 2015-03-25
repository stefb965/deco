import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return Ember.RSVP.hash({
            containers: this.store.find('container')
        });
    },

    setupController: function (controller, model) {
        var containers = model.containers;

        controller.set('containers', containers);
        
    }
});
