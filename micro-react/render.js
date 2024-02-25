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
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    sibiling: null,
    child: null,
    parent: null,
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;

//commit阶段
function commitRoot() {
  deletions.forEach((child) => commitWork(child));
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  //函数式组件没有dom，所以向上parent找
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  
  if (fiber.effectTag === "PLACEMENT" && fiber.dom !== null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag == "DELETION" && fiber.dom !== null) {
    // domParent.removeChild(fiber.dom);  //因为函数式组件没有dom，要删除就要一级一级向下找
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === "UPDATE" && fiber.dom !== null) {
    updateDOM(fiber.dom, fiber.alternate.props, fiber.props);
  }
 
  commitWork(fiber.child);
  commitWork(fiber.sibiling);

  function commitDeletion(fiber, domParent) {
    if(fiber.dom){
      domParent.removeChild(fiber.dom);
    }else{
      commitDeletion(fiber.child, domParent);
    }
  }
}

function updateDOM(dom, prevProps, nextProps) {
  const isEvent = (name) => name.startsWith("on");
  const isNew = (prev, next) => (key) => prev[key] !== next[key];
  //删除已经没有的或者发生改变的事件处理函数
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || prevProps[key] !== nextProps[key])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  //添加事件处理函数
  Object.keys(nextProps)
    .filter(isEvent)
    .filter((key) => !(key in prevProps) || prevProps[key] !== nextProps[key])
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

  //删除已经没有的props
  Object.keys(prevProps)
    .filter((key) => key !== "children" && !isEvent(key))
    .filter((key) => !(key in nextProps))
    .forEach((name) => (dom[name] = ""));
  //赋予新的或者改变的props
  Object.keys(nextProps)
    .filter((key) => key !== "children" && !isEvent(key))
    .filter((key) => !(key in prevProps) || prevProps[key] !== nextProps[key])
    .forEach((name) => (dom[name] = nextProps[name]));
}

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

  //commit阶段
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }
}
//第一次请求
requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }



  let prevSibling = null;

  //构建fiber之间的联系，构建fiberTree
  //filer架构不能有多个child的，所以第一个是孩子，后面的fiber变成孩子的sibiling
  // for (let i = 0; i < elements.length; i++) {
  //   const newFiber = {
  //     type: elements[i].type,
  //     props: elements[i].props,
  //     parent: fiber,
  //     dom: null,
  //     child: null,
  //     sibiling: null,
  //   };

  // }

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

//处理非函数式组件
function updateHostComponent(fiber) {
  //创建DOM元素
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  //给children新构建fiber
  const elements = fiber.props.children || [];
  //新建newFiber，构建fiber树
  reconcileChildren(fiber, elements);
}

//处理函数式组件
function updateFunctionComponent(fiber) {
  //调用函数式组件
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}


function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    const sameType = element && oldFiber && element.type === oldFiber.type;
    let newFiber = null;
    if (sameType) {
      //更新
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (element && !sameType) {
      //新建
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACEMENT",
      };
    }
    if (oldFiber && !sameType) {
      //删除
      oldFiber.effectTag = "DELETION";
      deletions.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibiling;
    }

    //如果是第一个，就是亲儿子
    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      //不是第一个就是兄弟
      prevSibling.sibiling = newFiber;
    }
    prevSibling = newFiber;

    index++;
  }
}

export default render;
