import {
  moduleFor,
  test
} from 'ember-qunit';
//todo pass 'development' into this module
import config from  '../../../config/environment';

moduleFor('controller:welcome', {
  // Specify the other units that are required for this test.
  // needs: ['controller:foo']
});

// Replace this with your real tests.
test('it exists', function(assert) {
  var controller = this.subject();
  assert.ok(controller);
});

test('it can connect', function(assert){

  var controller = this.subject();
  console.log('controller:');
  console.dir(controller);
  console.dir(config);
  controller.set('account_name', config.TEST_STORAGE_ACCOUNT);
  controller.set('account_key', config.TEST_STORAGE_ACCOUNT_KEY);
  console.log('key:' + config.TEST_STORAGE_ACCOUNT_KEY);
  controller.
});