<!-- 1.模板 :html 结构-->
<template>
  <div>
      <Layout>
        <LayoutPanel region="center" style="height:100%" :bodyStyle="{padding:'5px'}">
          <Panel title="查询条件" :collapsible="true" :bodyStyle="{padding:'10px',marginBottom:'5px'}">
            <div style="margin-bottom:10px">
              <div style="float: left">
                <Label for="name" align="right">菜单名称:</Label>
                <TextBox inputId="name"  v-model="menuName"></TextBox>

                <Label for="d2" align="right">修改日期： </Label>
                <DateBox inputId="d2" format="yyyy-MM-dd"></DateBox>
                至
                <DateBox inputId="d2" format="yyyy-MM-dd"></DateBox>
                <Label/>
                <LinkButton iconCls="icon-search" style="width:60px" @click="search()">查询</LinkButton>
                <LinkButton iconCls="icon-cancel" style="width:60px" @click="reset()"> 重置</LinkButton>
              </div>

            </div>
          </Panel>

          <Panel title="列表" :bodyStyle="{padding:'3px'}">
            <template slot="header">
              <div class="f-row">
                <div class="f-full" style="line-height:30px">列表</div>
                <LinkButton iconCls="icon-add" :plain="true" @click="add()">新增</LinkButton>
                <LinkButton iconCls="icon-reload" :plain="true" @click="refresh()">刷新</LinkButton>
                <LinkButton iconCls="icon-remove" :plain="true" @click="remove()">删除</LinkButton>
                <LinkButton iconCls="icon-edit" :plain="true" @click="edit()">编辑</LinkButton>
                <LinkButton iconCls="icon-back" :plain="true" @click="go(-1)"></LinkButton>
              </div>
            </template>
            <TreeGrid ref="t1"  style="height:80%" :data="data" idField="id" treeField="text" :footerData="footerData"
                       :showFooter="true" @selectionChange="selection=$event">
              <GridColumn field="text" title="菜单名称"></GridColumn>
              <GridColumn field="type" title="菜单类型"></GridColumn>
              <GridColumn field="path" title="路径"></GridColumn>
              <GridColumn field="component" title="组件名称"></GridColumn>
              <GridColumn field="orderNo" title="排序编码"></GridColumn>
              <GridColumn field="date" title="修改日期"></GridColumn>
            </TreeGrid>
          </Panel>

          <Dialog ref="d1" :title="menuDialogTitle" :dialogStyle="{width:'480px',height:'500px'}"
                  bodyCls="f-column" :draggable="true" :closed="true" :modal="true"  borderType="none">
            <div class="f-full" style="padding: 20px 60px 20px 20px">
              <Form ref="form" :model="menu">
                <Label for="menuType" align="right">菜单类型:</Label>
                <label v-for="(mt,index) in menuType" :key="index">
                  <input type="radio" :value='mt.value' v-model="menu.type">{{mt.text}} &nbsp;&nbsp;
                </label>
                <div class="error">{{ veeErrors.first('menuType') }}</div>

                <Label for="menuParent" align="right">上级菜单:</Label>
                <ComboTree name='menuParent' :data="menus" v-model="menu.parentId" placeholder="-请选择-">
                  <Tree slot="tree"></Tree>
                </ComboTree>
                <div class="error">{{ veeErrors.first('menuParent') }}</div>

                <Label for="menuName" align="right">菜单名称:</Label>
                <TextBox inputId="menuName" name="menuName" v-model="menu.name" style="width:18em"
                         v-validate="'required|max:10'" placeholder="请输入菜单名称"></TextBox>
                <span style="color: red; ">*</span>
                <div class="error">{{ veeErrors.first('menuName') }}</div>

                <Label for="menuPath" align="right">菜单路径:</Label>
                <TextBox inputId="menuPath" name="menuPath" v-model="menu.url" style="width:18em"
                         v-validate="'max:100'" placeholder="请输入菜单路径"></TextBox>
                <div class="error">{{ veeErrors.first('menuPath') }}</div>

                <Label for="component" align="right">组件名称:</Label>
                <TextBox inputId="component" name="component" v-model="menu.component" style="width:18em"
                         v-validate="'max:100'" placeholder="请输入组件名称"></TextBox>
                <div class="error">{{ veeErrors.first('component') }}</div>

                <Label for="menuIcon" align="right">菜单图标:</Label>
                <TextBox inputId="menuIcon" name="menuIcon" v-model="menu.icon" style="width:18em"
                         v-validate="'required'" placeholder="请输入菜单图标样式"></TextBox>
                <div class="error">{{ veeErrors.first('menuIcon') }}</div>

                <Label for="orderCode" align="right">排序编码:</Label>
                <NumberBox inputId="orderCode" name="orderCode" v-model="menu.orderCode" v-validate="'required'"
                           placeholder="请输入排序编码" :value="100" :spinners="true"></NumberBox>
                <div class="error">{{ veeErrors.first('orderCode') }}</div>

                <Label for="authCode" align="right">权限编码:</Label>
                <TextBox inputId="authCode" name="authCode" v-model="menu.authCode" v-validate="'required'"
                         style="width:18em"  placeholder="请输入权限编码"  data-vv-as="权限编码" ></TextBox>
                <div class="error">{{ veeErrors.first('authCode') }}</div>

                <Label for="remark" align="right">备注信息:</Label>
                <TextBox inputId="remark" name="remark" :multiline="true" v-model="menu.remark"
                         style="width:218px;height:80px;"></TextBox>
                <div class="error">{{ veeErrors.first('remark') }}</div>
              </Form>
            </div>
            <div class="dialog-button">
              <LinkButton style="width:60px" @click="confirm()&&$refs.d1.close()">确认</LinkButton>
              <LinkButton style="width:60px" @click="$refs.d1.close()">取消</LinkButton>
            </div>
          </Dialog>

        </LayoutPanel>
      </Layout>
  </div>
