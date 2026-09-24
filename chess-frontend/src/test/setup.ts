import '@testing-library/jest-dom';

window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = function() {};
