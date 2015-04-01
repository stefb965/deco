import DS from 'ember-data';
import accountUtil from '../utilities/account';

function startWriteToStream(model, stream) {
    accountUtil.getActiveAccount(model.store).then(function (account) {
        var azureStorage = window.requireNode('azure-storage');
        var blobService = azureStorage.createBlobService(account.
            get('name'),
            account.get('key'));

        blobService.getBlobToStream(model.get('container_id'), model.get('name'), stream, function (err) {
            if (err) {
                Ember.Logger.error('Error getting blob to stream:');
                Ember.Logger.error(err);
            }
        });
    });
}
export default DS.Model.extend({
    container: DS.belongsTo('container', {
        async: true
    }),
    name: DS.attr('string'),
    size: DS.attr('number'),
    lastModified: DS.attr('date'),
    container_id: DS.attr('string'),
    type: DS.attr('string'),
    // returns a memory stream of the blob
    toStream: function () {
        var MemoryStream = window.requireNode('memorystream');
        var memStream = new MemoryStream([]);

        // begin writing to stream
        startWriteToStream(this, memStream);

        return memStream;
    },
    // returns stream to blob path
    toFile: function (path) {
        var fs = window.requireNode('fs');
        var fileStream = fs.createWriteStream(path);

        // begin writing to stream
        startWriteToStream(this, fileStream);

        return fileStream;
    }
});
