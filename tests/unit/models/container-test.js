import {
  moduleForModel,
  test
} from 'ember-qunit';
import config from '../../../config/environment';
import app from '../../helpers/start-app';

moduleForModel('container', {
  // Specify the other units that are required for this test.
  needs: []
});

test('it should find all containers', function(assert) {
	/**
  this.subject({name:'testcontainer2', account_name: config.TEST_STORAGE_ACCOUNT,
	account_key: config.TEST_STORAGE_ACCOUNT_KEY}).then(function(model){
		console.log('we got model!');
		console.dir(model);
		assert.ok(model);
	});
  **/
  this.store.account_name = config.TEST_STORAGE_ACCOUNT;
  this.store.account_key = config.TEST_STORAGE_ACCOUNT_KEY;
  var model = this.subject({name:'testcontainername'});
  this.store.find('container', 0);
  console.dir(model);
  assert.equal(model.name, 'testcontainername');
});