</template>

<!-- 2.行为 :处理逻辑-->
<script>
  export default {
    data() {
      return {
        data: null,
        footerData: [],
        selection: {},
        loading: false,
        pagePosition: "bottom",
        menu: {},
        menuType: [
          {value: 0, text: "目录"},
          {value: 1, text: "功能菜单"},
          {value: 2, text: "页面按钮"},
        ],
        menuName:null,
        menus: null,
        menuDialogTitle:""
      };
    },
    created() {
      this.initData();
      this.footerData = [{
        text: "汇总信息:",
        path: 99
      }];
    },
    methods: {
      initData() {
        this.getData().then(result => {
          const mapMenu =  (result)=> {
            result.map(value => {
              value.date = value.attributes.modifyDate;
              const menuTypeMap = {};
               this.menuType.forEach(mt => {
                 menuTypeMap[mt.value] = mt.text;
              });
              value.type =menuTypeMap[value.attributes.menuType];
              value.orderNo = value.attributes.orderNo;
              value.component = value.attributes.component;
              if(value.attributes.pageBtn){
                value.children = value.attributes.pageBtn;
              }
              delete value.attributes;
              if (value.children) {
                mapMenu(value.children);
              }
              return value;
            });
            return result;
          };
          const menuList = mapMenu(result);
          this.data = menuList;
          this.menus = JSON.parse(JSON.stringify(menuList))
        });
      },
      getData() {
        return new Promise((resolve, reject) => {
          this.$api.menu.getMenuTree('').then(response => {
            const result = response.data.data;
            resolve(result);
          }).catch(error => {
            reject(error);
          });
        });
      },
      search(){
        this.$refs.t1.doFilter({field:'text',op:'equal',value:this.menuName});
      },
      add() {
        this.menu = {};
        this.menu.type=1;
        this.menuDialogTitle="新增菜单";
        if (this.selection) {
          this.menu.parentId = this.selection.id;
          this.$refs.d1.open();
        } else {
          this.$messager.alert({
            title: "提示信息",
            icon: "warning",
            msg: "请至少选中一条记录!"
          });
        }
      },
      remove() {
        //console.log(this.selection);
        if (this.selection.id) {
          const ids = [];
          ids.push(this.selection.id);
          this.$api.menu.menuDel(ids).then((response) => {
            console.log("--->", response.data);
            this.initData();
          }).catch(error => {
            console.log("error", error);
          });
        } else {
          this.$messager.alert({
            title: "提示信息",
            icon: "warning",
            msg: "请至少选中一条记录!"
          });
        }
      },
      edit() {
        this.menuDialogTitle="编辑菜单";
        if (this.selection.id) {
          this.$api.menu.menuDetail(this.selection.id).then((response) => {
            this.menu = response.data.data;
          }).catch(error => {
            console.log("get menu detail error", error);
          });
          this.$refs.d1.open();
        } else {
          this.$messager.alert({
            title: "提示信息",
            icon: "warning",
            msg: "请至少选中一条记录!"
          });
        }
      },
      refresh() {
        location.reload();
      },
      confirm() {
        this.$validator.validateAll().then((valid) => {
          if (valid) {
            console.log("commit json data:" + JSON.stringify(this.menu));
            if (this.menu.id) {
              this.$api.menu.menuUpt(this.menu).then((response) => {
                this.initData();
                this.$refs.d1.close();k
              }).catch(error => {
                console.log("error", error);
              });
            } else {
              this.$api.menu.menuAdd(this.menu).then((response) => {
                console.log("--->", response.data);
                this.initData();
                this.$refs.d1.close();
              }).catch(error => {
                console.log("error", error);
              });
            }
          }
        });
      }
    }
  };
</script>

<!-- 3.样式:解决样式     -->
<style scoped>
  .error {
    margin: 0 120px;
  }
</style>
