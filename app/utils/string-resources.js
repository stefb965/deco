/**
 * A helper module for displaying messages with the intent of keeping application logic
 * and localizable strings separate.
 */
export default {
    downloadMessage: function (blobName, speed, progress) {
        var message = 'Downloading Blob ' + blobName + ' ';

        if (speed) {
            message += speed += ' ';
        }

        if (progress) {
            message += progress + '%';
        }

        return message;
    },
    uploadMessage: function (filePath, azurePath, speed, progress) {
        var message = 'Uploading file ' + filePath + ' to ' + azurePath + ' ';

        if (speed) {
            message += speed += ' ';
        }

        if (progress) {
            message += progress + '%';
        }

        return message;
    },
    deleteBlobMessage: function (blobName) {
        return 'Deleting Blob ' + blobName;
    },
    addContainerMessage: function (containerName) {
        return 'Adding Container ' + containerName;
    },
    deleteContainerMessage: function (containerName) {
        return 'Deleting Container ' + containerName;
    },
    updateBlobPropsMessage: function (blobName) {
        return 'Updating Blob Properties for ' + blobName;
    }
};
