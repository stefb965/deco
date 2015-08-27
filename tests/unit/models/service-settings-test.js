import { moduleForModel, test } from 'ember-qunit';
import ServiceSettings from 'azureexplorer/models/service-settings';

moduleForModel('service-settings', 'Unit | Model | service settings', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it exists', function(assert) {
  assert.ok(ServiceSettings);
});
