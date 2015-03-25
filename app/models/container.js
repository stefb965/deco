import DS from 'ember-data';

export default DS.Model.extend({
    blobs: DS.hasMany('blob', {async: true}),
    //lolz this one really doesn't work yet
    blob_count: function(){
    	return this.get('blobs.length');
    }.property('blobs'),
    name: DS.attr('string', {defaultValue: ''}),
    lastModified: DS.attr('string', {defaultValue: ''}),
    publicAccessLevel: ('string', {defaultValue: null})
});
