import Ember from 'ember';
import Notification from '../models/notification';
import stringResources from '../utils/string-resources';

export default Ember.Component.extend({
  application: Ember.inject.service(),
  notifications: Ember.inject.service('notifications'),
  onOffContent: [false, true],
  settings: Ember.computed.alias('application.serviceSettings'),
  showLogging: false,
  showMetrics: true,
  showAbout: false,
  showCORS: false,
  minuteMetricsDisabled: Ember.computed.not('settings.MinuteMetrics.Enabled'),
  hourMetricsDisabled: Ember.computed.not('settings.HourMetrics.Enabled'),

  hourMetricsRetentionDisabled: function () {
    return !this.get('settings.HourMetrics.RetentionPolicy.Enabled') || !this.get('settings.HourMetrics.Enabled');
  }.property('settings.HourMetrics.RetentionPolicy.Enabled', 'settings.HourMetrics.Enabled'),

  minuteMetricsRetentionDisabled: function () {
    return !this.get('settings.MinuteMetrics.RetentionPolicy.Enabled') || !this.get('settings.MinuteMetrics.Enabled');
  }.property('settings.MinuteMetrics.RetentionPolicy.Enabled', 'settings.MinuteMetrics.Enabled'),

  loggingRetentionDisabled: Ember.computed.not('settings.Logging.RetentionPolicy.Enabled'),

  showUpdateButton: function () {
    return this.get('application.serviceSettings.hasDirtyAttributes') &&
      (!this.get('showAbout'));
  }.property('application.serviceSettings.hasDirtyAttributes', 'showAbout'),

  init: function () {
    this._renderSelect();
    return this._super();
  },

  _renderSelect: function () {
    // required to materialize css select
    Ember.run.scheduleOnce('afterRender', this, () => {
            Ember.$('select').material_select();
        });
  },

  _enableTab: function (tabFlagName) {
    this.set('showLogging', false);
    this.set('showTelemetry', false);
    this.set('showMetrics', false);
    this.set('showAbout', false);
    this.set('showCORS', false);

    this.set(tabFlagName, true);
    this._renderSelect();
  },

  actions: {
    actionMetrics: function () {
      this._enableTab('showMetrics');
    },

    actionLogging: function () {
      this._enableTab('showLogging');
    },

    actionCORS: function () {
      this._enableTab('showCORS');
    },

    actionAbout: function () {
      this.set('showUpdateButton', false);
      this._enableTab('showAbout');
    },

    actionUsageTelemetry: function () {
      this._enableTab('showTelemetry');
    },

    handleUpdate: function () {
      this.send('updateServiceSettings');
    },

    updateServiceSettings: function () {
      var notifications = this.get('notifications');

      if (!this.get('settings.MinuteMetrics.Enabled')) {
        this.set('settings.MinuteMetrics.IncludeAPIs', null);
        this.set('settings.MinuteMetrics.RetentionPolicy', null);
      }

      if (!this.get('settings.HourMetrics.Enabled')) {
        this.set('settings.HourMetrics.IncludeAPIs', null);
        this.set('settings.HourMetrics.RetentionPolicy', null);
      }

      if (!this.get('settings.Logging.RetentionPolicy')) {
        this.set('settings.Logging.RetentionPolicy', null);
      }

      notifications.addPromiseNotification(this.get('application.serviceSettings').save(),
        Notification.create({
          type: 'UpdateServiceSettings',
          text: stringResources.updateServiceSettings()
        })
      );
    },

    discardUnsavedChanges: function () {
      this.get('application.serviceSettings').rollbackAttributes();
      this._enableTab('showMetrics');
    }
  }
});
