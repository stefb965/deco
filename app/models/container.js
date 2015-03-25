import DS from 'ember-data';

export default DS.Model.extend({
    blobs: function() {
    	return this.store.find('blob', { container: this });
    },
    name: DS.attr('string', {defaultValue: ''}),
    lastModified: DS.attr('string', {defaultValue: ''}),
    publicAccessLevel: ('string', {defaultValue: null})
});
