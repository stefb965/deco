import DS from 'ember-data';
import accountUtil from '../utilities/account';
export default DS.Model.extend({
    container: DS.belongsTo('container'),
    name: DS.attr('string'),
    size: DS.attr('number'),
    lastModified: DS.attr('date'),
    type: DS.attr('string'),
    //returns a stream to the blob
    download: function(){

    	accountUtil.getActiveAccount(this.store).then(function(account){
    		var blobService = azureStorage.createBlobService(account.get('name'),
            account.get('key'));

    		blobService.download
    	});
    	
    }
});
