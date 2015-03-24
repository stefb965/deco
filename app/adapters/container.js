import DS from 'ember-data';

//TODO put this in one place
function getActiveAccount(store){
	return new Ember.RSVP.Promise(function(resolve, reject){

		var accounts = store.all('account');
		var activeAccount;
		var length = accounts.get('length');
		var i = 0;
		accounts.forEach(function(account){

			if(account.get('activeAccount') == true){

				return Ember.run(null, resolve, account);
			
			}

			i++;
			if(i >= length){
				return Ember.run(null, reject, 'could not find any active accounts');
			}

		});


	});
}
export default DS.Adapter.extend({
	find: function(store, type, snapshot){
		var azureStorage = window.requireNode('azure-storage');
		var account = store.find('account', { activeAccount: true});


		return new Ember.RSVP.Promise(function(resolve, reject){
			getActiveAccount(store).then(function(account){
				var blobService = azureStorage.createBlobService(account.get('name') ,
		            account.get('key'));
				blobService.getContainerMetadata(snapshot.name, function(err, data){
					if(err){
						return Ember.run(null, reject, err);
					}
					return Ember.run(null, resolve, data);
				});
			});
		});
		

	},
	createRecord: function(store, type, snapshot){
		
		console.log('DEBUG: type=');
		console.dir(type);
		console.log('DEBUG: snapshot=');
		console.dir(snapshot.get('name'));

		var azureStorage = window.requireNode('azure-storage');

		return new Ember.RSVP.Promise(function(resolve, reject){
			getActiveAccount(store).then(function(account){
				var blobService = azureStorage.createBlobService(account.get('name') ,
		            account.get('key'));

				
				blobService.createContainerIfNotExists(snapshot.get('name'), function(err, created){
					if(err){
						return Ember.run(null, reject, err);
					}
					return Ember.run(null, resolve, snapshot);
				});
					

			});
		});
		
	},
	updateRecord: function(store, type, snapshot){
		var azureStorage = window.requireNode('azure-storage');
		var account = store.find('account', { activeAccount: true});


		return new Ember.RSVP.Promise(function(resolve, reject){
			getActiveAccount(store).then(function(account){
				var blobService = azureStorage.createBlobService(account.get('name') ,
		            account.get('key'));
				if(err){
					return Ember.run(null, reject, err);
				}
				return Ember.run(null, resolve, data);
			});
		});
	},
	deleteRecord: function(store, type, snapshot){
		var azureStorage = window.requireNode('azure-storage');

		var account = store.find('account', { activeAccount: true});


		return new Ember.RSVP.Promise(function(resolve, reject){
			getActiveAccount(store).then(function(account){
				var blobService = azureStorage.createBlobService(account.get('name') ,
		            account.get('key'));
				if(err){
					return Ember.run(null, reject, err);
				}
				return Ember.run(null, resolve, data);
			});
		});
	},
	findAll: function(store, type, ids, snapshots){
		var azureStorage = window.requireNode('azure-storage');
		var account = store.find('account', { activeAccount: true});


		return new Ember.RSVP.Promise(function(resolve, reject){
			getActiveAccount(store).then(function(account){
				var blobService = azureStorage.createBlobService(account.get('name') ,
		            account.get('key'));
				blobService.listContainersSegmented(null, function(err, data){
					if(err){
						return Ember.run(null, reject, err);
					}
					return Ember.run(null, resolve, data);
				});
			});
		});
	},
	findQuery: function(store, type, snapshot){

		
		var azureStorage = window.requireNode('azure-storage');
		var account = store.find('account', { activeAccount: true});
		var blobService = azureStorage.createBlobService(account.account_name ,
            account.account_key);

		return new Ember.RSVP.Promise(function(resolve, reject){
			getActiveAccount(store).then(function(account){
				blobService.getContainerMetadata(snapshot.name, function(err, data){
					if(err){
						return Ember.run(null, reject, err);
					}
					return Ember.run(null, resolve, data);
				});
			});
		});
	}
});
