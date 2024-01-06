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
  const handleSubmit = ({ unit, isNew, type }) => {
    if (isNew) {
      setDataset({
        ...dataset,
        [type]: [...dataset[type], unit],
      });
    } else {
      setDataset({
        ...dataset,
        [type]: dataset[type].map((existingUnit) =>
          existingUnit.id === unit.id ? unit : existingUnit
        ),
      });
    }

    window.scrollTo(0, 0);
  };

  const handleArmyChange = (value) => {
    setArmy(value);
  };
  const handleLoadArmy = () => {
    fetcher({
      url: `games/${game}/${army}`,
      onSuccess: (dataset) => {
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
        <p className="datasets__paragraph">Thank you!</p>
        <p className="datasets__paragraph">More links?</p>
        <ul>
          <li>Write as in book, double check</li>
          <li>Special rule missing - report</li>
        </ul>
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

            <h3>
              <FormattedMessage id="Characters" />
            </h3>
            <ul>
              {dataset.characters.map((unit, index) => (
                <List key={index}>
                  <Expandable headline={unit.name_en} noMargin>
                    <Entity
                      unit={unit}
                      type="characters"
                      onSubmit={handleSubmit}
                    />
                  </Expandable>
                </List>
              ))}
            </ul>
            <h3>
              <FormattedMessage id="Core" />
            </h3>
            <ul>
              {dataset.core.map((unit, index) => (
                <List key={index}>
                  <Expandable headline={unit.name_en} noMargin>
                    <Entity unit={unit} type="core" onSubmit={handleSubmit} />
                  </Expandable>
                </List>
              ))}
            </ul>
            <h3>
              <FormattedMessage id="Special" />
            </h3>
            <ul>
              {dataset.special.map((unit, index) => (
                <List key={index}>
                  <Expandable headline={unit.name_en} noMargin>
                    <Entity
                      unit={unit}
                      type="special"
                      onSubmit={handleSubmit}
                    />
                  </Expandable>
                </List>
              ))}
            </ul>
            <h3>
              <FormattedMessage id="Rare" />
            </h3>
            <ul>
              {dataset.rare.map((unit, index) => (
                <List key={index}>
                  <Expandable headline={unit.name_en} noMargin>
                    <Entity unit={unit} type="rare" onSubmit={handleSubmit} />
                  </Expandable>
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

            <ul>
              <List>
                <Expandable headline="Character" noMargin>
                  <Entity type="characters" onSubmit={handleSubmit} />
                </Expandable>
              </List>
              <List>
                <Expandable headline="Core Unit" noMargin>
                  <Entity type="core" onSubmit={handleSubmit} />
                </Expandable>
              </List>
              <List>
                <Expandable headline="Special Unit" noMargin>
                  <Entity type="special" onSubmit={handleSubmit} />
                </Expandable>
              </List>
              <List>
                <Expandable headline="Rare Unit" noMargin>
                  <Entity type="rare" onSubmit={handleSubmit} />
                </Expandable>
              </List>
            </ul>
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
            <p>
              <FormattedMessage id="Copy and post in discord" />
            </p>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://discord.com/channels/1120710419108085780/1120720528068583434"
            >
              Discord
            </a>
          </section>
        </div>
      </Main>
    </>
  );
};
