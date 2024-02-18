import createElement from "./createElement";

function render(element, container) {
  //创建元素
  const dom =
    element.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => {
    return key !== "children";
  };
  //赋予属性 排除掉children
  Object.keys(element.props)
    .filter(isProperty)
    .forEach((name) => {
      dom[name] = element.props[name];
    });
  //递归处理子节点
  element.props.children.forEach((child) => {
    render(child, dom);
  });
  //追加到父节点
  container.appendChild(dom);
}
export default render;
