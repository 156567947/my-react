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

let nextUnitOfWork = null;
function workLoop(deadLine) {
  //应该退出
  let shouldTield = false;
  //有工作 且 不应该退出
  while (nextUnitOfWork && !shouldTield) {
    //做工作
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    //看看有没有足够时间
    shouldTield = deadLine.timeRemaining() < 1;
  }
  //没有做够时间，请求下一次浏览器空闲时继续执行
  requestIdleCallback(workLoop);
}
//第一次请求
requestIdleCallback(workLoop);

function performUnitOfWork(work) {}

export default render;
