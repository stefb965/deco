import {
    moduleFor,
    test
} from 'ember-qunit';

moduleFor('route:application', {
    // Specify the other units that are required for this test.
    // needs: ['controller:foo']
});

test('it exists', function(assert) {
    var route = this.subject();
    assert.ok(route);
});

test('overwrites appInsights if instructed', function (assert) {
    var route = this.subject();
    var ai = {
        trackEvent: function () { return; },
        trackException: function () { return; },
        trackPageView: function () { return; },
        trackTrace: function () { return; },
        trackMetric: function () { return; }
    };

    route.send('disableAppInsights');
    assert.ok(!window.appInsights.config);
});  