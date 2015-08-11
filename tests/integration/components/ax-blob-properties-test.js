import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ax-blob-properties', 'Integration | Component | ax blob properties', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{ax-blob-properties}}`);

  // Template block usage:
  this.render(hbs`
    {{#ax-blob-properties}}
      template block text
    {{/ax-blob-properties}}
  `);

  assert.equal(this.$().text().trim().toLowerCase().indexOf('blob details') > -1, true);
});
