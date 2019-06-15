import {asyncRouter} from '../../router';

const _import = require('../../router/_import_dev');

const permission = {
  state: {
    addRouters: asyncRouter,
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters[0].children = asyncRouter[0].children.concat(routers);
    }
  },
  actions: {
    GenerateRoutes({commit}, data) {
      return new Promise(resolve => {
        const {menus} = data;
        let accessedRouters = [];
        getRouterByMenu(menus, accessedRouters);
        commit('SET_ROUTERS', accessedRouters);
        resolve();
      })
    }
  },
  getters: {
    addRouters: state => state.addRouters
  }
};

function getRouterByMenu(menus, routers) {
  menus.forEach((menu) => {
    if (menu.children && menu.children.length) {
      getRouterByMenu(menu.children, routers);
    } else {
      const router = {};
      router.name = menu.text;
      router.path = menu.path;
      if (menu.attributes.component) {
        router.components = _import(menu.attributes.component);
      }
      routers.push(router)
    }
  });
  return routers;
}

export default permission;
