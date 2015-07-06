import Ember from 'ember';

/**
 * The controller for the welcome view - controlling the creation/addition/connection of and
 * with accounts.
 */
export default Ember.Controller.extend({
    needs: 'application',
    activeConnection: Ember.computed.alias('controllers.application.activeConnection'),
    loading: false,

    /**
     * If the model is changed, we check if there's reason to go straight to
     * the "add a new account" UI
     */
    setup: function () {
        var model = this.get('model');
        if (!model || !model.content || model.content.length < 1) {
            this.set('addNewUi', true);
        }
    }.observes('model'),

    /**
     * If the user selects an account for editing, we're
     * updating the name & key field with the right data
     */
    editAccountObserver: function () {
        var editAccount = this.get('selectedEditAccount');

        this.store.find('account', editAccount).then(result => {
            if (result) {
                this.set('editAccountName', result.get('name'));
                this.set('editAccountKey', result.get('key'));
            }
        });
    }.observes('selectedEditAccount'),

    actions: {
        /**
         * Show the "Add New Account" UI
         */
        toggleAddNew: function () {
            this.toggleProperty('addNewUi');
        },

        /**
         * Show the "Edit Account" UI
         */
        toggleEdit: function () {
            this.toggleProperty('editUi');
            this.send('selectize');
        },

        /**
         * Save data for a changed account and go back to the "Select Account" view
         */
        edit: function () {
            var editAccount = this.get('selectedEditAccount');
            var editAccountName = this.get('editAccountName');
            var editAccountKey = this.get('editAccountKey');

            this.store.find('account', editAccount).then(result => {
                if (result) {
                    result.set('name', editAccountName);
                    result.set('key', editAccountKey);
                    result.save();
                }

                this.send('toggleEdit');
            });
        },

        delete: function () {
        },

        /**
         * Add a new account and connect to it.
         */
        addNew: function () {
            var name = this.get('account_name');
            var key = this.get('account_key');
            var newAccount = this.store.createRecord('account', {
                    name: name,
                    key: key
                });

            newAccount.save();

            this.send('connect', newAccount.get('id'));
        },

        /**
         * Connect to a selected account
         * @param  {string} activeAccountId
         */
        connect: function (activeAccountId) {
            var self = this;

            this.set('loading', true);

            if (!activeAccountId) {
                activeAccountId = this.get('selectedAccount');
            }

            this.store.find('account').then(function (accounts) {
                var i;
                var account;

                if (accounts && accounts.content && accounts.content.length > 0) {
                    for (i = 0; i < accounts.content.length; i = i + 1) {
                        account = accounts.content[i];
                        if (account.get('id') === activeAccountId) {
                            self.set('activeConnection', account.get('name'));
                            account.set('active', true);
                        } else {
                            account.set('active', false);
                        }
                    }
                }

                self.transitionToRoute('explorer');
            });
        },

        /**
         * Test the selected account and return whether or not we can actually connect
         */
        test: function () {
            var name = this.get('account_name');
            var key = this.get('account_key');
            var azureStorage = window.requireNode('azure-storage');
            var self = this;
            var blobService;

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
