export const endpoints = {
  auth: {
    register: () => '/api/register',
    login: () => '/api/login',
    me: () => '/api/me',
  },
  recipes: {
    list: () => '/api/recipes',
    create: () => '/api/recipes',
    update: (id) => `/api/recipes/${id}`,
    delete: (id) => `/api/recipes/${id}`,
  },
  stock: {
    list: () => '/api/pantry',
    create: () => '/api/pantry',
    delete: (id) => `/api/pantry/${id}`,
  },
  menu: {
    list: () => '/api/menu',
    create: () => '/api/menu',
    delete: (id) => `/api/menu/${id}`,
  },
  shopping: {
    generate: () => '/api/shopping-list',
    exportTxt: () => '/api/shopping/export/txt',
    exportPdf: () => '/api/shopping/export/pdf',
  },
  suggest: {
    recipes: () => '/api/suggest-recipes',
  },
};
