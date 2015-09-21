import Ember from "ember";
import { moduleFor, test } from 'ember-qunit';
import combinedStart from 'azureexplorer/tests/helpers/combined-start';

var globals = {
    App: null,
    store: null
};

moduleFor('controller:explorer', {
    // Specify the other units that are required for this test.
    needs: ['controller:application', 'service:notifications', 'service:nodeServices', 'controller:uploaddownload','model:blob', 'model:container'],
    teardown: function () {
        Ember.run(globals.App, globals.App.destroy);
        window.localStorage.clear();
        globals.store = null;
    }
});

test('it should create a container', function (assert) {
    var ctrl = combinedStart(assert, globals, 3, this.subject());
    
    // Test the controller calls the azure create container api.
    // We should see assetts come from the mock node service
    Ember.run(() => ctrl.send('addContainerData'));

    // test the controller calls the azure create container api
    // we should see asserts come from the mock node service
    Ember.run(function () {
        ctrl.set('newContainerName', 'testcontainer');
        ctrl.send('addContainerData');
    });
});

test('it should delete a container', function (assert) {
    var ctrl = combinedStart(assert, globals, 14, this.subject());

    ctrl.set('searchQuery', 'testcontainer');
    Ember.run(() => {
        ctrl.get('containers').then(() => {
            ctrl.set('activeContainer', 'testcontainer');
            ctrl.send('deleteContainerData');
        });
    });
});

test('it should not download any blobs', function (assert) {
    var ctrl = combinedStart(assert, globals, 14, this.subject());

    Ember.run(function () {
        ctrl.store.find('container').then(function (containers) {
            containers.forEach(function (container) {
                container.get('blobs').then(function (blobs) {
                    ctrl.set('blobs', blobs);
                    // no blobs are selected, so none should download
                    ctrl.send('downloadBlobs', './testdir');
                });
            });
        });
    });
});

test('it should search and return 1 container', function (assert) {
    var ctrl = combinedStart(assert, globals, 4, this.subject());

    Ember.run(function () {
        ctrl.set('searchQuery', 'testcontainer2');

        ctrl.get('containers').then((containers) => {
            var count = 0;
            containers.forEach((container) => {
                assert.ok(container.get('name').indexOf('testcontainer2') > -1);
                count++;
            });
            assert.ok(count === 1, 'expected exactly 1 container match');
        });
    });
});

test('it should search and return 0 container', function (assert) {
    var ctrl = combinedStart(assert, globals, 3, this.subject());

    Ember.run(function () {
        ctrl.set('searchQuery', 'nonexistentcontainer');
        ctrl.get('containers').then((containers) => {
            var count = 0;
            containers.forEach((container) => {
                count++;
            });
            assert.ok(count === 0, 'expected exactly 0 container matches');
        });
    });
});

test('it should have the correct subdirectories', function (assert) {
    var ctrl = combinedStart(assert, globals, 13, this.subject());

    ctrl.addObserver('subDirectories', ctrl, () => {
        if (ctrl.get('subDirectories').length === 1 && ctrl.get('subDirectories')[0].name === 'mydir1/') {
            assert.ok(true);
        }
    });

    ctrl.set('searchQuery', 'testcontainer');
    Ember.run(() => {
        ctrl.get('containers').then(() => {
            ctrl.set('activeContainer', 'testcontainer');
        });
    });
});

test('it should reset path segments when switching containers', function (assert) {
    var ctrl = combinedStart(assert, globals, 34, this.subject()),
        sentChangeAction = false,
        sentPathSegmentChangeAction = false;

    ctrl.addObserver('subDirectories', ctrl, () => {
        if (!sentChangeAction) {
            sentChangeAction = true;
            ctrl.send('changeSubDirectory', {
                name: 'mydir1/'
            });
            return;
        }

        // we will receieve this handler multiple times as the
        // ctrl changes state and clears/refills subdirectories
        if (ctrl.get('subDirectories').length === 1 &&
            ctrl.get('subDirectories')[0].name === 'mydir1/mydir2' && sentPathSegmentChangeAction === false) {
            assert.ok(ctrl.get('pathSegments').length === 2);
            sentPathSegmentChangeAction = true;

            // this specifcally tests clicking a button to go up
            ctrl.addObserver('pathSegments', ctrl, () => {
                if (ctrl.get('pathSegments').length === 1 && ctrl.get('pathSegments')[0].name === '/') {
                    assert.ok(true);
                }
            });
            ctrl.send('switchActiveContainer', 'testcontainer2');
            return;
        }
    });

    ctrl.set('searchQuery', 'testcontainer');
    Ember.run(() => {
        ctrl.get('containers').then(() => {
            ctrl.set('activeContainer', 'testcontainer');
        });
    });
});

test('it should change directory based on path segment', function (assert) {
    var ctrl = combinedStart(assert, globals, 34, this.subject()),
        sentChangeAction = false,
        sentPathSegmentChangeAction = false;

    ctrl.addObserver('subDirectories', ctrl, () => {
        if (!sentChangeAction) {
            sentChangeAction = true;
            ctrl.send('changeSubDirectory', {
                name: 'mydir1/'
            });
            return;
        }

        // We will receieve this handler multiple times as the
        // controller changes state and clears/refills subdirectories
        if (ctrl.get('subDirectories').length === 1 &&
            ctrl.get('subDirectories')[0].name === 'mydir1/mydir2' && sentPathSegmentChangeAction === false) {
                assert.ok(true);
                sentPathSegmentChangeAction = true;
                // this specifcally tests clicking a button to go up
                ctrl.send('changeSubDirectory', ctrl.get('pathSegments')[0]);
        }

        if (ctrl.get('subDirectories').length === 1 &&
            ctrl.get('subDirectories')[0].name === 'mydir1/') {
            assert.ok(true);
        }

    });

    ctrl.set('searchQuery', 'testcontainer');
    Ember.run(() => {
        ctrl.get('containers').then(() => {
            ctrl.set('activeContainer', 'testcontainer');
        });
    });
});

