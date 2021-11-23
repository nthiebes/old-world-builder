import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

// import { Home } from "./pages/home";
import { List } from "./pages/list";
import "./App.css";

export const App = () => {
  return (
    <Router>
      <header className="header">
        <nav>
          <Link to="/">Home</Link>
        </nav>
        <div className="title">
          <h1>
            Zhufbar <button className="button">Edit</button>
          </h1>
          <p>1337 / 2000 Punkte</p>
        </div>
        <button className="button">...</button>
      </header>
      <main>
        <Switch>
          <Route path="/:id">{<List />}</Route>
          <Route path="/">{/* <Home /> */}</Route>
        </Switch>
      </main>
    </Router>
  );
};

/*
<header class="header">
      <button class="button"><</button>
      <div class="title">
        <h1>Zhufbar <button class="button">Edit</button></h1>
        <p>1337 / 2000 Pkt.</p>
      </div>
      <button class="button">...</button>
    </header>
    <main>
      <section>
        <header class="section__header">
          <h2>Kommandanten <span>(123 Pkt.)</span></h2>
          <p>Max. 3</p>
          <progress value="2"></progress>
          <button class="button">+ Neu</button>
        </header>
        <ul>
          <li>
            <a href="">König <span>343 Pkt.</span></a>
          </li>
          <li>
            <button>Runenmeister</button>
          </li>
        </ul>
      </section>
      <h2>Helden (666 Pkt.) <button class="button">+ Neu</button></h2>
      <ul>
        <li>
          <button>König</button>
        </li>
      </ul>
      <h2>Kerneinheiten (666 Pkt.) <button class="button">+ Neu</button></h2>
      <h2>Eliteeinheiten (666 Pkt.) <button class="button">+ Neu</button></h2>
      <h2>
        Seltene Einheiten (666 Pkt.) <button class="button">+ Neu</button>
      </h2>
    </main>
    <footer></footer>
*/
