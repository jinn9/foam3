/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.so.test',
  name: 'SystemOutageSystemNotificationThemeTest',
  extends: 'foam.nanos.test.Test',

  documentation: '',

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.so.*',
    'foam.nanos.theme.Theme'
  ],

  methods: [
    {
      name: 'setup',
      args: 'X x',
      javaCode: `
      `
    },
    {
      name: 'runTest',
      javaCode: `
    setup(x);

    try {
      DAO seDAO = (DAO) x.get("systemOutageDAO");

      SystemOutage se = new SystemOutage(x);
      se.setName(this.getClass().getSimpleName());
      se.setEnabled(true);
      se.setActive(true);
      SystemNotificationTask task = new SystemNotificationTask();
      SystemNotification note = new SystemNotification();
      task.setSystemNotification(note);
      task.setThemes(new String[] {"foam"});
      se.setTasks(new SystemNotificationTask[] {task});
      se = (SystemOutage) seDAO.put(se).fclone();

      SystemNotificationService service = (SystemNotificationService) x.get("systemNotificationService");

      SystemNotification[] notes = service.getSystemNotifications(x, null);

      test ( notes == null || notes.length == 0, "SystemNotification (x) not found");

      X y = x.put("theme", new Theme.Builder(x).setId("foam").build());
      notes = service.getSystemNotifications(y, null);

      test ( notes.length == 1, "SystemNotification (theme) found");

      task = new SystemNotificationTask();
      note = new SystemNotification();
      note.setKey("test");
      task.setSystemNotification(note);
      se.setTasks(new SystemNotificationTask[] {task});
      se = (SystemOutage) seDAO.put(se);

      notes = service.getSystemNotifications(y, "test");
      test ( notes.length == 1 && notes[0].getKey().equals("test"), "SystemNotification (key) found");
    } finally {
      teardown(x);
    }
      `
    },
    {
      name: 'teardown',
      args: 'X x',
      javaCode: `
      `
    },
  ]
})