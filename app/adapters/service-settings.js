import Ember from 'ember';
import DS from 'ember-data';
import serializer from '../serializers/azure-storage';
import accountUtils from '../utils/account';

export default DS.Adapter.extend({
  serializer: serializer.create(),
    nodeServices: Ember.inject.service(),

    _addRetentionPolicy: function (metricsObject, snapshot) {
      metricsObject.RetentionPolicy = {
          Enabled: snapshot.attr('RetentionPolicy').attr('Enabled')
      };

      if (metricsObject.RetentionPolicy.Enabled) {
        metricsObject.RetentionPolicy.Days = snapshot.attr('RetentionPolicy').attr('Days');
      }
    },

    _transfromSettings: function (snapshot) {
      var minuteMetrics = {
          Enabled: snapshot.attr('MinuteMetrics').attr('Enabled'),
          IncludeAPIs: snapshot.attr('MinuteMetrics').attr('IncludeAPIs') ? true : undefined
        },
        hourMetrics = {
          Enabled: snapshot.attr('HourMetrics').attr('Enabled'),
          IncludeAPIs: snapshot.attr('HourMetrics').attr('IncludeAPIs') ? true : undefined
        },
        logging = {
          Delete: snapshot.attr('Logging').attr('Delete'),
          Read: snapshot.attr('Logging').attr('Read'),
          Write: snapshot.attr('Logging').attr('Write')
        };

      if (snapshot.attr('MinuteMetrics').attr('RetentionPolicy')) {
        this._addRetentionPolicy(minuteMetrics, snapshot.attr('MinuteMetrics'));
      }

      if (snapshot.attr('HourMetrics').attr('RetentionPolicy')) {
        this._addRetentionPolicy(minuteMetrics, snapshot.attr('HourMetrics'));
      }

      if (snapshot.attr('Logging').attr('RetentionPolicy')) {
        this._addRetentionPolicy(logging, snapshot.attr('Logging'));
      }

      return {
        MinuteMetrics: minuteMetrics,
        HourMetrics: hourMetrics,
        Logging: logging
      };
    },
    /**
     * Implementation of Ember Data's find method, returning the settings record
     * @param  {DS.Store} store             - The DS.Store, containing all data for records loaded
     * @return {Promise}
     */
    find: function (store, type, id) {
        return accountUtils.getBlobService(store, this.get('azureStorage'))
        .then(blobService => {
          var getServiceProperties = Ember.RSVP.denodeify(blobService.getServiceProperties);

          return getServiceProperties.call(blobService);

        })
        .then(settings => {
          // there will always be just one settings object
          // so give it a fixed id
          settings.id = id;
          Ember.Logger.debug('found settings:');
          Ember.Logger.debug(settings);
          return settings;
        })
        .catch (error => {
          Ember.Logger.debug(error);
          throw (error);
        });
    },

    /**
     * Ember Data's createRecord method - not implemented (because blobs are read-only)
     */
    createRecord: function () {
      Ember.Logger.debug('create record not implemented');
        throw 'not implemented ';
    },

    /**
     * Ember Data's updateRecord method - Only Updates Valid Property Fields
     * @param  {DS.Store} store             - The DS.Store, containing all data for records loaded
     * @param  {DS.Model} type              - The DS.Model class of the record
     * @param  {DS.Snapshot} snapshot       - The DS.Snapshot (private) of the record
     * @return {Promise}
     */
    updateRecord: function (store, type, snapshot) {
        return accountUtils.getBlobService(this.store, this.get('azureStorage'))
        .then(blobService => {
          var setServiceProperties = Ember.RSVP.denodeify(blobService.setServiceProperties);

          Ember.Logger.debug('updating settings:');
          Ember.Logger.debug(this._transfromSettings(snapshot));
          // Azure SDK looks for all properties on object. Ember adds extra stuff
          // to objects so ensure a clean settings object gets to the sdk.
          return setServiceProperties.call(blobService, this._transfromSettings(snapshot));
        })
        .then(() => {
          return snapshot;
        });
    },

    /**
     *  Service settings cannot be deleted
     */
    deleteRecord: function () {
      Ember.Logger.debug('deleteRecord not implemented');
        throw 'not implemented';
    },

    /**
     * Ember Data's findAll method, used to retrieve all records for a given type.
     * Is an alias to find since there is only 1 record.
     */
    findAll: function (store) {
      return this.find(store);
    },

    /**
     * Not implemented, since there is only one record
     */
    findQuery: function () {
      Ember.Logger.debug('findQuery not implemented');
        throw 'not implemented';
    },

    /**
     * An alias for the Azure Storage Node Module.
     */
    azureStorage: Ember.computed.alias('nodeServices.azureStorage')
});
