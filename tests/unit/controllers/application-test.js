import Ember from "ember";
import {
  moduleFor,
  test
} from 'ember-qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';
var App, store;

moduleFor('controller:application', {
    // Specify the other units that are required for this test.
    needs: ['model:setting'],
    teardown: function () {
        Ember.run(App, App.destroy);
        window.localStorage.clear();
        store = null;
    }
});

// Replace this with your real tests.
test('it exists', function (assert) {
    App = startApp(null, assert);
    store = App.__container__.lookup('store:main');
    var controller = this.subject();
    controller.store = store;
    assert.ok(controller);
});