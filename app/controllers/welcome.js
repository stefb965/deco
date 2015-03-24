import Ember from 'ember';

export default Ember.Controller.extend({

    setup: function () {
        var model = this.get('model');

        if (!model || !model.content) {
            this.set('addNewUi', true);
        }
    }.on('init'),

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
        },

        test: function () {
            var name = this.get('account_name'),
                key = this.get('account_key'),
                azureStorage = window.requireNode('azure-storage'),
                self = this, blobService;

            if (name && key) {
                Ember.$('#modal1').openModal();
                try {
                    blobService = azureStorage.createBlobService(name, key);

                    blobService.listContainersSegmented(null, function (error) {
                        if (error) {
                            console.error('hit an error:');
                            console.dir(error);
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
