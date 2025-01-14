/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.agents',
  name: 'ConfigureFlowAgent',
  implements: [ 'foam.core.ContextAgent' ],

  documentation: `
    Exports pushView and popView, either delegates to the stack or creates
    popups depending on the configuration. Additionally, exports an FObject for
    wizardlet property subscriptions to detach on.
  `,

  imports: [
    'stack'
  ],

  exports: [
    'pushView',
    'popView',
    'wizardCloseSub',
    'popupMode',
    'flowAgent',
    'wizardController',
    'as wizardFlow'
  ],

  topics: ['flowAgent'],

  requires: [
    'foam.u2.dialog.Popup'
  ],

  properties: [
    {
      class: 'FObjectProperty',
      name: 'wizardCloseSub',
      of: 'foam.core.FObject',
      factory: function() {
        return foam.core.FObject.create();
      }
    },
    {
      name: 'popupMode',
      class: 'Boolean',
      value: true
    },
    {
      name: 'ensureHash',
      documentation: `
        Sets the url hash on subsequent stack pushes.
      `,
      class: 'String'
    },
    {
      name: 'pushView',
      class: 'Function',
      deprecated: true,
      documentation: 'use stack directly instead',
      expression: function () {
        var self = this;
        return this.popupMode
          ? function (viewSpec, onClose) {
            ctrl.add(
              self.Popup.create({
                closeable: viewSpec.closeable ? viewSpec.closeable : false,
                ...(onClose ? { onClose: onClose } : {}),
              })
                .tag(viewSpec)
            )
          }
          : function (viewSpec) {
            self.stack.push(viewSpec, self);
            if ( self.ensureHash ) {
              location.hash = self.ensureHash;
            }
          }
          ;
      }
    },
    {
      name: 'popView',
      deprecated: true,
      documentation: 'use stack directly instead',
      class: 'Function',
      expression: function () {
        var self = this;
        return this.popupMode
          ? function (x) {
            x.closeDialog();
          }
          : function (x) {
            self.stack.back();
          }
          ;
      }
    },
    'wizardController'
  ],

  methods: [
    async function execute () {}
  ]
});
