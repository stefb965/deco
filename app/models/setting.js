import DS from 'ember-data';

/**
 * Ember-Data Model for settings
 */
export default DS.Model.extend({
    firstUse: DS.attr('boolean', {                          // Is this the first use of the app?
        defaultValue: true
    }),
    allowUsageStatistics: DS.attr('boolean', {             // Can we collect anonymized usage statistics?
        defaultValue: true
    })
});
