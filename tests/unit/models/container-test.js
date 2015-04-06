import Ember from "ember";
import {
    test,
    moduleForModel
}
from 'ember-qunit';
import startApp from 'azureexplorer/tests/helpers/start-app';
var App, store;
moduleForModel('container', {
    // Specify the other units that are required for this test.
    needs: ['model:blob'],
    setup: function () {
        App = startApp();
        store = App.__container__.lookup('store:main');
        Ember.run(function(){
            var newAccount = store.createRecord('account', {
                name: 'Testaccount',
                key: '5555-5555-5555-5555',
                active: true
            });
        });
    },
    teardown: function () {
        Ember.run(App, App.destroy);
        window.localStorage.clear();
        store = null;
    }
});

test('it should return 2 containers with names and last modified fields', function (assert) {
    assert.expect(4);
    
    Ember.run(function () {
        store.find('container').then(function (containers) {
            
            containers.forEach(function(container){
                assert.ok(typeof container.get('name') === 'string');
                assert.ok(container.get('lastModified') instanceof Date);
            });

        });
    });
});
test('it should should return all blobs for the test containers', function (assert) {
    assert.expect(44);
    
    Ember.run(function () {
        
        store.find('container').then(function (containers) {
            
            containers.forEach(function(container){
                assert.ok(typeof container.get('name') === 'string');
                assert.ok(container.get('lastModified') instanceof Date);
            
                container.get('blobs').then(function(blobs){

                    blobs.forEach(function(blob){

                        assert.ok(typeof blob.get('name') === 'string');
                        assert.ok(typeof blob.get('container_id') === 'string');
                        assert.ok(typeof blob.get('size') === 'number');
                        assert.ok(typeof blob.get('type') === 'string');
                        assert.ok(blob.get('lastModified') instanceof Date);
                    });
                });
 
            });
            
        });
    });
});