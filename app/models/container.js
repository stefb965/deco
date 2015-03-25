import DS from 'ember-data';

export default DS.Model.extend({
    blobs: DS.hasMany('blob', {async: true}),
    name: DS.attr('string', {defaultValue: ''}),
    lastModified: DS.attr('string', {defaultValue: ''}),
    publicAccessLevel: ('string', {defaultValue: null}),

    blob_count: function () {
        return this.get('blobs').length;
    }.property('blobs')
});
