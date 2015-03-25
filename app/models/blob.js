import DS from 'ember-data';

export default DS.Model.extend({
    container: DS.belongsTo('container'),
    name: DS.attr('string'),
    size: DS.attr('number'),
    lastModified: DS.attr('date'),
    type: DS.attr('string'),
    download: function(){
    	throw 'not implemented';
    }
});
