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
            this.set('activeConnection', account);
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
