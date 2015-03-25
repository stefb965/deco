import Ember from 'ember';

export default Ember.Controller.extend({

    needs: 'application',

    activeConnection: Ember.computed.alias('controllers.application.activeConnection'),

    setup: function () {
        var model = this.get('model');

        if (!model || !model.content) {
            this.set('addNewUi', true);
        }
    }.observes('model'),

    actions: {
        toggleAddNew: function () {
            this.toggleProperty('addNewUi');
        },

        addNew: function () {
            var name = this.get('account_name'),
                key = this.get('account_key');

            var newAccount = this.store.createRecord('account', {
                name: name,
                key: key
            });

            newAccount.save();
            this.send('connect', newAccount);
        },

        connect: function (account) {
            console.log('set active account id to: ' + account.id);
            this.store.set('activeAccountId', account.id);
            account.set('activeAccount', true);
            account.save();
            //this.set('activeConnection', account);

            this.transitionToRoute('explorer');
        },

        selectAndConnect: function () {


            var selectedAccount = this.get('selectedAccount'),
               self = this;

            this.store.find('account', selectedAccount).then(function (result) {
               if (result) {
                   self.send('connect', result);
               }

            });

            //TODO - Move these tests to a sane place to test
            //TEST- CONTAINERS
            /**
            var container = this.store.createRecord('container', {name: 'asset-02c943cc-3fce-47bc-98ac-f356f3ac414b'});
            var assert = window.requireNode('assert');
            container.save().then(function(container){
                assert(container.get('name') !== null);
            });
            
            this.store.find('container').then(function(containers){

                console.log('container listing: ');

                containers.forEach(function(container){
                    assert(container !== null);
                    console.log(container.id);
                    console.log(container.get('name'));
                    console.log(container.get('lastModified'));


                    console.log('got container: ' + container.get('name'));
                    console.dir(container);

                    //TEST BLOBS
                    var blobs = container.get('blobs');
                    console.log("LENGTH: " + container.get('blobs.length'));
                    blobs.forEach(function(blob){

                        console.log('got blobs:');

                        assert(blob !== null);
                        console.log('BLOB:' + blob.get('container') + '/' + blob.id);
                        console.log('size:' + blob.get('size'));
                        console.log('Last Modified: ' + blob.get('lastModified'));
                        console.log('Type: ' + blob.get('type'));
                    });

                });
                
            });
            
            this.store.find('container', { name: 'asset-02c943cc-3fce-47bc-98ac-f356f3ac414b'} )
            .then(function(containers){

                containers.forEach(function(container){
                    console.log(container.get('lastModified'));
                    assert(container.get('lastModified') !== undefined && container.get('lastModified') !== null );
                });
                
            });
            **/
        },

        test: function () {
            var name = this.get('account_name'),
                key = this.get('account_key'),
                azureStorage = window.requireNode('azure-storage'),
                self = this, blobService;


            if (name && key) {
                Ember.$('#modal-testing').openModal();
                try {
                    blobService = azureStorage.createBlobService(name, key);

                    blobService.listContainersSegmented(null, function (error) {
                        if (error) {
                            self.set('result', {success: false, reason: error});
                        }

                        self.set('result', {success: true, reason: null});
                    });
                } catch (error) {
                    toast(error, 4000);
                }
            } else {
                return toast('Please enter name and key!');
            }

        }
    }
});
