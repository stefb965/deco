import Ember from 'ember';
import contextMenu from '../utilities/context-menu';

export default Ember.Route.extend({
    beforeModel: function () {
        Ember.run.scheduleOnce('afterRender', this, function() {
            Ember.$('select').material_select();

            contextMenu.setup();
        });

        this.transitionTo('welcome');
    }
});
