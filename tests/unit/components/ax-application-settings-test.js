import {
  moduleForComponent,
  test
} from 'ember-qunit';

import Ember from "ember";
import combinedStart from 'azureexplorer/tests/helpers/combined-start';

var globals = {
    App: null,
    store: null
};

moduleForComponent('ax-application-settings', {
    needs: ['util:filesize', 'model:serviceSettings', 'service:nodeServices', 'service:application', 'service:notifications'],
    teardown: function () {
        Ember.run(globals.App, globals.App.destroy);
        window.localStorage.clear();
        globals.store = null;
    },
    unit: true
});

function testMetrics(type, assert) {
  combinedStart(assert, globals);
  assert.expect(9);
  Ember.run(() => {
      let cmpt = this.subject();

      globals.store.find('serviceSettings', 'settings')
      .then(settings => {
          cmpt.set('application.serviceSettings', settings);
          cmpt.set('application.serviceSettings.' + type + '.Enabled', true);
          cmpt.set('application.serviceSettings.' + type + '.IncludeAPIs', true);
          cmpt.set('application.serviceSettings.' + type + '.RetentionPolicy.Days', 14);
          cmpt.set('application.serviceSettings.' + type + '.RetentionPolicy.Enabled', true);
          assert.equal(cmpt.get('settings.hasDirtyAttributes'), true);
          cmpt.set('notifications.addPromiseNotification', function (promise) {
            promise.then(() => {
              assert.equal(cmpt.get('settings.hasDirtyAttributes'), false);
              assert.equal(cmpt.get('settings.' + type + '.Enabled'), true);
              assert.equal(cmpt.get('application.serviceSettings.' + type + '.RetentionPolicy.Days'), 14);
              assert.equal(cmpt.get('application.serviceSettings.' + type + '.RetentionPolicy.Enabled'), true);
              assert.equal(cmpt.get('application.serviceSettings.' + type + '.IncludeAPIs'), true);
            });
          });
          cmpt.send('updateServiceSettings');
      });

  });
}

test('it updates hour metrics w/ notificaiton', function (assert) {
  testMetrics.call(this, 'HourMetrics', assert);
});

test('it updates minute metrics w/ notification', function (assert) {
  testMetrics.call(this, 'MinuteMetrics', assert);
});

test('it updates logging metrics w/ notification', function (assert) {
    combinedStart(assert, globals);
    assert.expect(11);
    Ember.run(() => {
        let cmpt = this.subject();

        globals.store.find('serviceSettings', 'settings')
        .then(settings => {
            cmpt.set('application.serviceSettings', settings);
            cmpt.set('application.serviceSettings.Logging.Enabled', true);
            cmpt.set('application.serviceSettings.Logging.RetentionPolicy.Days', 14);
            cmpt.set('application.serviceSettings.Logging.RetentionPolicy.Enabled', true);
            cmpt.set('application.serviceSettings.Logging.Delete', true);
            cmpt.set('application.serviceSettings.Logging.Read', true);
            cmpt.set('application.serviceSettings.Logging.Write', true);
            assert.equal(cmpt.get('settings.hasDirtyAttributes'), true);
            cmpt.set('notifications.addPromiseNotification', function (promise) {
              Ember.Logger.debug('called!!!');
              promise.then(() => {
                assert.equal(cmpt.get('settings.hasDirtyAttributes'), false);
                assert.equal(cmpt.get('application.serviceSettings.Logging.Enabled'), true);
                assert.equal(cmpt.get('application.serviceSettings.Logging.RetentionPolicy.Days'), 14);
                assert.equal(cmpt.get('application.serviceSettings.Logging.RetentionPolicy.Enabled'), true);
                assert.equal(cmpt.get('application.serviceSettings.Logging.Delete'), true);
                assert.equal(cmpt.get('application.serviceSettings.Logging.Read'), true);
                assert.equal(cmpt.get('application.serviceSettings.Logging.Write'), true);
              });
            });
            cmpt.send('updateServiceSettings');
        });

    });
});

