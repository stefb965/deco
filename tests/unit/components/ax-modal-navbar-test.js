import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('ax-modal-navbar', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
  unit: true
});
test('it exists', function(assert) {
  var component = this.subject();

  component.set('tab1', 'TestTab1');
  component.set('tab2', 'TestTab2');
  component.set('tab3', 'TestTab3');

  assert.equal(component.get('tabsArray')[0].name, 'TestTab1');
  assert.equal(component.get('tabsArray')[0].action, 'actionTestTab1');
  assert.equal(component.get('tabsArray')[1].name, 'TestTab2');
  assert.equal(component.get('tabsArray')[1].action, 'actionTestTab2');
  assert.equal(component.get('tabsArray')[2].name, 'TestTab3');
  assert.equal(component.get('tabsArray')[2].action, 'actionTestTab3');
});
