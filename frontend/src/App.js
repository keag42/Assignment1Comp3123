import logo from './logo.svg';
import './App.css';
import Navbar from './/Util/navbar.jsx';
function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Navbar />


        <h2>Login</h2>

        Email
        <input type="text"/>

        Password
        <input type="text"/>

        <p>dont have an account? <a style={{color: "lightblue"}}href="">signup</a></p>
      </header>
    </div>
  );
}

export default App;
