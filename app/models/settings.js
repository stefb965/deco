import StorageObject from 'ember-local-storage/local/object';

export default StorageObject.extend({
    storageKey: 'azure-storage-explorer-settings',
    initialContent: {
        firstUse: true, // Is this the first use of the app?
        allowUsageStatistics: true // Can we collect anonymized usage statistics?
    }
});
