'use strict'

const getLocalStorage = (name) => localStorage.getItem(name);
const setLocalStorage = (name, value) => localStorage.setItem(name, value);
const removeLocalStorage = (name) => localStorage.removeItem(name);

export { getLocalStorage, setLocalStorage, removeLocalStorage }