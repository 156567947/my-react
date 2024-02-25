import { createElement, render } from "./micro-react";

// const element = createElement(
//   "h1",
//   { id: "foo", class: "hello", style: 'width:100px;height:50px;background:pink;' },
//   'Hello, world!',
//   createElement(
//     'h2'
//   ),
//   createElement(
//     'a',
//     { href: "https://www.baidu.com", style: 'color:red' },
//     'baidu'
//   )
// );
// const container = document.querySelector('#root');
// console.log(container)

// const Click = () => {
//   console.log('first')
// }
// // render(element, container);
// /** @jsx createElement */
// const element2 = (
//   <div id="test" >
//     <a href='https://www.baidu.com' style='color:pink'>barasdasd</a>
//     <span onclick={Click}>666</span>
//   </div>
// )


// const element3 = createElement(
//   "div",
//   { style: "background:skyblue" },
//   createElement("input", { id: "input", oninput: handleInput }, null),
//   createElement("button", { id: "button", onclick: handleClick }, "同步"),
//   createElement("h1", { id: "out" }, "hi")
// );

// function handleInput(e) {
//   rerender(e.target.value)
// }
// function rerender(text) {
//   const out = document.getElementById("out");
//   out.innerText = text;
//   render(element3, container)
// }

// function handleClick() { }

// render(element3, container)
// console.log(element2)
// console.log(element3)




const App=(props)=>{
  return createElement('h1',null,'hi,',props.name)
}


const container=document.querySelector('#root')
const element=createElement(App,{name:'steven'})
render(element,container)

// function App(props) {
//   return <h1>Hi {props.name}</h1>
// }
