import React from "react";

function App() {

  const [count, setCount] = React.useState(0);

  const incrementHandler = () => setCount(count+1);
  const decrementHandler = () => setCount(count-1);

  return (
     <div>
       <p>Simple React App With SSR</p>

       <p>Trivial counter</p>
       <p>{count}</p>
       <button onClick={incrementHandler}>+</button>
       <button onClick={decrementHandler}>-</button>
     </div>
  );
}

export default App;
