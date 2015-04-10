import DS from 'ember-data';
import accountUtil from '../utilities/account';

var Container = DS.Model.extend({
    nodeServices: Ember.inject.service(),

    blobs: function () {
        return this.store.find('blob', {
            container: this,
            container_id: this.get('name')
        });
    }.property().volatile(),

    name: DS.attr('string', {
        defaultValue: ''
    }),
    lastModified: DS.attr('date', {
        defaultValue: ''
    }),
    publicAccessLevel: ('string', {
        defaultValue: null
    }),

    uploadBlob: function (path) {
        var container = this.get('name'),
            self = this,
            service, fileName;

        return new Ember.RSVP.Promise(function (resolve, reject) {
            accountUtil.getActiveAccount(self.store).then(function (account) {
                service = self.get('azureStorage').createBlobService(account.get('name'), account.get('key'));
                fileName = path.replace(/^.*[\\\/]/, '');
                
                service.createBlockBlobFromLocalFile(container, fileName, path, function (err, result, response) {
                    if (!err) {
                        return resolve(response);
                    } else {
                        return reject(err);
                    }
                });
            });
        });
    },

    azureStorage: Ember.computed.alias('nodeServices.azureStorage')
});

export default Container;
