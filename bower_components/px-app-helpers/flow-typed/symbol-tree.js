declare class SymbolTree {
  initialize(Object): Object;
  hasChildren(Object): Object;
  firstChild(Object): Object;
  lastChild(Object): Object;
  previousSibling(Object): Object;
  nextSibling(Object): Object;
  parent(Object): Object;
  lastInclusiveDescendant(Object): Object;
  preceding(Object, ?Object): Object;
  following(Object, ?Object): Object;
  childrenToArray(Object, ?Object): Array<Object>;
  ancestorsToArray(Object, ?Object): Array<Object>;
  treeToArray(Object, ?Object): Array<Object>;
  treeIterator(Object, ?Object): Object;
  index(Object): number;
  childrenCount(Object): number;
  compareTreePosition(Object, Object): number;
  remove(Object): Object;
  insertBefore(Object, Object): Object;
  insertAfter(Object, Object): Object;
  prependChild(Object, Object): Object;
  appendChild(Object, Object): Object;
}
