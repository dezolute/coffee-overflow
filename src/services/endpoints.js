export const endpoints = {
  auth: {
    register: () => '/auth/register',
    login: () => '/auth/login',
    me: () => '/auth/me',
  },
  recipes: {
    list: () => '/recipes',
    create: () => '/recipes',
    update: (id) => `/recipes/${id}`,
    delete: (id) => `/recipes/${id}`,
  },
  stock: {
    list: () => '/stock',
    create: () => '/stock',
    delete: (id) => `/stock/${id}`,
  },
  menu: {
    list: () => '/menu',
    create: () => '/menu',
    delete: (id) => `/menu/${id}`,
  },
  shopping: {
    generate: () => '/shopping/generate',
    exportTxt: () => '/shopping/export/txt',
    exportPdf: () => '/shopping/export/pdf',
  },
};
