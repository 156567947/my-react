import createElement from "./createElement";
function createDom(fiber) {
  //创建元素
  const dom =
    fiber.type == "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  //赋予属性 排除掉children
  Object.keys(fiber.props)
    .filter((key) => {
      return key !== "children";
    })
    .forEach((name) => {
      dom[name] = fiber.props[name];
    });
  
  return dom;
}
//发出第一个fiber，root fiber
function render(element, container) {
  nextUnitOfWork = {
    dom: container,
    props: {
      children: [element],
    },
    sibiling: null,
    child: null,
    parent: null,
  };
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

function performUnitOfWork(fiber) {
  //创建DOM元素
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  //追加到父节点
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  //给children新构建fiber
  const elements = fiber.props.children || [];

  //构建fiber之间的联系，构建fiberTree
  //filer架构不能有多个child的，所以第一个是孩子，后面的fiber变成孩子的sibiling
  let prevSibling = null;

  for (let i = 0; i < elements.length; i++) {
    const newFiber = {
      type: elements[i].type,
      props: elements[i].props,
      parent: fiber,
      dom: null,
      child: null,
      sibiling: null,
    };
    if (i === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibiling = newFiber;
    }
    prevSibling = newFiber;
  }
  //返回下一个fiber
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibiling) {
      return nextFiber.sibiling;
    }
    nextFiber = nextFiber.parent;
  }
}

export default render;
