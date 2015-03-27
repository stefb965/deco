import Ember from 'ember';
export default Ember.Controller.extend({
    needs: 'application',
<<<<<<< HEAD
=======

>>>>>>> master
    activeConnection: Ember.computed.alias('controllers.application.activeConnection')
});
