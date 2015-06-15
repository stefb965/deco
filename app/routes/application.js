import Ember from 'ember';
import contextMenu from '../utils/context-menu';

export default Ember.Route.extend({
    beforeModel: function () {
        Ember.run.scheduleOnce('afterRender', this, function () {
            Ember.$('select').material_select();
            contextMenu.setup();
        });

        this.transitionTo('welcome');
    },

    actions: {
        openAboutModal: function () {
            Ember.$('#modal-about').openModal();
        }
    }
});
