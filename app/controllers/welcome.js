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

            console.log('account is:');
            console.dir(this.store.get('activeAccountId'));
            var container = this.store.createRecord('container', {name: 'asset-02c943cc-3fce-47bc-98ac-f356f3ac414b'});

            container.save().then(function(container){
                console.log('got container: ' + container.get('name'));
                console.dir(container);

                //test get blobs
                container.blobs().then(function(blobs){

                    console.log('got blobs:');
                    console.dir(blobs);
                });
            });

        },

        test: function () {
            var name = this.get('account_name'),
                key = this.get('account_key'),

                azureStorage = window.requireNode('azure-storage'),
                self = this, blobService;

/**
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
**/
        }
    }
});
