import DS from 'ember-data';

export default DS.ModelFragment.extend({
  Days: DS.attr('number'),
  Enabled: DS.attr('boolean')
});
