import Ember from 'ember';

export default Ember.Controller.extend({
    needs: 'application',

    activeConnection: Ember.computed.alias('controllers.application.activeConnection')
});
