import { run } from '@ember/runloop';
import { describe, it } from 'mocha';

describe('Integration | Component | app-components/from-email', function() {
  
  hooks.beforeEach(function() {
    this.store = this.owner.lookup('service:store');
    run(() => {
      this.get('store').createRecord('contact', contact); // comments
    });
    let a = 1;
    run(() => {
      this.get('store').createRecord('ticket', ticket);
      this.get('store').createRecord('agent', agent);
    });
  });

  it('should add run loop', function() {
    run(() => {
      get(this, 'store').findAll('tickets');
    });
    server.createList('email-config', 20);
    server.create('email-config', { name: 'Test', reply_email: 'test@gmail.com' });
    run(() => {
      get(this, 'store').pushPayload('contact', { contact: userContact.attrs });
      get(this, 'store').findAll('agents');
    });
  });

  it('should ignore existing run loop', async function() {
    server.createList('email-config', 101);
    server.create('email-config', { name: 'Test', reply_email: 'test@gmail.com' });

    await run(() => {
      this.get('store').pushPayload('agent', agents);
    });
  });

});
