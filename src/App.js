import { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from "react-router-dom";

// import { Home } from "./pages/home";
import { Editor } from "./pages/editor";
import { Expandable } from "./components/expandable";
import { getRandomId } from "./utils/id";
// import warhammerFantasy from "./data/warhammer-fantasy.json";
import "./App.css";

const emptyList = {
  name: "Neue Liste",
  points: 1500,
  army: "greenskins",
  lords: [],
  heroes: [],
  core: [],
  special: [],
  rare: [],
};

export const App = () => {
  const [lists, setLists] = useState([]);
  const [redirect, setRedirect] = useState(null);
  const createList = () => {
    const localLists = JSON.parse(localStorage.getItem("lists")) || [];
    const newId = getRandomId();
    const newList = { ...emptyList, id: newId };

    localStorage.setItem("lists", JSON.stringify([...localLists, newList]));
    setRedirect(newId);
  };

  useEffect(() => {
    const localLists = localStorage.getItem("lists");

    setLists(JSON.parse(localLists) || []);
  }, [setLists]);

  return (
    <Router>
      <Switch>
        <Route path="/editor/:id">{<Editor />}</Route>
        <Route path="/">
          {
            <>
              {redirect && <Redirect to={`/editor/${redirect}`} />}
              <button onClick={createList}>{"Neu +"}</button>
              <ul>
                {lists.map(({ id, name }, index) => (
                  <li key={index}>
                    <Link to={`/editor/${id}`}>{name}</Link>
                  </li>
                ))}
              </ul>
              {/* <Expandable headline="Warhammer Fantasy" open>
                  {warhammerFantasy.map(({ id, name }) => (
                    <li key={id}>
                      <Link to={`/${id}`}>{name}</Link>
                    </li>
                  ))}
                </Expandable>
                <Expandable headline="Warhammer: The Old World">
                  {""}
                </Expandable> */}
            </>
          }
        </Route>
      </Switch>
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
