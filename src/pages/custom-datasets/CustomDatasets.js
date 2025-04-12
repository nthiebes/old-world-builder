import { useEffect, useState, createRef } from "react";
import { useLocation } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Header, Main } from "../../components/page";
import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { ErrorMessage } from "../../components/error-message";
import { Expandable } from "../../components/expandable";
import theOldWorld from "../../assets/the-old-world.json";

import "./CustomDatasets.css";

export const CustomDatasets = () => {
  const location = useLocation();
  const intl = useIntl();
  const [customGames, setCustomGames] = useState(
    JSON.parse(localStorage.getItem("owb.systems")) || []
  );
  const [customDatasets, setCustomDatasets] = useState(
    JSON.parse(localStorage.getItem("owb.datasets")) || []
  );
  const [gameFromFile, setGameFromFile] = useState(null);
  const [datasetFromFile, setDatasetFromFile] = useState(null);
  const [error, setError] = useState(false);
  const [typeError, setTypeError] = useState(false);
  const fileInput = createRef();
  const gameFileInput = createRef();
  const allDatasets = [
    ...customDatasets,
    ...theOldWorld.armies.map((army) => ({
      id: army.id,
      name: `${army.id}.json`,
    })),
  ];

  const handleDatasetChange = () => {
    const files = fileInput.current.files;

    if (files.length > 0) {
      if ("application/json" === files[0].type) {
        setTypeError(false);
        setDatasetFromFile(files[0]);
      } else {
        setTypeError(true);
      }
    }
  };

  const handleGameChange = () => {
    const files = gameFileInput.current.files;

    if (files.length > 0) {
      if ("application/json" === files[0].type) {
        setTypeError(false);
        setGameFromFile(files[0]);
      } else {
        setTypeError(true);
      }
    }
  };

  const addDataset = (newDataset) => {
    const importedDataset = {
      id: datasetFromFile.name.replace(".json", ""),
      name: datasetFromFile.name,
      data: newDataset,
    };
    const newDatasets = [...customDatasets, importedDataset];

    setCustomDatasets(newDatasets);
    localStorage.setItem("owb.datasets", JSON.stringify(newDatasets));
  };

  const deleteDataset = (id) => {
    const updatedDatasets = customDatasets.filter(
      (dataset) => dataset.id !== id
    );

    setCustomDatasets(updatedDatasets);
    localStorage.setItem("owb.datasets", JSON.stringify(updatedDatasets));
  };

  const handleSubmit = (event) => {
    const reader = new FileReader();

    setError(false);
    reader.readAsText(datasetFromFile, "UTF-8");
    reader.onload = (event) => {
      addDataset(JSON.parse(event.target.result));
    };
    reader.onerror = () => {
      setError(true);
    };

    event.preventDefault();
  };

  const addGame = (game) => {
    const newGames = [...customGames, game];

    setCustomGames(newGames);
    localStorage.setItem("owb.systems", JSON.stringify(newGames));
  };

  const deleteGame = (id) => {
    const updatedGames = customGames.filter((game) => game.id !== id);

    setCustomGames(updatedGames);
    localStorage.setItem("owb.systems", JSON.stringify(updatedGames));
  };

  const handleGameSubmit = (event) => {
    const reader = new FileReader();

    setError(false);
    reader.readAsText(gameFromFile, "UTF-8");
    reader.onload = (event) => {
      addGame(JSON.parse(event.target.result));
    };
    reader.onerror = () => {
      setError(true);
    };

    event.preventDefault();
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>
          {`Old World Builder | ${intl.formatMessage({
            id: "footer.custom-datasets",
          })}`}
        </title>
        <link
          rel="canonical"
          href="https://old-world-builder.com/custom-datasets"
        />
      </Helmet>

      <Header headline="Old World Builder" hasMainNavigation hasHomeButton />

      <Main compact className="custom">
        <h2 className="page-headline">
          <FormattedMessage id="footer.custom-datasets" />
        </h2>
        <p>Manage and add custom game systems and datasets.</p>
        <p className="unit__notes">
          <Icon symbol="error" className="unit__notes-icon" />
          Custom game systems also utilize ToW's list validation and magic
          items. Game systems that are not derived from ToW and have different
          rules are currently not supported (e.g., Warhammer 40k).
        </p>
        <p className="unit__notes">
          <Icon symbol="error" className="unit__notes-icon" />
          <span>
            Each new army in a custom game system needs a dataset with the same
            file name as the army ID.
          </span>
        </p>
        <p className="unit__notes">
          <Icon symbol="error" className="unit__notes-icon" />
          In a custom game system, custom datasets overwrite existing datasets
          with the same file name.
        </p>

        <section className="column custom__column">
          <header className="editor__header">
            <h2>Game systems</h2>
          </header>
          <ul>
            <li className="list" key={theOldWorld.id}>
              <div className="list__inner">{theOldWorld.name}</div>
            </li>
            {customGames.map((game) => (
              <Expandable
                headline={
                  <span className="dataset__unit-header">
                    <b>{game.name}</b>
                    <Button
                      type="text"
                      icon="delete"
                      color="dark"
                      label="Delete game system"
                      onClick={() => deleteGame(game.id)}
                    ></Button>
                  </span>
                }
                open
                noMargin
                className="datasets__unit"
                key={game.id}
              >
                {game.armies.map((army) => {
                  const dataset = allDatasets.find(
                    (dataset) => dataset.id === army.id
                  );
                  const isCustom = Boolean(dataset?.data);

                  return (
                    <p className="custom__army" key={army.id}>
                      <span>
                        <b>{army.name_en}</b>
                        <br />
                        <i>
                          {`${army.id}.json`}
                          {isCustom && " (custom)"}
                        </i>
                        {!dataset && (
                          <i className="error-message">
                            No dataset found with the same file name.
                          </i>
                        )}
                      </span>
                      {dataset ? (
                        <Icon symbol="check" color="green" />
                      ) : (
                        <Icon symbol="error" color="red" />
                      )}
                    </p>
                  );
                })}
              </Expandable>
            ))}
          </ul>
        </section>

        <br />

        <section>
          <h2>Add a custom game system</h2>
          <p>
            Template file:
            <a
              className="custom__link"
              target="_blank"
              rel="noreferrer"
              href="https://github.com/nthiebes/old-world-builder/blob/main/src/assets/the-old-world.json"
            >
              the-old-world.json
            </a>
          </p>
          <form onSubmit={handleGameSubmit}>
            <label htmlFor="system-file">Select a .json file:</label>
            <input
              type="file"
              accept=".json, application/json"
              id="system-file"
              className="input"
              onChange={handleGameChange}
              autoComplete="off"
              required
              ref={gameFileInput}
            />
            <Button
              centered
              icon="add-list"
              submitButton
              spaceTop
              size="large"
              lo
            >
              Add game system
            </Button>
          </form>
        </section>

        <hr />

        <section className="column custom__column">
          <header className="editor__header">
            <h2>Datasets</h2>
          </header>
          <ul>
            {theOldWorld.armies.map((game) => (
              <li className="list" key={game.id}>
                <div className="list__inner">
                  {game.name_en}
                  <Button
                    type="text"
                    icon="download"
                    color="dark"
                    download={`${game.id}.json`}
                    label="Download dataset"
                    href={`/games/the-old-world/${game.id}.json`}
                  ></Button>
                </div>
              </li>
            ))}
            {customDatasets.map((dataset) => (
              <li className="list" key={dataset.id}>
                <div className="list__inner">
                  <b>{dataset.name}</b>
                  <Button
                    type="text"
                    icon="delete"
                    color="dark"
                    label="Delete dataset"
                    onClick={() => deleteDataset(dataset.id)}
                  ></Button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <br />

        <section>
          <h2>Add a custom dataset</h2>
          <p>
            <a
              target="_blank"
              rel="noreferrer"
              href="https://github.com/nthiebes/old-world-builder/blob/main/docs/datasets.md"
            >
              Datasets documentation
            </a>
          </p>
          <form onSubmit={handleSubmit}>
            <label htmlFor="dataset-file">Select a .json file:</label>
            <input
              type="file"
              accept=".json, application/json"
              id="dataset-file"
              className="input"
              onChange={handleDatasetChange}
              autoComplete="off"
              required
              ref={fileInput}
            />
            {typeError && (
              <p className="export__error">
                <FormattedMessage id="import.typeError" />
              </p>
            )}
            {error && (
              <p className="export__error">
                <FormattedMessage id="export.error" />
              </p>
            )}
            <Button
              centered
              icon="add-list"
              submitButton
              spaceTop
              size="large"
              lo
            >
              Add dataset
            </Button>
          </form>
        </section>
      </Main>
    </>
  );
};
