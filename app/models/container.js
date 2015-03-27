import DS from 'ember-data';
export default DS.Model.extend({
    blobs: function () {
        return this.store.find('blob', {
            container_id: this.get('name')
        });
    }.property(),
    name: DS.attr('string', {
        defaultValue: ''
    }),
    lastModified: DS.attr('date', {
        defaultValue: ''
    }),
    publicAccessLevel: ('string', {
        defaultValue: null
    })
});
