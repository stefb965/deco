import Ember from 'ember';
import Notification from '../models/notification';
import config from '../config/environment';
import stringResources from '../utils/string-resources';

export default Ember.Controller.extend({
    needs: ['notifications', 'explorer'],
    notifications: Ember.computed.alias('controllers.notifications'),
    explorer: Ember.computed.alias('controllers.explorer'),
    nodeServices: Ember.inject.service(),

    /**
     * Ensures that a subdirectory structure exists (sync)
     * @param  {string} file - /tmp/this/path/does/not/exist.jpg
     */
    ensureDir: function (file) {
        var fse = window.requireNode('fs-extra');
        var path = window.requireNode('path');

        if (fse && file) {
            let dir = path.dirname(file);
            return fse.ensureDirSync(dir);
        }

        return false;
    },

    actions: {
        /**
        * Upload one or multiple files to blobs
        * @param  {Array} filePaths  - Local file paths of the files to upload
        * @param  {string} azurePath - Remote Azure Storage path
        */
        uploadBlobData: function (filePaths, azurePath, activeContainer) {
            var containerPath = azurePath.replace(/.*\:\//, ''),
                paths = filePaths.split(';'), promises = [];

            this.store.find('container', activeContainer).then(foundContainer => {
                paths.forEach(path => {
                    var fileName = path.replace(/^.*[\\\/]/, ''),
                        uploadNotification, speedSummary, uploadPromise, progressUpdateInterval;

                    var promise = foundContainer.uploadBlob(path, containerPath + fileName).then(result => {
                        speedSummary = result.speedSummary.summary;
                        uploadPromise = result.promise;

                        progressUpdateInterval = setInterval(() => {
                            if (speedSummary) {
                                // don't report a dead speed. this api reports a speed of 0 for small blobs
                                var speed = speedSummary.getSpeed() === '0B/S' ? '' : speedSummary.getSpeed();

                                uploadNotification.set('progress', speedSummary.getCompletePercent());
                                uploadNotification.set('text', stringResources.uploadMessage(fileName, azurePath, speed, speedSummary.getCompletePercent()));
                            }
                        }, 200);

                        uploadNotification = Notification.create({
                            type: 'Upload',
                            text: stringResources.uploadMessage(fileName, azurePath),
                            cleanup: function () {
                                clearInterval(this.get('customData').progressUpdateInterval);
                            },
                            customData: {
                                progressUpdateInterval: progressUpdateInterval
                            }
                        });

                        this.get('notifications').addPromiseNotification(result.promise, uploadNotification);
                        return uploadPromise;
                    });

                    promises.push(promise);
                });

                appInsights.trackEvent('uploadBlobData');
                appInsights.trackMetric('uploadBlobs', paths.length);

                return Ember.RSVP.all(promises);
            }).then(() => {
                if (config.environment !== 'test') {
                    this.get('explorer').send('refreshBlobs');
                }
            });
        },

        /**
         * Takes an array of blobs and streams them to a target directory
         * @param  {array} blobs        - Blobs to download
         * @param  {string} directory   - Local directory to save them to
         * @param  {boolean} saveAs     - Is the target a directory or a filename (saveAs)?
         */
        streamBlobsToDirectory: function (blobs, directory, saveAs) {
            blobs.forEach(blob => {
                var targetPath = (saveAs) ? directory : directory + '/' + blob.get('name'),
                    downloadPromise = {isFulfilled : false},
                    downloadNotification, speedSummary, progressUpdateInterval;

                this.ensureDir(targetPath);

                blob.toFile(targetPath).then(result => {
                    speedSummary = result.speedSummary.summary;
                    downloadPromise = result.promise;

                    progressUpdateInterval = setInterval(() => {
                        if (speedSummary) {
                            // Don't report a dead speed. This api reports a speed of 0 for small blobs
                            var speed = speedSummary.getSpeed() === '0B/S' ? '' : speedSummary.getSpeed();
                            downloadNotification.set('progress', speedSummary.getCompletePercent());
                            downloadNotification.set('text', stringResources.downloadMessage(blob.get('name'), speed, speedSummary.getCompletePercent()));
                        }
                    }, 200);

                    downloadNotification = Notification.create({
                        type: 'Download',
                        text: stringResources.downloadMessage(blob.get('name')),
                        cleanup: function () {
                            clearInterval(this.get('customData').progressUpdateInterval);
                        },
                        customData: {
                            progressUpdateInterval: progressUpdateInterval
                        }
                    });

                    this.get('notifications').addPromiseNotification(downloadPromise, downloadNotification);
                    return downloadPromise;
                });
            });
        }
    }
});
