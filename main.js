import { createElement } from "./micro-react";

const element = createElement(
  "h1",
  { id: "foo", class: "hello" },
  'Hello, world!',
  createElement(
    'h2'
  )
);
console.log(element)
