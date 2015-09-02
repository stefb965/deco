import DS from 'ember-data';

/**
 * Simple Ember-Data model for Azure Storage accounts
 */
export default DS.Model.extend({
    name: DS.attr('string'),
    key: DS.attr('string'),
    dnsSuffix: DS.attr('string'),
    active: DS.attr('boolean')
});
