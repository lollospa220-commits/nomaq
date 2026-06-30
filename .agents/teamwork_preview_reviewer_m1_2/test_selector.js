const { page } = require('../../tests/mock_app');

console.log('Resetting page...');
page.reset();

console.log('Querying main > div...');
const headerEl = page.querySelector('main > div');
if (headerEl) {
  console.log('Found element with tag:', headerEl.tagName);
  console.log('Attributes:', headerEl.attributes);
  console.log('Classes:', Array.from(headerEl.classList));
  console.log('Has max-w-md:', headerEl.classList.has('max-w-md'));
} else {
  console.log('No element found!');
}
