import Ember from "ember";
import {
  moduleFor,
  test
} from 'ember-qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';

moduleFor('controller:notifications');

test('it exists', function (assert) {
    var ctrl = this.subject();
    assert.ok(ctrl);
});

test('it adds a notification', function (assert) {
    var ctrl = this.subject();
    Ember.run(function () {
        ctrl.set('notifications', []);
    });

    var not = ctrl.addNotification('generic', 'test notification', -1);
    assert.ok(not);
});

test('it adds a notification with correct properties', function (assert) {
    var ctrl = this.subject();
    Ember.run(function () {
        ctrl.set('notifications', []);
    });
    var not = ctrl.addNotification('generic', 'test notification', -1);

    assert.expect(4);
    assert.ok(not);
    assert.equal(not.get('type'), 'generic');
    assert.equal(not.get('text'), 'test notification');
    assert.equal(not.get('progress'), -1);
});

test('it correctly reports whether a notification represents a running process', function (assert) {
    var ctrl = this.subject();
    Ember.run(function () {
        ctrl.set('notifications', []);
    });

    var not = ctrl.addNotification('generic', 'test notification', -1);

    assert.expect(3);
    assert.ok(not);
    assert.equal(not.get('isRunning'), true);

    Ember.run(function () {
        not.set('progress', 100);
    });
    
    assert.equal(not.get('isRunning'), false);
});

test('it correctly creates background progress style', function (assert) {
    var ctrl = this.subject();
    Ember.run(function () {
        ctrl.set('notifications', []);
    });

    var not = ctrl.addNotification('generic', 'test notification', 40);
    var expectedStyle = 'background: linear-gradient(90deg, #c2d9a5 40%, #e7e7e8 60%)';

    assert.expect(2);
    assert.ok(not);
    assert.equal(not.get('progressStyle'), expectedStyle);
});

test('it adds a notification to the notifications array', function (assert) {
    var ctrl = this.subject();
    Ember.run(function () {
        ctrl.set('notifications', []);
    });

    var not = ctrl.addNotification('generic', 'test notification', -1);
    assert.equal(ctrl.get('notifications').length, 1);
});

test('it removes a notification from the notifications array', function (assert) {
    var ctrl = this.subject();
    Ember.run(function () {
        ctrl.set('notifications', []);
    });

    var not = ctrl.addNotification('generic', 'test notification', -1);
    Ember.run(function () {
        not.remove();
    });
    assert.equal(ctrl.get('notifications').length, 0);
});

test('it removes a notification from the notifications array via action', function (assert) {
    var ctrl = this.subject(),
        not;

    Ember.run(function () {
        ctrl.set('notifications', []);
    });

    Ember.run(function () {
        not = ctrl.addNotification('generic', 'test notification', -1);
    });
    Ember.run(function () {
        ctrl.send('removeNotification', not);
    });

    assert.equal(ctrl.get('notifications').length, 0);
});

test('it correctly reports whether any notification is active', function (assert) {
    var ctrl = this.subject();
    Ember.run(function () {
        ctrl.set('notifications', []);
    });

    assert.expect(2);

    var not = ctrl.addNotification('generic', 'test notification', -1);
    ctrl.addNotification('generic', 'test notification', 100);
    ctrl.addNotification('generic', 'test notification', 100);
    assert.equal(ctrl.get('isActive'), true);

    Ember.run(function () {
        not.set('progress', 100);
    });

    assert.equal(ctrl.get('isActive'), false);
});