import DS from 'ember-data';

export default DS.Model.extend({
    blobs: function() {

    },
    name: DS.attr('string', {defaultValue: ''}),
    publicAccessLevel: ('string', {defaultValue: null})
});
