/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'ReadOnlyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'DAO decorator that throws errors on put and remove.',

  methods: [
    {
      name: 'put_',
      javaCode: `throw new UnsupportedOperationException("Cannot put into ReadOnlyDAO");`,
      swiftCode: `throw FoamError("Cannot put into ReadOnlyDAO")`,
      code: function put_(x, obj) {
        return Promise.reject('Cannot put into ReadOnlyDAO');
      }
    },
    {
      name: 'remove_',
      javaCode: `throw new UnsupportedOperationException("Cannot remove from ReadOnlyDAO");`,
      swiftCode: `throw FoamError("Cannot remove from ReadOnlyDAO")`,
      code: function remove_(x, obj) {
        return Promise.reject('Cannot remove from ReadOnlyDAO');
      }
    },
    {
      name: 'removeAll_',
      javaCode: `throw new UnsupportedOperationException("Cannot removeAll from ReadOnlyDAO");`,
      swiftCode: `throw FoamError("Cannot removeAll from ReadOnlyDAO")`,
      code: function removeAll() {
        return Promise.reject('Cannot removeAll from ReadOnlyDAO');
      }
    },
    {
      name: 'cmd_',
      javaCode: `
        if ( obj instanceof String && ((String) obj).startsWith("CLASS? ") )
          return super.cmd_(x, obj);

        if ( "AUTHORIZER?".equals(obj) )
          return getDelegate().cmd_(x, obj);

        return null;
      `,
      swiftCode: `throw FoamError("Cannot cmd from ReadOnlyDAO")`, // TODO: NOP
      code: function cmd_() { return Promise.resolve(undefined); }
    }
  ]
});
