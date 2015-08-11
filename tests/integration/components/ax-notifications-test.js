import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ax-notifications', 'Integration | Component | ax notifications', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(1);

  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{ax-notifications}}`);

  // Template block usage:
  this.render(hbs`
    {{#ax-notifications}}
      template block text
    {{/ax-notifications}}
  `);

  assert.equal(this.$('.pullout').length === 1, true);
});
