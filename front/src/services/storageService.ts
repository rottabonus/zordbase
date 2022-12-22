const setItem = (key: string, value: string) =>
  sessionStorage.setItem(key, value);

const getItem = (key: string) => sessionStorage.getItem(key);
export const storageService = { setItem, getItem };
