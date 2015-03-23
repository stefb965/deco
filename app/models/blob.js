import DS from 'ember-data';

export default DS.Model.extend({
    container: DS.belongsTo('container', { async: true, inverse: 'blobs'})
});
