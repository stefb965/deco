import DS from 'ember-data';

//TODO put this in one place
function getActiveAccount(store){
	return new Ember.RSVP.Promise(function(resolve, reject){

		var accounts = store.all('account');
		var length = accounts.get('length');
		var i = 0;
		accounts.forEach(function(account){

			if(account.get('activeAccount') === true){

				return Ember.run(null, resolve, account);
			
			}

			i += 1;
			if(i >= length){
				return Ember.run(null, reject, 'could not find any active accounts');
			}

		});


	});
}
export default DS.Adapter.extend({
	find: function(store, type, snapshot){
		var azureStorage = window.requireNode('azure-storage');

		return new Ember.RSVP.Promise(function(resolve, reject){
			getActiveAccount(store).then(function(account){

				var blobService = azureStorage.createBlobService(account.get('name') ,
		            account.get('key'));
				blobService.getContainerProperties(snapshot.name, function(err, data){
					if(err){
						return Ember.run(null, reject, err);
					}
					return Ember.run(null, resolve, [{name: data.name, id: data.name, lastModified: data.lastModified}]);
				});
			});
		});
		

	},
	createRecord: function(store, type, snapshot){

		var azureStorage = window.requireNode('azure-storage');

		return new Ember.RSVP.Promise(function(resolve, reject){
			getActiveAccount(store).then(function(account){
				var blobService = azureStorage.createBlobService(account.get('name') ,
		            account.get('key'));

				
				blobService.createContainerIfNotExists(snapshot.get('name'), function(err){
					if(err){
						return Ember.run(null, reject, err);
					}
					return Ember.run(null, resolve, snapshot);
				});
					

			});
		});
		
	},
	updateRecord: function(){
		throw 'not implemented';
	},
	deleteRecord: function(store, type, snapshot){
		var azureStorage = window.requireNode('azure-storage');

		return new Ember.RSVP.Promise(function(resolve, reject){
			getActiveAccount(store).then(function(account){
				var blobService = azureStorage.createBlobService(account.get('name') ,
		            account.get('key'));

				blobService.deleteContainer(snapshot.get('name'), function(err){
					if(err){
						return Ember.run(null, reject, err);
					}
					return Ember.run(null, resolve, null);
				});
				
			});
		});
	},
	findAll: function(store){
		var azureStorage = window.requireNode('azure-storage');

		return new Ember.RSVP.Promise(function(resolve, reject){
			getActiveAccount(store).then(function(account){
				var blobService = azureStorage.createBlobService(account.get('name') ,
		            account.get('key'));
				blobService.listContainersSegmented(null, function(err, data){

					if(err){
						return Ember.run(null, reject, err);
					}
					var containerModels = [];
					for(var i in data.entries){

						if(i % 1 === 0){
							containerModels.push({
								id: data.entries[i].name,
								name: data.entries[i].name,
								lastModified: data.entries[i].properties['last-modified']
							});
						}
						
					}
					return Ember.run(null, resolve, containerModels);
				});
			});
		});
	},
	findQuery: function(store, type, snapshot){

		
		var azureStorage = window.requireNode('azure-storage');

		return new Ember.RSVP.Promise(function(resolve, reject){
			getActiveAccount(store).then(function(account){

				var blobService = azureStorage.createBlobService(account.get('name') ,
		            account.get('key'));
				blobService.getContainerProperties(snapshot.name, function(err, data){

					if(err){
						return Ember.run(null, reject, err);
					}
					return Ember.run(null, resolve, [{name: data.name, id: data.name, lastModified: data.lastModified}]);
				});
			});
		});
		
	}
});
