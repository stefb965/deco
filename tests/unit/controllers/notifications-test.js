import Ember from "ember";
import {
  moduleFor,
  test
} from 'ember-qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';
import Notification from 'azureexplorer/models/notification';
moduleFor('controller:notifications');

test('it exists', function (assert) {
    var ctrl = this.subject();
    assert.ok(ctrl);
});

test('it adds a notification', function (assert) {
    var ctrl = this.subject();
    assert.ok(ctrl);
    Ember.run(function () {
        ctrl.set('notifications', []);
    });

    var not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: -1});

    ctrl.addNotification(not);
    assert.ok(not);
    assert.ok(not.get('id'));
    assert.ok(not.get('timestamp'));
    assert.ok(not.get('isErroredOut'));
    assert.ok(!not.get('isActive'));
    assert.equal(not.get('type'), 'generic');
    assert.equal(not.get('text'), 'test notification');
    assert.equal(not.get('progress'), -1);
});

test('it correctly reports whether a notification represents a running process', function (assert) {
    var ctrl = this.subject();
    Ember.run(function () {
        ctrl.set('notifications', []);
    });

    var not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: 0});

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

    var not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: 40});
    var expectedStyle = 'background: linear-gradient(90deg, #c2d9a5 40%, #e7e7e8 0%)';

    assert.expect(2);
    assert.ok(not);
    assert.equal(not.get('progressStyle'), expectedStyle);
});

test('it adds a notification to the notifications array', function (assert) {
    var ctrl = this.subject();
    Ember.run(function () {
        ctrl.set('notifications', []);
    });

    var not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: -1});
    ctrl.addNotification(not);
    assert.equal(ctrl.get('notifications').length, 1);
});

test('it removes a notification from the notifications array', function (assert) {
    var ctrl = this.subject();
    Ember.run(function () {
        ctrl.set('notifications', []);
    });

    var not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: -1});
    ctrl.addNotification(not);

    Ember.run(function () {
        ctrl.removeNotification(not);
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
        not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: -1});
        ctrl.addNotification(not);
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

    var not1 = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: 100}),
        not2 = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: 0});

    ctrl.addNotification(not1);
    ctrl.addNotification(not2);
    assert.equal(ctrl.get('isActive'), true);

    Ember.run(function () {
        not2.set('progress', 100);
    });

    assert.equal(ctrl.get('isActive'), false);
});