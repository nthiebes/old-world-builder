import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { NumberInput } from "../../components/number-input";
import { Button } from "../../components/button";

import "./Datasets.css";

export const Datasets = () => {
  const location = useLocation();
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
    lords: [],
    heroes: [],
    core: [],
    special: [],
    rare: [],
  });
  const intl = useIntl();
  const handleSubmit = (event) => {
    event.preventDefault();

    setDataset({
      ...dataset,
      lords: [...dataset.lords, unit],
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
        <Button to="/" icon="home" centered>
          <FormattedMessage id="misc.startpage" />
        </Button>

        <h2>
          <FormattedMessage id="datasets.title" />
        </h2>
        <p>Load dataset from server or by text?</p>
        <p>create new dataset?</p>

        <h3>
          <FormattedMessage id="Lords" />
        </h3>

        <div className="datasets__columns">
          <section className="column">
            <form onSubmit={handleSubmit} className="">
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
              <div className="checkbox export__visible-checkbox">
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
          </section>

          <section className="column">
            <textarea
              cols="30"
              rows="30"
              value={JSON.stringify(dataset, null, 2)}
            />
          </section>
        </div>
      </Main>
    </>
  );
};
