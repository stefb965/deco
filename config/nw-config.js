module.exports = {
    appName: 'azure-storage-explorer',
    platforms: ['osx64'],
    buildType: function () {
        return this.appVersion;
    }
};