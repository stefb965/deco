import Ember from 'ember';

export default Ember.Route.extend({

    actions: {
        refresh: function () {
          return this.refresh();
        }
    }
});
