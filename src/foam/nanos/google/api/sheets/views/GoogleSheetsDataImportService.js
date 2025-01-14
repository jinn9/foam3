/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.INTERFACE({
  package: 'foam.nanos.google.api.sheets.views',
  name: 'GoogleSheetsDataImportService',

  skeleton: true,

  methods: [
    {
      name: 'getColumns',
      javaType: 'String[]',
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'importConfig',
          type: 'foam.nanos.google.api.sheets.views.GoogleSheetsImportConfig'
        }
      ]
    },
    {
      name: 'importData',
      type: 'foam.nanos.google.api.sheets.views.ImportDataMessage',
      async: true,
      args: [
        {
          name: 'x',
          type: 'Context',
        },
        {
          name: 'importConfig',
          type: 'foam.nanos.google.api.sheets.views.GoogleSheetsImportConfig'
        }
      ]
    }
  ]
});
