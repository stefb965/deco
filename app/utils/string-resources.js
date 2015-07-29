/**
 * A helper module for displaying messages with the intent of keeping application logic
 * and localizable strings separate.
 */

function prettyProgressMessage(message, speed, progress) {
    message += (speed) ? message += speed += ' ' : message;
    message += (progress) ? progress + '%' : message;

    return message;
}

export default {
    downloadMessage: function (blobName, speed, progress) {
        return prettyProgressMessage('Downloading Blob ' + blobName + ' ', speed, progress);
    },
    uploadMessage: function (filePath, azurePath, speed, progress) {
        return prettyProgressMessage('Uploading file ' + filePath + ' to ' + azurePath + ' ', speed, progress);
    },
    copyMessage: function (fileName, azurePath, speed, progress) {
        return prettyProgressMessage('Copying file ' + fileName + ' to ' + azurePath + ' ', speed, progress);
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
