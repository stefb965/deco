import DS from 'ember-data';

export default DS.Model.extend({
    blobs: function() {
    	return this.store.findAll('blob', { container: this});
    },
    name: DS.attr('string', {defaultValue: ''}),
    publicAccessLevel: ('string', {defaultValue: null})
});
