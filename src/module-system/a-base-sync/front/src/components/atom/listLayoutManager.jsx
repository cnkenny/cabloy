import ebAtomClasses from '../../common/atomClasses.js';
import ebAtomOrders from '../../common/atomOrders.js';
export default {
  meta: {
    global: false,
  },
  mixins: [ ebAtomClasses, ebAtomOrders ],
  props: {
    // default/select/selecting
    scene: {
      type: String,
    },
    options: {
      type: String,
    },
    layout: {
      type: String,
    },
    atomClass: {
      type: Object,
    },
    params: {
      type: Object,
    },
  },
  data() {
    return {
      ready: false,
      layout2: null,
      layoutConfig: null,
      filter: null,
      filterOptions: null,
      atomOrderSelected: null,
      selectedAtomIds: null,
      selectedAtoms: null,
    };
  },
  computed: {
    layoutComponentInstance() {
      return this.$refs.layout && this.$refs.layout.getComponentInstance();
    },
    userLabels() {
      return this.$local.getters('userLabels');
    },
    popoverOrdersReady() {
      return !!this.ordersAll;
    },
    atomOrders() {
      if (!this.ordersAll) return null;
      // base
      const ordersBase = this.getOrdersOfBase();
      // atomClass
      const ordersAtomClass = this.atomClass ? this.getOrdersOfAtomClass(this.atomClass) : null;
      // atomOrders
      return ordersAtomClass ? ordersBase.concat(ordersAtomClass) : ordersBase;
    },
    atomOrderDefault() {
      let atomOrder;
      if (this.scene === 'select') {
        atomOrder = {
          name: 'atomName',
          by: 'asc',
          tableAlias: 'a',
        };
      } else {
        // others
        atomOrder = {
          name: 'updatedAt',
          by: 'desc',
          tableAlias: 'a',
        };
      }
      // ok
      return atomOrder;
    },
  },
  created() {
    //
    this.$local.dispatch('getLabels');
    //
    this.layout2 = this.layout || this.getLayout();
    //
    this.getLayoutConfig().then(res => {
      this.layoutConfig = res;
      this.ready = true;
    });
  },
  methods: {
    onPageRefresh() {
      this.layoutComponentInstance && this.layoutComponentInstance.onPageRefresh();
    },
    onPageInfinite() {
      this.layoutComponentInstance && this.layoutComponentInstance.onPageInfinite();
    },
    onPerformFilter() {

    },
    onPerformAtomOrders(element) {
      const popover = this.$refs.popoverAtomOrders.$el;
      this.$f7.popover.open(popover, element);
    },
    onPerformChangeAtomOrder(event, atomOrder) {
      // switch
      const atomOrderCurrent = this.atomOrderSelected || this.atomOrderDefault;
      if (this._getAtomOrderKey(atomOrderCurrent) === this._getAtomOrderKey(atomOrder)) {
        this.atomOrderSelected = {
          name: atomOrderCurrent.name,
          tableAlias: atomOrderCurrent.tableAlias,
          by: atomOrderCurrent.by === 'desc' ? 'asc' : 'desc',
        };
      } else {
        this.atomOrderSelected = atomOrder;
      }
      // reload
      this.onPageRefresh();
    },
    getLayout() {
      return this.$view.size === 'small' ? 'list' : 'table';
    },
    prepareSelectOptions() {
      // options
      let options;
      if (this.scene === 'select') {
        // where
        const where = {};
        if (!this.selectedAtomIds) {
          this.selectedAtomIds = this.params.selectedAtomIds || [];
        }
        where['a.id'] = this.selectedAtomIds.length > 0 ? this.selectedAtomIds : null;
        // options
        options = {
          where,
        };
      } else {
        // default
        options = {
          where: { },
        };
      }
      // order
      const atomOrderCurrent = this.atomOrderSelected || this.atomOrderDefault;
      options.orders = [
        [ this._getAtomOrderKey(atomOrderCurrent), atomOrderCurrent.by ],
      ];
      // extend 1
      if (this.options) {
        options = this.$utils.extend({}, options, this.options);
      }
      // extend 2
      if (this.filterOptions) {
        options = this.$utils.extend({}, options, this.filterOptions);
      }
      // options
      return options;
    },
    prepareSelectParams() {
      const options = this.prepareSelectOptions();
      return {
        atomClass: this.atomClass,
        options,
      };
    },
    _getAtomOrderKey(atomOrder) {
      return atomOrder ? `${atomOrder.tableAlias}.${atomOrder.name}` : null;
    },
    _getAtomOrderStatus(atomOrder) {
      const atomOrderCurrent = this.atomOrderSelected || this.atomOrderDefault;
      if (this._getAtomOrderKey(atomOrderCurrent) === this._getAtomOrderKey(atomOrder)) {
        return atomOrderCurrent.by === 'desc' ? 'arrow_drop_down' : 'arrow_drop_up';
      }
      return '';
    },
    async getLayoutConfig() {
      const layoutConfig = this.$config.atom.render.list.layout[this.layout2];
      let layoutConfigAtom;
      if (this.atomClass) {
        // load module
        await this.$meta.module.use(this.atomClass.module);
        // config
        const configAtom = this.$meta.config.modules[this.atomClass.module];
        layoutConfigAtom = configAtom && configAtom.atoms && configAtom.atoms[this.atomClass.atomClassName];
        layoutConfigAtom = layoutConfigAtom && layoutConfigAtom.render && layoutConfigAtom.render.list && layoutConfigAtom.render.list.layout;
        layoutConfigAtom = layoutConfigAtom && layoutConfigAtom[this.layout2];
      }
      return this.$meta.util.extend({}, layoutConfig, layoutConfigAtom);
    },
    getPageTitle() {
      const atomClass = this.getAtomClass(this.atomClass);
      if (!atomClass) return this.$text('Atom');
      return `${this.$text('Atom')}: ${atomClass.titleLocale}`;
    },
    getLayoutComponentOptions() {
      return {
        props: {
          layoutManager: this,
          layoutConfig: this.layoutConfig,
        },
      };
    },
    _renderLayoutComponent() {
      if (!this.ready) return null;
      return <eb-component ref='layout' module={this.layoutConfig.component.module} name={this.layoutConfig.component.name} options={this.getLayoutComponentOptions()}></eb-component>;
    },
    _renderPopoverAtomOrders() {
      // list
      let domList;
      if (this.popoverOrdersReady) {
        const children = [];
        for (const atomOrder of this.atomOrders) {
          children.push(
            <eb-list-item key={this._getAtomOrderKey(atomOrder)} popoverClose link="#" propsOnPerform={$event => { this.onPerformChangeAtomOrder($event, atomOrder); }}>
              <f7-icon slot="media" material={this._getAtomOrderStatus(atomOrder)}></f7-icon>
              <div slot="title">{atomOrder.titleLocale}</div>
            </eb-list-item>
          );
        }
        domList = (
          <f7-list inset>
            {children}
          </f7-list>
        );
      }
      return (
        <eb-popover ref="popoverAtomOrders" ready={this.popoverOrdersReady}>
          {domList}
        </eb-popover>
      );
    },
  },
  render() {
    return (
      <div>
        {this._renderLayoutComponent()}
        {this._renderPopoverAtomOrders()}
      </div>
    );
  },
};
