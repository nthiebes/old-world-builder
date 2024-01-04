import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";
import { useDispatch } from "react-redux";

import { Header, Main } from "../../components/page";
import { NumberInput } from "../../components/number-input";
import { Button } from "../../components/button";
import { Select } from "../../components/select";
import { List } from "../../components/list";
import { Expandable } from "../../components/expandable";
import { fetcher } from "../../utils/fetcher";
import gameSystems from "../../assets/armies.json";

import "./Datasets.css";

export const Datasets = ({ isMobile }) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [armyInput, setArmyInput] = useState("");
  const [army, setArmy] = useState("kingdom-of-bretonnia");
  const dispatch = useDispatch();
  const game = "the-old-world";
  const [unit, setUnit] = useState({
    name_en: "",
    name_de: "",
    id: "",
    named: false,
    points: 0,
    minimum: 0,
    maximum: 0,
  });
  const [dataset, setDataset] = useState({
    characters: [],
    core: [],
    special: [],
    rare: [],
    mercenaries: [],
    allies: [],
  });
  const intl = useIntl();
  const handleSubmit = (event) => {
    event.preventDefault();

    setDataset({
      ...dataset,
      characters: [...dataset.characters, unit],
    });
  };
  const handleFieldChange = (event) => {
    setUnit({
      ...unit,
      [event.target.id]: event.target.value,
    });
  };
  const handleCheckboxChange = (event) => {
    setUnit({
      ...unit,
      [event.target.id]: event.target.value === "on" ? true : false,
    });
  };
  const handleNameBlur = () => {
    setUnit({
      ...unit,
      id: unit.name_en.toLowerCase().replace(/ /g, "-"),
      name_de: !unit.name_de ? unit.name_en : unit.name_de,
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

        // dispatch(setItems(updateIds(allItems)));
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
            <Button type="secondary" onClick={handleLoadArmy}>
              Load existing dataset
            </Button>
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
            <Button type="secondary" onClick={handleArmyFromJsonClick}>
              Load from .json
            </Button>
            <hr />
            <Button type="secondary" disabled>
              Load local dataset
            </Button>
          </section>

          <section className="column datasets__column">
            <header className="editor__header datasets__column-header">
              <h2>
                <FormattedMessage id="Units" />
              </h2>
            </header>

            <ul>
              {dataset.characters.map((unit, index) => (
                <List
                  key={index}
                  // to={`/editor/${listId}/lords/${unit.id}`}
                  className="editor__list"
                  // active={location.pathname.includes(unit.id)}
                >
                  <div className="editor__list-inner">
                    <b>{unit.name_en}</b>
                    {/* <b>{unit[`name_${language}`]}</b>
                    <i>{`${getUnitPoints(unit)} ${intl.formatMessage({
                      id: "app.points",
                    })}`}</i> */}
                  </div>
                  {/* {getAllOptions(unit)} */}
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

            <Expandable headline="Character" open>
              <form onSubmit={handleSubmit}>
                <label htmlFor="name_en">
                  <FormattedMessage id="Name en" />
                </label>
                <input
                  type="text"
                  id="name_en"
                  className="input"
                  value={unit.name_en}
                  onChange={handleFieldChange}
                  autoComplete="off"
                  required
                  onBlur={handleNameBlur}
                />
                <label htmlFor="name_de">
                  <FormattedMessage id="Name de" />
                </label>
                <input
                  type="text"
                  id="name_de"
                  className="input"
                  value={unit.name_de}
                  onChange={handleFieldChange}
                  autoComplete="off"
                  required
                />
                <label htmlFor="id" className="edit__label">
                  <FormattedMessage id="id" />
                </label>
                <input
                  type="text"
                  id="id"
                  className="input"
                  value={unit.id}
                  onChange={handleFieldChange}
                  autoComplete="off"
                  pattern="(([a-z]*-[a-z]*)|[a-z]*)*"
                />
                <div className="checkbox">
                  <input
                    type="checkbox"
                    id="named"
                    onChange={handleCheckboxChange}
                    checked={unit.named}
                    className="checkbox__input"
                  />
                  <label htmlFor="named" className="checkbox__label">
                    <FormattedMessage id="named" />
                  </label>
                </div>
                <label htmlFor="points">
                  <FormattedMessage id="points" />
                </label>
                <NumberInput
                  id="points"
                  className="input"
                  min={0}
                  value={unit.points}
                  onChange={handleFieldChange}
                  required
                />
                <label htmlFor="minimum">
                  <FormattedMessage id="minimum" />
                </label>
                <NumberInput
                  id="minimum"
                  className="input"
                  min={0}
                  value={unit.minimum}
                  onChange={handleFieldChange}
                  required
                />
                <label htmlFor="maximum">
                  <FormattedMessage id="maximum" />
                </label>
                <NumberInput
                  id="maximum"
                  className="input"
                  min={0}
                  value={unit.maximum}
                  onChange={handleFieldChange}
                  required
                />

                <Button submitButton>Add</Button>
              </form>
            </Expandable>

            <Expandable headline="Core Unit"></Expandable>

            <Expandable headline="Special Unit"></Expandable>

            <Expandable headline="Rare Unit"></Expandable>
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
