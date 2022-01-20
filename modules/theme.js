'use strict'

import { getLocalStorage, setLocalStorage } from './localStorage.js';

//theme input DOM instances
const themeInput = document.getElementById('theme-input');
const themeKnobTxt = document.querySelector('#label-theme > .knob');

// Wait for document to load
document.addEventListener("DOMContentLoaded", function (e) {

    //default to dark theme
    const defaultTheme = document.documentElement.getAttribute("data-theme");

    //get the current theme from the local storage
    //otherwise if it's undefined set it with the default theme
    const currentTheme = !getLocalStorage('theme') ? defaultTheme : getLocalStorage('theme');
    document.documentElement.setAttribute("data-theme", currentTheme);

    themeKnobTxt.textContent = `${currentTheme === 'light' ? 'Light' : 'Dark'} Theme`;
    themeInput.checked = currentTheme === 'light' ? true : false;

    const switchToOtherTheme = (switchTheme) => {

        // Set our current theme to the new one
        document.documentElement.setAttribute("data-theme", switchTheme);
        setLocalStorage('theme', switchTheme);
        const capitalizedStr = switchTheme.charAt(0).toUpperCase() + switchTheme.slice(1);
        setTimeout(() => {
            themeKnobTxt.textContent = `${capitalizedStr} Theme`;
        }, 200);
    }
    
    // when switch gets toggled
    themeInput.onchange = function (e) {
        const isCheckBoxChecked = e.target.checked;

        // Switch between 'dark' and 'light'
        const switchTheme = isCheckBoxChecked ? "light" : "dark";
        switchToOtherTheme(switchTheme);
    };
})