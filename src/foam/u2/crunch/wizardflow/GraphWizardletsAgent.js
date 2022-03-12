/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'GraphWizardletsAgent',
  implements: [ 'foam.core.ContextAgent' ],

  imports: [
    'capabilities',
    'capabilityGraph',
    'getWAO'
  ],

  exports: [
    'wizardlets'
  ],

  requires: [
    'foam.graph.GraphTraverser',
    'foam.graph.TraversalOrder',
    'foam.nanos.crunch.ui.LiftingAwareWizardlet',
    'foam.nanos.crunch.ui.PrerequisiteAwareWizardlet',
    'foam.u2.wizard.ProxyWAO'
  ],

  properties: [
    {
      name: 'wizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.Wizardlet'
    },
    {
      class: 'Map',
      name: 'capabilityWizardletsMap'
    }
  ],

  methods: [
    async function execute() {
      this.createWizardlets();
    },
    function createWizardlets() {
      // Step 1: Traverse capability graph to create wizardlets
      const traverser = this.GraphTraverser.create({
        graph: this.capabilityGraph,
        order: this.TraversalOrder.POST_ORDER
      });
      traverser.sub('process', (_1, _2, { parent, current }) => {
        const createdHere = this.createWizardletsForCapability(current);
        const entry = this.capabilityWizardletsMap[current.id];
        if ( parent && this.capabilityWizardletsMap[parent.id] ) {
          const parentEntry = this.capabilityWizardletsMap[parent.id];
          this.linkPrerequisite(parentEntry, entry, {
            lifted: ! createdHere
          });
        }
      });
      traverser.traverse();

      // Step 2: Iterate over wizardlet information in capabilityWizardletsMap
      //         to create the final ordered list of wizardlets
      const wizardlets = [];
      const rootNode = this.capabilityGraph.roots[0];
      const pushWizardlets = (entry) => {
        if ( entry.beforeWizardlet ) wizardlets.push(entry.beforeWizardlet);
        for ( const subEntry of entry.betweenWizardlets ) {
          pushWizardlets(subEntry);
        }
        if ( entry.afterWizardlet ) wizardlets.push(entry.afterWizardlet);
      };
      pushWizardlets(this.capabilityWizardletsMap[rootNode.id]);
      this.wizardlets = wizardlets;
    },
    function createWizardletsForCapability(current) {
      const capability = current.data;

      if ( this.capabilityWizardletsMap[capability.id] ) {
        return false;
      }

      const afterWizardlet = this.adaptWizardlet(
        { capability }, capability.wizardlet);
      const beforeWizardlet = this.adaptWizardlet(
        { capability }, capability.beforeWizardlet);
    
      this.capabilityWizardletsMap[capability.id] = {
        primaryWizardlet: afterWizardlet || beforeWizardlet,
        wizardlets: [beforeWizardlet, afterWizardlet].filter(v => v),
        beforeWizardlet, afterWizardlet,
        betweenWizardlets: [],
        liftedWizardlets: []
      };

      if ( beforeWizardlet && afterWizardlet ) {
        beforeWizardlet.isAvailable$.follow(afterWizardlet.isAvailable$);
        afterWizardlet.data$ = beforeWizardlet.data$;
      }

      return true;
    },
    function linkPrerequisite(source, entry, { lifted }) {
      ( lifted
        ? source.liftedWizardlets
        : source.betweenWizardlets ).push(entry);
      for ( let parentWizardlet of source.wizardlets ) {
        if ( this.isPrerequisiteAware(parentWizardlet) ) {
          parentWizardlet.addPrerequisite(entry.primaryWizardlet, { lifted });
        }
        parentWizardlet.prerequisiteWizardlets.push(entry.primaryWizardlet);
      }
      const parentControlsAvailability =
        this.isPrerequisiteAware(source.beforeWizardlet) ||
        this.isPrerequisiteAware(source.afterWizardlet);
      if ( ! lifted && ! parentControlsAvailability ) {
        entry.primaryWizardlet.isAvailable$.follow(
          source.primaryWizardlet.isAvailable$);
      }
    },
    function adaptWizardlet({ capability }, wizardlet) {
      if ( ! wizardlet ) return null;
      wizardlet = wizardlet.clone(this.__subContext__);

      wizardlet.copyFrom({ capability: capability });

      var wao = wizardlet.wao;
      while ( this.ProxyWAO.isInstance(wao) ) {
        // If there's already something at the end, don't replace it
        if ( wao.delegate && ! this.ProxyWAO.isInstance(wao.delegate) ) break;
        if ( ! wao.delegate ) {
          wao.delegate = this.getWAO();
        }
      }

      return wizardlet;
    },
    function isPrerequisiteAware(wizardlet) {
      return this.PrerequisiteAwareWizardlet.isInstance(wizardlet);
    },
    function isLiftingAware(wizardlet) {
      return this.LiftingAwareWizardlet.isInstance(wizardlet);
    }
  ]
});