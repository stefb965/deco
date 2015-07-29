import { moduleFor, test } from 'ember-qunit';

moduleFor('view:modal-navbar', 'Unit | View | modal navbar');

// Replace this with your real tests.
test('it exists', function(assert) {
  var view = this.subject();

  view.set('tab1', 'TestTab1');
  view.set('tab2', 'TestTab2');
  view.set('tab3', 'TestTab3');

  assert.equal(view.get('tabsArray')[0].name, 'TestTab1');
  assert.equal(view.get('tabsArray')[0].action, 'actionTestTab1');
  assert.equal(view.get('tabsArray')[1].name, 'TestTab2');
  assert.equal(view.get('tabsArray')[1].action, 'actionTestTab2');
  assert.equal(view.get('tabsArray')[2].name, 'TestTab3');
  assert.equal(view.get('tabsArray')[2].action, 'actionTestTab3');
});
