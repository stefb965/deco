import Ember from 'ember';
import windowMenu from '../utils/window-menu';

/**
 * Ember Explorer Route
 */
export default Ember.Route.extend({
    /**
     * Get all containers for the current account, set them as model
     */
    model: function () {
        return this.store.find('container');
    },

    /**
     * AfterModel: Track PageView
     */
    afterModel: function () {
        appInsights.trackPageView('Explorer');
    },

    setupController: function (controller, model) {
        this._super(controller, model);

        var handlers = {
            uploadBlob: () => { controller.send('uploadBlob'); },
            downloadBlobs: () => { controller.send('downloadBlobs'); },
            deleteBlobs: () => { controller.send('deleteBlobs'); },
            refreshBlobs: () => { controller.send('refreshBlobs'); },
            addContainer: () => { controller.send('openModal', '#modal-addcontainer'); },
            removeContainer: () => { controller.send('openModal', '#modal-deletecontainer'); },
            switchAccount: () => { controller.send('goHome'); }
        };

        windowMenu.setup(handlers);
    },

    /**
     * Housekeeping on transitions
     */
    willTransition: function () {
        this.controller.notifyPropertyChange('searchQuery');
        this.controller.notifyPropertyChange('pathSegments');
    },

    /**
     * Reset the whole controller when we leave the route
     * @param  {Ember.Controller}  controller
     * @param  {Boolean} isExiting
     */
    resetController: function (controller, isExiting) {
        if (isExiting) {
            // Reset the whole explorer controller on exit
            controller.set('model', null);
            controller.set('blobs', []);
            controller.set('subDirectories', []);
            controller.set('pathSegments', [{name: '/'}]);
            controller.set('allBlobSelected', false);
            controller.set('newContainerEntryDisplay', false);
            controller.set('modalFileUploadPath', '');
            controller.set('modalDefaultUploadPath', '');
            controller.set('searchSpinnerDisplay', false);
            controller.set('newContainerName', '');
            controller.set('searchQuery', '');
            controller.set('blobsLoading', true);
            controller.set('selectedBlob', null);

            this.store.unloadAll('container');

            Ember.run.next(() => {
                controller.set('activeContainer', null);
                windowMenu.setup(false);
            });
        }
    },

    actions: {
        /**
         * Refresh the current model
         */
        refresh: function () {
            return this.refresh();
        },

        /**
         * Opens a specified modal
         * @param  {string} modal jQuery identifier
         */
        openModal: function (modal, dismissible=true) {
            Ember.$(modal).openModal({
                dismissible: dismissible
            });

            // Ugh: https://github.com/Dogfalo/materialize/issues/1532
            var overlay = Ember.$('.lean-overlay');
            overlay.detach();
            Ember.$('.explorer-container').after(overlay);
        },

        goHome: function () {
            this.transitionTo('welcome');
        }
    }
});
