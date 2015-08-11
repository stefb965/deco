import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ax-container-properties', 'Integration | Component | ax container properties', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{ax-container-properties}}`);

  assert.equal(this.$().text().trim().toLowerCase().indexOf('container details') > -1,
    true, 'expected container properties component to render template');
});
