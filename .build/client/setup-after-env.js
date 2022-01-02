
Element.prototype.scrollIntoView = jest.fn();
document.createRange = () => {
  const range = new global.Range();

  range.getBoundingClientRect = jest.fn();

  range.getClientRects = () => {
    return {
      item: () => null,
      length: 0,
      [Symbol.iterator]: jest.fn()
    };
  };

  range.startContainer.getBoundingClientRect = jest.fn();

  return range;
}
