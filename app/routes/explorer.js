import Ember from 'ember';

export default Ember.Route.extend({
    model: function () {
        return Ember.RSVP.hash({
            containers: this.store.find('container'),
            blobs: this.store.find('blob')
        });
    },

    setupController: function (controller, model) {
        var containers = model.containers,
            blobs = model.blobs;

        controller.set('cotnainers', containers);
        controller.set('blobs', blobs);
    }
});
