import { createElement, render } from "./micro-react";

const element = createElement(
  "h1",
  { id: "foo", class: "hello", style: 'width:100px;height:50px;background:pink;' },
  'Hello, world!',
  createElement(
    'h2'
  ),
  createElement(
    'a',
    { href: "https://www.baidu.com", style: 'color:red' },
    'baidu'
  )
);
const container = document.querySelector('#root');
console.log(container)
// render(element, container);
/** @jsx createElement */
const element2 = (
  <div id="test" >
    <a href='https://www.baidu.com' style='color:pink'>barasdasd</a>
    <span>666</span>
  </div>
)
render(element,container)
console.log(element2)
