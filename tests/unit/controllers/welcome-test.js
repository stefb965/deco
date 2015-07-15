import {
  moduleFor,
  test
} from 'ember-qunit';
import Ember from "ember";
//todo pass 'development' into this module
import config from  '../../../config/environment';

import startApp from 'azureexplorer/tests/helpers/start-app';

var App, store, ns;

function combinedStart(assert) {
    App = startApp(null, assert, false);
    store = App.__container__.lookup('store:main');
    Ember.run(function () {
        var newAccount = store.createRecord('account', {
            name: 'Testaccount',
            key: '5555-5555-5555-5555',
            active: true
        });
    });
}


moduleFor('controller:welcome', {
  // Specify the other units that are required for this test.
  needs: ['controller:application']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});