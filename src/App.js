import { useEffect, useState } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import { NewList } from "./pages/new-list/NewList";
import { Editor } from "./pages/editor";
import { Button } from "./components/button";
import { Icon } from "./components/icon";
import { Header, Main } from "./components/page";

import "./App.css";

export const App = () => {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    const localLists = localStorage.getItem("lists");

    setLists(JSON.parse(localLists) || []);
  }, []);

  return (
    <Router>
      <Switch>
        <Route path="/editor/:id">{<Editor />}</Route>
        <Route path="/new">{<NewList />}</Route>
        <Route path="/">
          {
            <>
              <Header headline="Old World Builder" />
              <Main>
                <ul>
                  {lists.map(({ id, name, points, game }, index) => (
                    <li key={index} className="list">
                      <Link to={`/editor/${id}`}>
                        <span>
                          <h2>{name}</h2>
                          <p>{points} Pkte.</p>
                        </span>
                        {game === "warhammer-fantasy" && (
                          <img
                            height="20"
                            src={`/${game}.png`}
                            alt="Warhammer Fantasy"
                          />
                        )}
                        {game === "the-old-world" && (
                          <img
                            height="35"
                            src={`/${game}.png`}
                            alt="Warhammer: The Old World"
                          />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Button type="tertiary" to="/new" fullWidth>
                  <Icon symbol="add" />
                  {"Neue Liste"}
                </Button>
              </Main>
            </>
          }
        </Route>
      </Switch>
    </Router>
  );
};
