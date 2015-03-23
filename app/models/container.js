import DS from 'ember-data';

export default DS.Model.extend({
    blobs: DS.hasMany('blob', { async: true, inverse: 'container'})
});
