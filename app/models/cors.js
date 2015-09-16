import DS from 'ember-data';

export default DS.ModelFragment.extend({
    CorsRule: DS.hasManyFragments('corsRule')
});
