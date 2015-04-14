import Ember from "ember";
import {
  moduleFor,
  test
} from 'ember-qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';
var App, store;
moduleFor('controller:explorer', {
  // Specify the other units that are required for this test.
    needs: ['controller:application', 'model:blob', 'model:container'],

    teardown: function () {
        Ember.run(App, App.destroy);
        window.localStorage.clear();
        store = null;
    }

});

// Replace this with your real tests.
test('it should give us models', function(assert) {
  assert.expect(2);
  App = startApp(null, assert);
  store = App.__container__.lookup('store:main');
  Ember.run(function(){
      var newAccount = store.createRecord('account', {
          name: 'Testaccount',
          key: '5555-5555-5555-5555',
          active: true
      });
  });

  var controller = this.subject();
  controller.store = store;
  // test the controller calls the azure create container api
  // we should see asseets come from the mock node service
  Ember.run(function(){
      controller.send('createContainer');
  });


});


