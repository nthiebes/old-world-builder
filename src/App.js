import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Switch, Route, BrowserRouter } from "react-router-dom";

import { NewList } from "./pages/new-list";
import { Editor } from "./pages/editor";
import { Home } from "./pages/home";
import { Unit } from "./pages/unit";
import { EditList } from "./pages/edit-list";
import { Magic } from "./pages/magic";
import { About } from "./pages/about";
import { Add } from "./pages/add";
import { Help } from "./pages/help";
import { Export } from "./pages/export";
import { Print } from "./pages/print";
import { DuplicateList } from "./pages/duplicate-list";
import { Rename } from "./pages/rename";
import { Datasets } from "./pages/datasets";
import { NotFound } from "./pages/not-found";
import { Privacy } from "./pages/privacy";
import { Changelog } from "./pages/changelog";
import { Import } from "./pages/import";
import { GameView } from "./pages/game-view";
import { setLists } from "./state/lists";
import { Header, Main } from "./components/page";

import "./App.css";

export const App = () => {
  const dispatch = useDispatch();
  const [isMobile, setIsMobile] = useState(
    window.matchMedia("(max-width: 1279px)").matches
  );

  useEffect(() => {
    const localLists = localStorage.getItem("owb.lists");

    dispatch(setLists(JSON.parse(localLists)));
  }, [dispatch]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1279px)");

    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener("change", (event) =>
        setIsMobile(event.matches)
      );
    } else {
      mediaQuery.addListener((event) => setIsMobile(event.matches));
    }
  }, []);

  return (
    <BrowserRouter>
      {isMobile ? (
        <Switch>
          <Route path="/editor/:listId/edit">{<EditList isMobile />}</Route>
          <Route path="/editor/:listId/export">{<Export isMobile />}</Route>
          <Route path="/editor/:listId/duplicate">
            {<DuplicateList isMobile />}
          </Route>
          <Route path="/editor/:listId/add/:type">{<Add isMobile />}</Route>
          <Route path="/editor/:listId/:type/:unitId/magic/:command">
            {<Magic isMobile />}
          </Route>
          <Route path="/editor/:listId/:type/:unitId/rename">
            {<Rename isMobile />}
          </Route>
          <Route path="/editor/:listId/:type/:unitId/items/:group">
            {<Magic isMobile />}
          </Route>
          <Route path="/editor/:listId/:type/:unitId">
            {<Unit isMobile />}
          </Route>
          <Route path="/editor/:listId">{<Editor isMobile />}</Route>
          <Route path="/import">{<Import isMobile />}</Route>
          <Route path="/new">{<NewList isMobile />}</Route>
          <Route path="/about">{<About />}</Route>
          <Route path="/help">{<Help />}</Route>
          <Route path="/privacy">{<Privacy />}</Route>
          <Route path="/datasets">{<Datasets isMobile />}</Route>
          <Route path="/changelog">{<Changelog />}</Route>
          <Route path="/print/:listId">{<Print />}</Route>
          <Route path="/game-view/:listId">{<GameView />}</Route>
          <Route path="/" exact>
            {<Home isMobile />}
          </Route>
          <Route path="*">{<NotFound />}</Route>
        </Switch>
      ) : (
        <Switch>
          <Route path="/about">{<About />}</Route>
          <Route path="/help">{<Help />}</Route>
          <Route path="/privacy">{<Privacy />}</Route>
          <Route path="/datasets">{<Datasets />}</Route>
          <Route path="/changelog">{<Changelog />}</Route>
          <Route path="/print/:listId">{<Print />}</Route>
          <Route path="/game-view/:listId">{<GameView />}</Route>
          <Route path="/">
            <Header headline="Old World Builder" hasMainNavigation />
            <Main isDesktop>
              <section className="column">
                <Home />
              </section>
              <section className="column">
                <Switch>
                  <Route path="/new">{<NewList />}</Route>
                  <Route path="/import">{<Import />}</Route>
                  <Route path="/editor/:listId">{<Editor />}</Route>
                </Switch>
              </section>
              <section className="column">
                <Switch>
                  <Route path="/editor/:listId/edit">{<EditList />}</Route>
                  <Route path="/editor/:listId/export">{<Export />}</Route>
                  <Route path="/editor/:listId/duplicate">
                    {<DuplicateList />}
                  </Route>
                  <Route path="/editor/:listId/add/:type">{<Add />}</Route>
                  <Route path="/editor/:listId/:type/:unitId">{<Unit />}</Route>
                </Switch>
              </section>
              <section className="column">
                <Switch>
                  <Route path="/editor/:listId/:type/:unitId/magic/:command">
                    {<Magic />}
                  </Route>
                  <Route path="/editor/:listId/:type/:unitId/rename">
                    {<Rename />}
                  </Route>
                  <Route path="/editor/:listId/:type/:unitId/items/:group">
                    {<Magic />}
                  </Route>
                </Switch>
              </section>
            </Main>
          </Route>
        </Switch>
      )}
    </BrowserRouter>
  );
};
