import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { NewList } from "./pages/new-list";
import { Editor } from "./pages/editor";
import { Home } from "./pages/home";
import { Unit } from "./pages/unit";
import { Edit } from "./pages/edit";
import { Magic } from "./pages/magic";
import { About } from "./pages/about";
import { Help } from "./pages/help";
import { setLists } from "./state/lists";
import { Header, Main } from "./components/page";

import "./App.css";

export const App = () => {
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 1279px)").matches
  );

  useEffect(() => {
    const localLists = localStorage.getItem("lists");

    dispatch(setLists(JSON.parse(localLists)));
  }, [dispatch]);

  useEffect(() => {
    window
      .matchMedia("(max-width: 1279px)")
      .addEventListener("change", (event) => setIsMobile(event.matches));
  }, []);

  return (
    <Router>
      {isMobile ? (
        <Switch>
          <Route path="/editor/:listId/edit">{<Edit isMobile />}</Route>
          <Route path="/editor/:listId/add/:type">{<Unit isMobile />}</Route>
          <Route path="/editor/:listId/:type/:unitId/magic">
            {<Magic isMobile />}
          </Route>
          <Route path="/editor/:listId/:type/:unitId">
            {<Unit isMobile />}
          </Route>
          <Route path="/editor/:listId">{<Editor isMobile />}</Route>
          <Route path="/new">{<NewList isMobile />}</Route>
          <Route path="/about">{<About />}</Route>
          <Route path="/help">{<Help />}</Route>
          <Route path="/">{<Home isMobile />}</Route>
        </Switch>
      ) : (
        <Switch>
          <Route path="/about">{<About />}</Route>
          <Route path="/help">{<Help />}</Route>
          <Route path="/">
            <Header headline="Old World Builder" />
            <Main isDesktop>
              <section className="column">
                <Home />
              </section>
              <section className="column">
                <Switch>
                  <Route path="/new">{<NewList />}</Route>
                  <Route path="/editor/:listId">{<Editor />}</Route>
                </Switch>
              </section>
              <section className="column">
                <Switch>
                  <Route path="/editor/:listId/edit">{<Edit />}</Route>
                  <Route path="/editor/:listId/add/:type">{<Unit />}</Route>
                  <Route path="/editor/:listId/:type/:unitId">{<Unit />}</Route>
                </Switch>
              </section>
              <section className="column">
                <Route path="/editor/:listId/:type/:unitId/magic">
                  {<Magic />}
                </Route>
              </section>
            </Main>
          </Route>
        </Switch>
      )}
    </Router>
  );
};
