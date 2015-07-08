import {
  moduleForModel,
  test
} from 'ember-qunit';
import Notification from 'azureexplorer/models/notification';

moduleForModel('notification', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  assert.ok(Notification);
});

test('it correctly calcuates if notification is running', function (assert) {
    var not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: -1});

    assert.ok(not.get('isRunning') === false);
    not.set('progress', 0);
    assert.ok(not.get('isRunning') === true);
    not.set('progress', 100);
    assert.ok(not.get('isRunning') === false);
    not.set('progress', 1000);
    assert.ok(not.get('isRunning') === false);
});

test('it correctly calcuates if notification has errored out', function (assert) {
    var not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: 0});

    assert.ok(not.get('isErroredOut') === false);
    not.set('progress', -1);
    assert.ok(not.get('isErroredOut') === true);
});