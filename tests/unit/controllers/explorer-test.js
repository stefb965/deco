import Ember from "ember";
import {
  moduleFor,
  test
} from 'ember-qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';
var App, store;
moduleFor('controller:explorer', {
  // Specify the other units that are required for this test.
    needs: ['controller:application', 'controller:notifications', 'model:blob', 'model:container'],

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
      controller.send('addContainerData');
  });
});

test('it should download blobs', function(assert) {
  assert.expect(62);
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
        container.get('blobs', { prefix: '/' }).then(function(blobs){

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
  assert.expect(14);
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
    
    controller.get('containers').then((containers) => {
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
    controller.get('containers').then((containers) => {
        var count = 0;
        containers.forEach((container) => { 
          count++;
        });
        assert.ok(count === 0, 'expected exactly 0 container matches');
    });
  });
});

test('it should have the correct subdirectories', function(assert) {
  assert.expect(13);
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
  controller.addObserver('subDirectories', controller, () => {

    if (controller.get('subDirectories').length === 1 &&
        controller.get('subDirectories')[0].name === 'mydir1/') {
        assert.ok(true);
    }
  });
  controller.store = store;
  controller.set('searchQuery', 'testcontainer');
  Ember.run( () => {
    controller.get('containers')
    .then(() => {
      controller.set('activeContainer', 'testcontainer');      
    });
  });
});

test('it should reset path segments when switching containers', function(assert) {
  assert.expect(34);
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
  var sentChangeAction = false,
      sentPathSegmentChangeAction = false;

  controller.addObserver('subDirectories', controller, () => {
    if(!sentChangeAction) {
      sentChangeAction = true;
      controller.send('changeSubDirectory', { name: 'mydir1/' });
      return;
    }

    // we will receieve this handler multiple times as the
    // controller changes state and clears/refills subdirectories
    if (controller.get('subDirectories').length === 1 &&
        controller.get('subDirectories')[0].name === 'mydir1/mydir2' &&
        sentPathSegmentChangeAction === false)
    {
        assert.ok(controller.get('pathSegments').length === 2);
        sentPathSegmentChangeAction = true;
        // this specifcally tests clicking a button to go up
        controller.addObserver('pathSegments', controller, () => {
            if (controller.get('pathSegments').length === 1 &&
                controller.get('pathSegments')[0].name === '/') {
                assert.ok(true);
            }
        });
        controller.send('switchActiveContainer', 'testcontainer2');
        return;
    }
  });

  controller.store = store;
  controller.set('searchQuery', 'testcontainer');
  Ember.run( () => {
    controller.get('containers')
    .then(() => {
      controller.set('activeContainer', 'testcontainer');      
    });
  });
});

test('it should change directory based on path segment', function(assert) {
  assert.expect(34);
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
  var sentChangeAction = false,
      sentPathSegmentChangeAction = false;

  controller.addObserver('subDirectories', controller, () => {
    if(!sentChangeAction) {
      sentChangeAction = true;
      controller.send('changeSubDirectory', { name: 'mydir1/' });
      return;
    }

    // we will receieve this handler multiple times as the
    // controller changes state and clears/refills subdirectories
    if (controller.get('subDirectories').length === 1 &&
        controller.get('subDirectories')[0].name === 'mydir1/mydir2' &&
        sentPathSegmentChangeAction === false)
    {
        assert.ok(true);
        sentPathSegmentChangeAction = true;
        // this specifcally tests clicking a button to go up
        controller.send('changeSubDirectory', controller.get('pathSegments')[0]);
    }

    if (controller.get('subDirectories').length === 1 &&
        controller.get('subDirectories')[0].name === 'mydir1/') {
        assert.ok(true);
    }

  });
  controller.store = store;
  controller.set('searchQuery', 'testcontainer');
  Ember.run( () => {
    controller.get('containers')
    .then(() => {
      controller.set('activeContainer', 'testcontainer');      
    });
  });
});

test('it should change subdirectories', function(assert) {
  assert.expect(34);
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
  var sentChangeAction = false,
      sentChangeUpAction = false;

  controller.addObserver('subDirectories', controller, () => {
    if(!sentChangeAction) {
      // change to subdirectory
      sentChangeAction = true;
      controller.send('changeSubDirectory', { name: 'mydir1/' });
      return;
    }
    
    // we will receieve this handler multiple times as the
    // controller changes state and clears/refills subdirectories
    if (controller.get('subDirectories').length === 1 &&
        controller.get('subDirectories')[0].name === 'mydir1/mydir2' &&
        !sentChangeUpAction) {
        assert.ok(true);
        sentChangeUpAction = true;
        controller.send('changeSubDirectory', { name: ''});
    }

    if (controller.get('subDirectories').length === 1 &&
        controller.get('subDirectories')[0].name === 'mydir1/') {
        assert.ok(true);
    }
    
  });
  controller.store = store;
  controller.set('searchQuery', 'testcontainer');
  Ember.run( () => {
    controller.get('containers')
    .then(() => {
      controller.set('activeContainer', 'testcontainer');      
    });
  });
});

test('it should upload file to blob', function(assert) {

  assert.expect(27);
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
  var changed = false;
  controller.store = store;
  controller.set('searchQuery', 'testcontainer');
  controller.set('activeContainer', 'testcontainer');
  Ember.run( () => {
    controller.get('containers')
    .then(() => {
      controller.send('uploadBlobData', '/testdir/testfile.js;/testdir/testfile2.js;/testdir/testfile3.js', 'mydir1/');    
    });
  });
});

test('it should create a subdirectory/folder upon upload', function(assert) {

  assert.expect(17);
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
  var changed = false;
  controller.store = store;
  controller.set('searchQuery', 'testcontainer');
  controller.set('activeContainer', 'testcontainer');

  controller.addObserver('subDirectories', controller, () => {
      if (controller.get('subDirectories').length === 3) {
        controller.get('subDirectories').forEach(subDir => {
            if (subDir.name === 'mydir5/') {
              assert.ok(true);
            }
        });
      }
  });

  Ember.run( () => {
    controller.get('containers')
    .then(() => {
      controller.send('uploadBlobData', '/testdir/testfile.js', 'mydir5/testfile.js');    
    });
  });
});

test('it should delete all but 1 blobs', function(assert) {

  assert.expect(22);
  App = startApp(null, assert);
  store = App.__container__.lookup('store:main');
  Ember.run(function(){
      var newAccount = store.createRecord('account', {
          name: 'Testaccount',
          key: '5555-5555-5555-5555',
          active: true
      });
  });

  var controller = this.subject(),
      initialBlobCount;

  controller.store = store;
  controller.set('searchQuery', 'testcontainer');

  controller.addObserver('blobs', controller, () => {
    controller.get('blobs')
    .then( blobs => {
        var count = 0;
        blobs.forEach(function (blob){
            if (count > 2) {
              return;
            }

            blob.set('selected', true);
            count++;
        });
        
        initialBlobCount = blobs.get('length');
        var blobCount = 0;
        // bind to the record array as it changes
        controller.addObserver('blobs.@each', controller, () => {
          controller.get('blobs')
          .then(blobs => {
              blobCount += 1;
              if (blobCount === 3) {
                  assert.ok(blobs.get('length') === initialBlobCount - 3);
              }
          });
        });

        controller.send('deleteBlobData');
    });
    
  });

  Ember.run( () => {
    controller.get('containers')
    .then(() => {
      controller.set('activeContainer', 'testcontainer');      
    });
  });
});

test('it should delete no blobs', function(assert) {

  assert.expect(13);
  App = startApp(null, assert);
  store = App.__container__.lookup('store:main');
  Ember.run(function(){
      var newAccount = store.createRecord('account', {
          name: 'Testaccount',
          key: '5555-5555-5555-5555',
          active: true
      });
  });

  var controller = this.subject(),
      initialBlobCount;

  controller.store = store;
  controller.set('searchQuery', 'testcontainer');

  controller.addObserver('blobs', controller, () => {
    
    controller.get('blobs')
    .then( blobs => {
        
        initialBlobCount = blobs.get('length');
        controller.send('deleteBlobData');

        return controller.get('blobs');
    })
    .then( blobs => {
      assert.ok(blobs.get('length') === initialBlobCount);
    });
    
  });

  Ember.run( () => {
    controller.get('containers')
    .then(() => {
      controller.set('activeContainer', 'testcontainer');      
    });
  });
});