declare var document;

function trigger(eventName: string, data = null) {
  document.dispatchEvent(new document.defaultView.CustomEvent(eventName, {detail: data}));
}
export default trigger;
