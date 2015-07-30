import Ember from "ember";
import { moduleFor, test } from 'ember-qunit';
import combinedStart from 'azureexplorer/tests/helpers/combined-start';

var globals = {
    App: null,
    store: null
};

moduleFor('controller:application', {
    // Specify the other units that are required for this test.
    needs: ['model:setting'],
    teardown: function () {
        Ember.run(globals.App, globals.App.destroy);
        window.localStorage.clear();
        globals.store = null;
    }
});

// Replace this with your real tests.
test('it exists', function (assert) {
    var ctrl = combinedStart(assert, globals, 1, this.subject());
    assert.ok(ctrl);
});