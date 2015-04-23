import Ember from "ember";
import {
  moduleFor,
  test
} from 'ember-qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';
var App, store;
moduleFor('controller:explorer', {
  // Specify the other units that are required for this test.
    needs: ['controller:application', 'model:blob', 'model:container'],

    teardown: function () {
        Ember.run(App, App.destroy);
        window.localStorage.clear();
        store = null;
    }

});


test('it should create a container', function(assert) {
  assert.expect(2);
  App = startApp(null, assert);
  store = App.__container__.lookup('store:main');
  Ember.run(function(){
      var newAccount = store.createRecord('account', {
          name: 'Testaccount',
          key: '5555-5555-5555-5555',
          active: true
      });
  });

  var controller = this.subject();
  controller.store = store;
  // test the controller calls the azure create container api
  // we should see asseets come from the mock node service
  Ember.run(function(){
      controller.send('createContainer');
  });


});

test('it should download blobs', function(assert) {
  assert.expect(48);
  App = startApp(null, assert);
  store = App.__container__.lookup('store:main');
  Ember.run(function(){
      var newAccount = store.createRecord('account', {
          name: 'Testaccount',
          key: '5555-5555-5555-5555',
          active: true
      });
  });

  var controller = this.subject();
  controller.store = store;

  Ember.run(function(){
    store.find('container').then(function(containers){
      containers.forEach(function(container){
        container.get('blobs').then(function(blobs){

          controller.set('blobs', blobs);
          blobs.forEach(function(blob){
            // indicated blob is unchecked
            blob.set('selected', false);
          });
          // controller should select all blobs
          controller.send('selectAllBlobs');
          controller.send('downloadBlobs', './testdir');
          controller.send('selectAllBlobs');
        });
      });
    });
  });
});

test('it should not download any blobs', function(assert) {
  assert.expect(8);
  App = startApp(null, assert);
  store = App.__container__.lookup('store:main');
  Ember.run(function(){
      var newAccount = store.createRecord('account', {
          name: 'Testaccount',
          key: '5555-5555-5555-5555',
          active: true
      });
  });

  var controller = this.subject();
  controller.store = store;

  Ember.run(function(){
    store.find('container').then(function(containers){
      containers.forEach(function(container){
        container.get('blobs').then(function(blobs){

          controller.set('blobs', blobs);
          // no blobs are selected, so none should download
          controller.send('downloadBlobs', './testdir');

        });
      });
    });
  });
});

test('it should search and return 1 container', function(assert) {
  assert.expect(4);
  App = startApp(null, assert);
  store = App.__container__.lookup('store:main');
  Ember.run(function(){
      var newAccount = store.createRecord('account', {
          name: 'Testaccount',
          key: '5555-5555-5555-5555',
          active: true
      });
  });

  var controller = this.subject();
  controller.store = store;

  Ember.run(function(){
    controller.set('searchQuery', 'testcontainer2');
    
    controller.get('model').then((containers) => {
        var count = 0;
        containers.forEach((container) => { 
          assert.ok(container.get('name').indexOf('testcontainer2') > -1);
          count++;
        });
        assert.ok(count === 1, 'expected exactly 1 container match');
    });
  });
});


test('it should search and return 0 container', function(assert) {
  assert.expect(3);
  App = startApp(null, assert);
  store = App.__container__.lookup('store:main');
  Ember.run(function(){
      var newAccount = store.createRecord('account', {
          name: 'Testaccount',
          key: '5555-5555-5555-5555',
          active: true
      });
  });

  var controller = this.subject();
  controller.store = store;

  Ember.run(function(){
    controller.set('searchQuery', 'nonexistentcontainer');
    
    controller.get('model').then((containers) => {
        var count = 0;
        containers.forEach((container) => { 
          count++;
        });
        assert.ok(count === 0, 'expected exactly 0 container matches');
    });
  });
});