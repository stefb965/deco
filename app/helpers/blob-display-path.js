import Ember from 'ember';

/**
 * Compares a path with the current directory
 * @param  {string} path
 * @param  {string} currentDirectory
 * @return {string}
 */
export function blobDisplayPath(path, currentDirectory) {
    return (path === currentDirectory) ? currentDirectory : path.replace(currentDirectory, '');
}

export default Ember.Handlebars.makeBoundHelper(blobDisplayPath);