test('it should change subdirectories', function (assert) {
    var ctrl = combinedStart(assert, globals, 34, this.subject()),
        sentChangeAction = false,
        sentChangeUpAction = false;

    ctrl.addObserver('subDirectories', ctrl, () => {
        if (!sentChangeAction) {
            // change to subdirectory
            sentChangeAction = true;
            ctrl.send('changeSubDirectory', {
                name: 'mydir1/'
            });
            return;
        }

        // We will receieve this handler multiple times as the
        // controller changes state and clears/refills subdirectories
        if (ctrl.get('subDirectories').length === 1 &&
            ctrl.get('subDirectories')[0].name === 'mydir1/mydir2' && !sentChangeUpAction) {
            assert.ok(true);
            sentChangeUpAction = true;
            ctrl.send('changeSubDirectory', {name: ''});
        }

        if (ctrl.get('subDirectories').length === 1 &&
            ctrl.get('subDirectories')[0].name === 'mydir1/') {
            assert.ok(true);
        }

    });

    ctrl.set('searchQuery', 'testcontainer');
    Ember.run(() => {
        ctrl.get('containers').then(() => {
            ctrl.set('activeContainer', 'testcontainer');
        });
    });
});

test('it should create a subdirectory/folder upon upload', function (assert) {
    var ctrl = combinedStart(assert, globals, 29, this.subject()),
        subDirs;

    ctrl.addObserver('subDirectories', ctrl, () => {
        if (ctrl.get('subDirectories').length === 2) {
            ctrl.get('subDirectories').forEach(subDir => {
                if (subDir.name === 'mydir5/') {
                    assert.ok(true);
                }
            });
        }
    });

    Ember.run(() => {
        ctrl.set('searchQuery', 'testcontainer');
        ctrl.get('containers').then((containers) => {
            containers.forEach((container) => {
                if (container.id === 'testcontainer') {
                    return container.uploadBlob('testpath/file1.jpg', 'mydir5/file1.jpg');
                }
            });
        }).then(() => {
            ctrl.set('activeContainer', 'testcontainer');
            ctrl.send('refreshBlobs');   
        });
    });
});

test('it should delete all but 1 blobs', function (assert) {
    var ctrl = combinedStart(assert, globals, 22, this.subject()),
        initialBlobCount, blobCount = 0, count = 0;

    ctrl.set('searchQuery', 'testcontainer');
    ctrl.addObserver('blobs', ctrl, () => {
        ctrl.get('blobs').then(blobs => {
            initialBlobCount = blobs.get('length');

            blobs.forEach(function (blob) {
                if (count > 2) {
                    return;
                }

                blob.set('selected', true);
                count++;
            });

            // bind to the record array as it changes
            ctrl.addObserver('blobs.@each', ctrl, () => {
                ctrl.get('blobs').then(blobs => {
                    blobCount += 1;
                    if (blobCount === 3) {
                        assert.ok(blobs.get('length') === initialBlobCount - 3);
                    }
                });
            });

            ctrl.send('deleteBlobData');
        });
    });

    Ember.run(() => {
        ctrl.get('containers').then(() => {
            ctrl.set('activeContainer', 'testcontainer');
        });
    });
});

test('it should delete no blobs', function (assert) {
    var ctrl = combinedStart(assert, globals, 13, this.subject()),
        initialBlobCount;

    ctrl.set('searchQuery', 'testcontainer');
    ctrl.addObserver('blobs', ctrl, () => {
        ctrl.get('blobs').then(blobs => {
            initialBlobCount = blobs.get('length');
            ctrl.send('deleteBlobData');
            return ctrl.get('blobs');
        }).then(blobs => {
            assert.ok(blobs.get('length') === initialBlobCount);
        });
    });

    Ember.run(() => {
        ctrl.get('containers').then(() => {
            ctrl.set('activeContainer', 'testcontainer');
        });
    });
});

test('it should copy a selected blob from one container to another', function (assert) {
    var ctrl = combinedStart(assert, globals, 19, this.subject()),
        uri = '';

    ctrl.set('searchQuery', 'testcontainer');
    ctrl.set('modalCopyDestinationPath', 'testcontainer3');

    ctrl.addObserver('blobs', ctrl, () => {
        ctrl.get('blobs')
            .then(blobs => {
                var count = 0;
                blobs.forEach(function (blob) {
                    if (count > 0) {
                        return;
                    }
                    blob.set('selected', true);
                    count++;
                    blob.getLink().then(result => {
                        uri = result.url;
                        
                        ctrl.get('containers').then((containers) => {
                            containers.forEach((container) => {
                                if (container.id === 'testcontainer') {
                                    container.copyBlob(uri, 'testcontainer3', 'test-blob-1.mp4');
                                }
                            });
                        });
                    });
                });
            });
        });

    Ember.run(() => {
        ctrl.get('containers').then(() => {
            ctrl.set('activeContainer', 'testcontainer');
        });
    });
    
});