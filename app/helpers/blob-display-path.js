import Ember from 'ember';

export function blobDisplayPath(path, currentDirectory) {
    return (path === currentDirectory) ? currentDirectory : path.replace(currentDirectory, '');
}

export default Ember.Handlebars.makeBoundHelper(blobDisplayPath);
