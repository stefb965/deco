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
                key = this.get('account_key'),
                domain = this.get('account_domain');

            var newAccount = this.store.createRecord('account', {
                name: name,
                key: key,
                domain: domain
            });

            newAccount.save();
        },

        test: function () {
            console.log('testing storage connection...');

            var name = this.get('account_name'),
                key = this.get('account_key'),
                domain = this.get('account_domain');
            console.log(name);
            console.log(key);
            var azureStorage = window.requireNode('azure-storage');
            var blobService = azureStorage.createBlobService(name,
            key);
            /**
            blobService.listContainersSegmented(null, function(error, result, response){
              if(error){
                console.error('hit an error:');
                console.dir(error)
                this.set('result', {success: false, reason: error });
              }

              this.set('result', {success: true, reason: null });
            });
            **/
            this.store.account_name = this.get('account_name');
            this.store.account_key = this.get('account_key');
            this.store.createRecord('container', { name: 'testcontainer'}).save().then(function(container){
                console.dir(container);
            });

            this.store.find('container', {name: 'testcontainer'}).then(function(container){
                console.log('found container:');
                console.dir(container);
            });

        }
    }
});
