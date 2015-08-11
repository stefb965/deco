import Ember from 'ember';
import {moduleForComponent, test} from 'ember-qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';
import Notification from 'azureexplorer/models/notification';

moduleForComponent('ax-notifications', {
  // Specify the other units that are required for this test
  needs: ['service:notifications'],
  unit: true
});

test('it exists', function (assert) {
    var comp = this.subject();
    assert.ok(comp);
});

test('it adds a notification', function (assert) {
    var comp = this.subject();
    assert.ok(comp);
    Ember.run(function () {
        comp.set('notifications.notifications', []);
    });

    var not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: -1});

    comp.get('notifications').addNotification(not);
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
    var comp = this.subject();
    Ember.run(function () {
        comp.set('notifications', []);
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
    var comp = this.subject();
    Ember.run(function () {
        comp.set('notifications.notifications', []);
    });

    var not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: 40});
    var expectedStyle = 'background: linear-gradient(90deg, #c2d9a5 40%, #e7e7e8 0%)';

    assert.expect(2);
    assert.ok(not);
    assert.equal(not.get('progressStyle').toString(), expectedStyle);
});

test('it adds a notification to the notifications array', function (assert) {
    var comp = this.subject();
    Ember.run(function () {
        comp.set('notifications.notifications', []);
    });

    var not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: -1});
    comp.get('notifications').addNotification(not);
    assert.equal(comp.get('notifications.notifications').length, 1);
});

test('it removes a notification from the notifications array', function (assert) {
    var comp = this.subject();
    Ember.run(function () {
        comp.set('notifications.notifications', []);
    });

    var not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: -1});
    comp.get('notifications').addNotification(not);

    Ember.run(function () {
        comp.get('notifications').removeNotification(not);
    });
    assert.equal(comp.get('notifications.notifications').length, 0);
});

test('it removes a notification from the notifications array via action', function (assert) {
    var comp = this.subject(),
        not;

    Ember.run(function () {
        comp.set('notifications.notifications', []);
    });

    Ember.run(function () {
        not = Notification.create({
        type: 'generic',
        text: 'test notification',
        progress: -1});
        comp.get('notifications').addNotification(not);
    });
    Ember.run(function () {
        comp.send('removeNotification', not);
    });

    assert.equal(comp.get('notifications.notifications').length, 0);
});

test('it correctly reports whether any notification is active', function (assert) {
    var comp = this.subject();
    Ember.run(function () {
        comp.set('notifications.notifications', []);
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

    comp.get('notifications').addNotification(not1);
    comp.get('notifications').addNotification(not2);
    assert.equal(comp.get('notifications.isActive'), true);

    Ember.run(function () {
        not2.set('progress', 100);
    });

    assert.equal(comp.get('notifications.isActive'), false);
});