import DS from 'ember-data';

export default DS.ModelFragment.extend({
  Delete: DS.attr('boolean'),
  Read: DS.attr('boolean'),
  Write: DS.attr('boolean'),
  RetentionPolicy: DS.hasOneFragment('retentionPolicy')
});
