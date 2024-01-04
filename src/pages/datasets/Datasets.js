import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";
import { Select } from "../../components/select";
import { List } from "../../components/list";
import { Expandable } from "../../components/expandable";
import { fetcher } from "../../utils/fetcher";
import gameSystems from "../../assets/armies.json";

import { Entity } from "./Entity";
import "./Datasets.css";

export const Datasets = ({ isMobile }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [armyInput, setArmyInput] = useState("");
  const [army, setArmy] = useState("kingdom-of-bretonnia");
  const game = "the-old-world";
  const [dataset, setDataset] = useState({
    characters: [],
    core: [],
    special: [],
    rare: [],
    mercenaries: [],
    allies: [],
  });
  const intl = useIntl();
  const handleSubmit = ({ unit, type }) => {
    setDataset({
      ...dataset,
      [type]: [...dataset[type], unit],
    });
  };

  const handleArmyChange = (value) => {
    setArmy(value);
  };
  const handleLoadArmy = () => {
    fetcher({
      url: `games/${game}/${army}`,
      onSuccess: (dataset) => {
        console.log(dataset);

        setDataset(dataset);
        setIsLoading(false);
      },
    });
  };
  const handleArmyInputBlur = (event) => {
    setArmyInput(event.target.value);
  };
  const handleArmyFromJsonClick = () => {
    try {
      setDataset(JSON.parse(armyInput));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // if (isLoading) {
  //   return (
  //     <>
  //       <Header headline="Old World Builder" />
  //       <Main loading />
  //     </>
  //   );
  // }

  return (
    <>
      <Helmet>
        <title>
          {`Old World Builder | ${intl.formatMessage({
            id: "footer.datasets",
          })}`}
        </title>
      </Helmet>

      <Header headline="Old World Builder" />

      <Main className="datasets">
        <Button to="/" icon="home" centered spaceBottom>
          <FormattedMessage id="misc.startpage" />
        </Button>

        <h2>
          <FormattedMessage id="datasets.title" />
        </h2>
        <p className="datasets__paragraph">Some explanations.</p>
        <br />

        <div className="datasets__columns">
          <section className="column datasets__column">
            <header className="editor__header datasets__column-header">
              <h2>
                <FormattedMessage id="Load a dataset" />
              </h2>
            </header>

            <Select
              options={gameSystems.filter(({ id }) => id === game)[0].armies}
              onChange={handleArmyChange}
              selected="kingdom-of-bretonnia"
              spaceBottom
              required
            />
            <Button onClick={handleLoadArmy}>Load existing dataset</Button>
            <hr />
            <input
              type="text"
              name="army"
              className="input"
              autoComplete="off"
              value={armyInput}
              onChange={handleArmyInputBlur}
              placeholder="Paste your .json file"
            />
            <Button onClick={handleArmyFromJsonClick}>Load from .json</Button>
            <hr />
            <Button disabled>Load local dataset</Button>
          </section>

          <section className="column datasets__column">
            <header className="editor__header datasets__column-header">
              <h2>
                <FormattedMessage id="Edit units" />
              </h2>
            </header>

            <ul>
              {dataset.characters.map((unit, index) => (
                <List
                  key={index}
                  className="editor__list"
                  // active={location.pathname.includes(unit.id)}
                >
                  <div className="editor__list-inner">
                    <b>{unit.name_en}</b>
                  </div>
                </List>
              ))}
            </ul>
          </section>

          <section className="column datasets__column">
            <header className="editor__header datasets__column-header">
              <h2>
                <FormattedMessage id="Add new unit" />
              </h2>
            </header>

            <Expandable headline="Character">
              <Entity
                onSubmit={(unit) => handleSubmit({ unit, type: "characters" })}
              />
            </Expandable>
            <hr />
            <Expandable headline="Core Unit">
              <Entity
                onSubmit={(unit) => handleSubmit({ unit, type: "core" })}
              />
            </Expandable>
            <hr />
            <Expandable headline="Special Unit">
              <Entity
                onSubmit={(unit) => handleSubmit({ unit, type: "special" })}
              />
            </Expandable>
            <hr />
            <Expandable headline="Rare Unit">
              <Entity
                onSubmit={(unit) => handleSubmit({ unit, type: "rare" })}
              />
            </Expandable>
          </section>

          <section className="column datasets__column">
            <header className="editor__header datasets__column-header">
              <h2>
                <FormattedMessage id="JSON output" />
              </h2>
            </header>

            <textarea
              className="datasets__output"
              rows="30"
              spellcheck="false"
              data-gramm="false"
              value={JSON.stringify(dataset, null, 2)}
            />
          </section>
        </div>
      </Main>
    </>
  );
};
