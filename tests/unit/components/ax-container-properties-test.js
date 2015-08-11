import {
  moduleForComponent,
  test
} from 'ember-qunit';

import Ember from "ember";
import combinedStart from 'azureexplorer/tests/helpers/combined-start';

var globals = {
    App: null,
    store: null
};

moduleForComponent('ax-container-properties', {
    needs: ['util:filesize', 'model:container', 'model:blob', 'service:notifications'],
    teardown: function () {
        Ember.run(globals.App, globals.App.destroy);
        window.localStorage.clear();
        globals.store = null;
    },
    unit: true
});

function getContainer() {
    return globals.store.find('container').then(function (containers) {
        return containers.get('firstObject');
    });
}

test('it shows properties', function (assert) {
    combinedStart(assert, globals);

    Ember.run(() => {
        getContainer().then(container => {
            let comp = this.subject({containerRecord: container});
            assert.ok(comp.get('containerRecord'), 'expected containerRecord to exist');
            assert.ok(comp.get('containerRecord').get('lastModified'));
            assert.ok(comp.get('containerRecord').get('etag'));
            assert.ok(comp.containerRecord.get('name'));
            assert.ok(comp.containerRecord.get('leaseStatus'));
            assert.ok(comp.containerRecord.get('leaseState'));
        });
    });
});

test('it sets container ACL', function (assert) {
    combinedStart(assert, globals);

    Ember.run(() => {
        getContainer().then(container => {
            let comp = this.subject({containerRecord: container}),
                firstObserve = true;
            comp.addObserver('selectedAccessType', () => {
                Ember.Logger.debug('observer hit');
                if (firstObserve) {
                    firstObserve = false;
                    assert.equal(comp.get('selectedAccessType'), 'BLOB');
                    comp.send('setAccessControlLevel', 'CONTAINER');
                }
                else {
                    assert.equal(comp.get('selectedAccessType'), 'CONTAINER');
                }

            });

            comp.send('actionAccessControlLevel');
        });
    });
});