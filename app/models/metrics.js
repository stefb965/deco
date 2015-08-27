import DS from 'ember-data';

export default DS.ModelFragment.extend({
  Enabled: DS.attr('boolean'),
  IncludeAPIs: DS.attr('boolean'),
  RetentionPolicy: DS.hasOneFragment('retentionPolicy')
});
