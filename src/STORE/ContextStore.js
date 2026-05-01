// can remove this file


const store = {
  merchants: {},
  categories: {},
  triggers: {}
};

export const ContextStore = {

  upsert(scope, id, version, payload) {
    store[scope + "s"][id] = payload;
  },

  getMerchant(id) {
    return store.merchants[id];
  },

  getCategory(slug) {
    return store.categories[slug];
  },

  getTrigger(id) {
    return store.triggers[id];
  }
};