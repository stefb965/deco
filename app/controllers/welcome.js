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
            // TODO - Move these tests to a sane place to test
            // TEST- CONTAINERS
            // var container = this.store.createRecord('container', {name: 'asset-02c943cc-3fce-47bc-98ac-f356f3ac414b'});
            // var assert = window.requireNode('assert');
            // container.save().then(function(container){
            //     assert(container.get('name') !== null);
            // });
            // this.store.find('container').then(function(containers){
            //     console.log('container listing: ');
            //     containers.forEach(function(container){
            //         assert(container !== null);
            //         console.log(container.id);
            //         console.log(container.get('name'));
            //         console.log(container.get('lastModified'));
            //         console.log('got container: ' + container.get('name'));
            //         console.dir(container);
            //         //TEST BLOBS
            //         container.get('blobs').then(function(blobs){
            //             console.log("LENGTH: " + blobs.get('length'));
            //             blobs.forEach(function(blob){
            //                 console.log('got blobs:');
            //                 assert(blob !== null);
            //                 console.log('BLOB:' + blob.get('container') + '/' + blob.id);
            //                 console.log('size:' + blob.get('size'));
            //                 console.log('Last Modified: ' + blob.get('lastModified'));
            //                 console.log('Type: ' + blob.get('type'));
            //             });
            //         });
            //     });
            // });
            // var self = this;
            // this.store.find('container')
            // .then(function(containers){
            //     console.log('container records:');
            //     console.dir(containers);
            //     containers.forEach(function(container){
            //         console.log("BLOBS IN container " + container.get('name'));
            //         container.blobs().then(function(blobs){
            //             blobs.forEach(function(blob){
            //                 console.log("GOT BLOB:");
            //                 console.log(blob.get('name'));
            //             });
            //         });
            //     });
            // });
        },
        test: function () {
            var name = this.get('account_name'),
                key = this.get('account_key'),
                azureStorage = window.requireNode('azure-storage'),
                self = this,
                blobService;
            if (name && key) {
                Ember.$('#modal-testing').openModal();
                try {
                    blobService = azureStorage.createBlobService(name, key);
                    blobService.listContainersSegmented(null, function (error) {
                        if (error) {
                            self.set('result', {
                                success: false,
                                reason: error
                            });
                        }
                        self.set('result', {
                            success: true,
                            reason: null
                        });
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
