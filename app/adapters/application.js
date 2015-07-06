import App from '../app';
import DS from 'ember-data';

App.ApplicationSerializer = DS.LSSerializer.extend();

/**
 * LocalStorage Adapter, allowing us to use LocalStorage with Ember-Data
 */
export default DS.LSAdapter.extend({
    namespace: 'azureexplorer'
});
