import {moduleFor, test} from 'ember-qunit';
import Ember from 'ember';
import config from  '../../../config/environment';
import startApp from 'azureexplorer/tests/helpers/start-app';

moduleFor('controller:welcome', {
    needs: ['controller:application']
});

// Replace this with your real tests.
test('it exists', function(assert) {
    assert.ok(this.subject());
});