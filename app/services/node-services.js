import Ember from 'ember';

var azureStorage = null,
    fs = null,
    path = null;

/**
 * Check if running in nw, if not, we're probably running as a test,
 * in which case this entire service will be mocked
 */
if (window.requireNode) {
    azureStorage = window.requireNode('azure-storage');
    fs = window.requireNode('fs');
    path = window.requireNode('path');
}

/**
 * Allow the injection of Node Modules as Ember Services
 */
export default Ember.Service.extend({
    azureStorage: azureStorage,
    fs: fs,
    path: path
});
