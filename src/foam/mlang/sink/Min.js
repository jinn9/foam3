/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.sink',
  name: 'Min',
  extends: 'foam.mlang.sink.AbstractUnarySink',

  documentation: 'A Sink which remembers the minimum value put().',

  properties: [
    {
      class: 'Object',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'put',
      code: function put(obj, s) {
        if ( ! this.hasOwnProperty('value') || foam.util.compare(this.value, this.arg1.f(obj) ) > 0) {
          this.value = this.arg1.f(obj);
        }
      },
      javaCode: `if ( getValue() == null || ((Comparable)getArg1().f(obj)).compareTo(getValue()) < 0 ) {
  setValue(getArg1().f(obj));
}`
    }
  ]
});