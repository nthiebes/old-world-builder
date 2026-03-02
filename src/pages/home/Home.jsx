import { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";
import classNames from "classnames";

import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { ListItem, OrderableList } from "../../components/list";
import { Header, Main } from "../../components/page";
import { Dialog } from "../../components/dialog";
import { getAllPoints } from "../../utils/points";
import { useTimezone } from "../../utils/useTimezone";
import { setArmy } from "../../state/army";
import { setItems } from "../../state/items";
import owb from "../../assets/army-icons/owb.svg";
import theEmpire from "../../assets/army-icons/the-empire.svg";
import dwarfs from "../../assets/army-icons/dwarfs.svg";
import greenskins from "../../assets/army-icons/greenskins.svg";
import beastmen from "../../assets/army-icons/beastmen.svg";
import chaosDeamons from "../../assets/army-icons/chaos-deamons.svg";
import chaosWarriors from "../../assets/army-icons/chaos-warriors.svg";
import darkElves from "../../assets/army-icons/dark-elves.svg";
import highElves from "../../assets/army-icons/high-elves.svg";
import lizardmen from "../../assets/army-icons/lizardmen.svg";
import ogres from "../../assets/army-icons/ogres.svg";
import skaven from "../../assets/army-icons/skaven.svg";
import tombKings from "../../assets/army-icons/tomb-kings.svg";
import vampireCounts from "../../assets/army-icons/vampire-counts.svg";
import woodElves from "../../assets/army-icons/wood-elves.svg";
import chaosDwarfs from "../../assets/army-icons/chaos-dwarfs.svg";
import bretonnia from "../../assets/army-icons/bretonnia.svg";
import cathay from "../../assets/army-icons/cathay.svg";
import renegade from "../../assets/army-icons/renegade.svg";
import forg3dBanner from "../../assets/forg3d.jpg";
import fantasyweltDe from "../../assets/fantasywelt_de.jpg";
import fantasyweltEn from "../../assets/fantasywelt_en.jpg";
import mwgForge from "../../assets/mwg-forge.gif";
import { swap } from "../../utils/collection";
import { useLanguage } from "../../utils/useLanguage";
import { updateLocalList, updateListsFolder } from "../../utils/list";
import { setLists, toggleFolder, updateList } from "../../state/lists";
import { updateSetting } from "../../state/settings";
import { getRandomId } from "../../utils/id";

import "./Home.css";

const armyIconMap = {
  "the-empire": theEmpire,
  dwarfs: dwarfs,
  greenskins: greenskins,
  "empire-of-man": theEmpire,
  "orc-and-goblin-tribes": greenskins,
  "dwarfen-mountain-holds": dwarfs,
  "warriors-of-chaos": chaosWarriors,
  "kingdom-of-bretonnia": bretonnia,
  "beastmen-brayherds": beastmen,
  "wood-elf-realms": woodElves,
  "tomb-kings-of-khemri": tombKings,
  "high-elf-realms": highElves,
  "dark-elves": darkElves,
  skaven: skaven,
  "vampire-counts": vampireCounts,
  "daemons-of-chaos": chaosDeamons,
  "ogre-kingdoms": ogres,
  lizardmen: lizardmen,
  "chaos-dwarfs": chaosDwarfs,
  "grand-cathay": cathay,
  "renegade-crowns": renegade,
};

export const Home = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const settings = useSelector((state) => state.settings);
  let lists = updateListsFolder(useSelector((state) => state.lists));

  // Sort lists based on the current sorting setting
  switch (settings.listSorting) {
    case "nameAsc":
      lists = [...lists].sort((a, b) => {
        if (
          !a.folder &&
          !b.folder &&
          a.type !== "folder" &&
          b.type !== "folder"
        ) {
          return a.name.localeCompare(b.name);
        }

        if (
          a.folder &&
          a.folder === b.folder &&
          a.type !== "folder" &&
          b.type !== "folder"
        ) {
          return a.name.localeCompare(b.name);
        }

        return 0;
      });
      break;
    case "nameDesc":
      lists = [...lists].sort((a, b) => {
        if (
          !a.folder &&
          !b.folder &&
          a.type !== "folder" &&
          b.type !== "folder"
        ) {
          return b.name.localeCompare(a.name);
        }

        if (
          a.folder &&
          a.folder === b.folder &&
          a.type !== "folder" &&
          b.type !== "folder"
        ) {
          return b.name.localeCompare(a.name);
        }

        return 0;
      });
      break;
    case "faction":
      lists = [...lists].sort((a, b) => {
        if (
          !a.folder &&
          !b.folder &&
          a.type !== "folder" &&
          b.type !== "folder" &&
          a.army &&
          b.army
        ) {
          return a.army.localeCompare(b.army);
        }

        if (
          a.folder &&
          a.folder === b.folder &&
          a.type !== "folder" &&
          b.type !== "folder" &&
          a.army &&
          b.army
        ) {
          return a.army.localeCompare(b.army);
        }

        return 0;
      });
      break;
    default:
      break;
  }

  const location = useLocation();
  const { language } = useLanguage();
  const { timezone } = useTimezone();
  const dispatch = useDispatch();
  const intl = useIntl();
  const [listsInFolder, setListsInFolder] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(null);
  const [activeMenu, setActiveMenu] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [activeDeleteOption, setActiveDeleteOption] = useState("delete");
  const resetState = () => {
    dispatch(setArmy(null));
    dispatch(setItems(null));
  };
  const updateLocalSettings = (newSettings) => {
    localStorage.setItem("owb.settings", JSON.stringify(newSettings));
  };
  const handleListMoved = ({ sourceIndex, destinationIndex }) => {
    const draggedItem = lists.find((list, index) => index === sourceIndex);
    const difference = sourceIndex - destinationIndex;

    setListsInFolder([]);

    if (difference === 0) {
      return;
    }

    if (draggedItem.type === "folder") {
      const listBeforeDestination = lists.find(
        (_, index) => index === destinationIndex - 1,
      );
      const listAtDestination = lists.find(
        (_, index) => index === destinationIndex,
      );
      const listAfterDestination = lists.find(
        (_, index) => index === destinationIndex + 1,
      );

      if (
        !listBeforeDestination ||
        !listAfterDestination ||
        (difference > 0 && listAtDestination.type === "folder") || // Moving up
        (difference < 0 && listAfterDestination.type === "folder") // Moving down
      ) {
        let newLists = swap(lists, sourceIndex, destinationIndex);
        const listsInFolder = lists.filter(
          (list) => list.folder === draggedItem.id,
        );

        listsInFolder.forEach((_, index) => {
          newLists = swap(
            newLists,
            sourceIndex + (destinationIndex < sourceIndex ? 1 + index : 0),
            destinationIndex + (destinationIndex < sourceIndex ? 1 + index : 0),
          );
        });
        newLists = updateListsFolder(newLists);

        localStorage.setItem("owb.lists", JSON.stringify(newLists));
        dispatch(setLists(newLists));

        const newSettings = { ...settings, lastChanged: new Date().toString() };
        dispatch(updateSetting({ lastChanged: newSettings.lastChanged }));
        localStorage.setItem("owb.settings", JSON.stringify(newSettings));
      }
    } else {
      let newLists = updateListsFolder(
        swap(lists, sourceIndex, destinationIndex),
      );

      localStorage.setItem("owb.lists", JSON.stringify(newLists));
      dispatch(setLists(newLists));

      const newSettings = { ...settings, lastChanged: new Date().toString() };
      dispatch(updateSetting({ lastChanged: newSettings.lastChanged }));
      localStorage.setItem("owb.settings", JSON.stringify(newSettings));
    }
  };
  const folders = lists.filter((list) => list.type === "folder");
  const listsWithoutFolders = lists.filter((list) => list.type !== "folder");
  const moreButtonsFolder = [
    {
      name: intl.formatMessage({
        id: "misc.rename",
      }),
      icon: "edit",
      callback: ({ name }) => {
        setFolderName(name);
        setDialogOpen("edit");
      },
    },
    {
      name: intl.formatMessage({
        id: "misc.delete",
      }),
      icon: "delete",
      callback: ({ name }) => {
        setFolderName(name);
        setActiveDeleteOption("delete");
        setDialogOpen("delete");
      },
    },
  ];
  const moreButtonsSort = [
    {
      name: intl.formatMessage({
        id: "misc.manual",
      }),
      type: "manual",
      callback: () => {
        setSortMenuOpen(false);
        updateLocalSettings({
          ...settings,
          listSorting: "manual",
        });
        dispatch(
          updateSetting({
            listSorting: "manual",
            lastChanged: new Date().toString(),
          }),
        );
      },
    },
    {
      name: intl.formatMessage({
        id: "misc.faction",
      }),
      type: "faction",
      callback: () => {
        setSortMenuOpen(false);
        updateLocalSettings({
          ...settings,
          listSorting: "faction",
        });
        dispatch(
          updateSetting({
            listSorting: "faction",
            lastChanged: new Date().toString(),
          }),
        );
      },
    },
    {
      name: intl.formatMessage({
        id: "misc.nameAsc",
      }),
      type: "nameAsc",
      callback: () => {
        setSortMenuOpen(false);
        updateLocalSettings({
          ...settings,
          listSorting: "nameAsc",
        });
        dispatch(
          updateSetting({
            listSorting: "nameAsc",
            lastChanged: new Date().toString(),
          }),
        );
      },
    },
    {
      name: intl.formatMessage({
        id: "misc.nameDesc",
      }),
      type: "nameDesc",
      callback: () => {
        setSortMenuOpen(false);
        updateLocalSettings({
          ...settings,
          listSorting: "nameDesc",
        });
        dispatch(
          updateSetting({
            listSorting: "nameDesc",
            lastChanged: new Date().toString(),
          }),
        );
      },
    },
  ];
  const handleCancelClick = (event) => {
    event.preventDefault();
    setDialogOpen(null);
    setActiveMenu(null);
    setFolderName("");
  };
  const handleDeleteConfirm = () => {
    let newLists = lists.filter((list) => list.id !== activeMenu);

    if (activeDeleteOption === "delete") {
      newLists = newLists.filter(
        (list) => list.folder !== activeMenu || !list.folder,
      );
    }

    newLists = updateListsFolder(newLists);

    setDialogOpen(null);
    setActiveMenu(null);
    dispatch(setLists(newLists));
    localStorage.setItem("owb.lists", JSON.stringify(newLists));

    const newSettings = { ...settings, lastChanged: new Date().toString() };
    dispatch(updateSetting({ lastChanged: newSettings.lastChanged }));
    localStorage.setItem("owb.settings", JSON.stringify(newSettings));
  };
  const handleEditConfirm = () => {
    const list = lists.find((list) => list.id === activeMenu);

    setDialogOpen(null);
    setActiveMenu(null);
    dispatch(updateList({ ...list, listId: list.id, name: folderName }));
    updateLocalList({
      ...list,
      name: folderName,
    });

    const newSettings = { ...settings, lastChanged: new Date().toString() };
    dispatch(updateSetting({ lastChanged: newSettings.lastChanged }));
    localStorage.setItem("owb.settings", JSON.stringify(newSettings));
  };
  const handleNewConfirm = () => {
    const newLists = updateListsFolder([
      {
        id: `folder-${getRandomId()}`,
        name: folderName || intl.formatMessage({ id: "home.newFolder" }),
        type: "folder",
        open: true,
      },
      ...lists,
    ]);

    localStorage.setItem("owb.lists", JSON.stringify(newLists));
    dispatch(setLists(newLists));

    const newSettings = { ...settings, lastChanged: new Date().toString() };
    dispatch(updateSetting({ lastChanged: newSettings.lastChanged }));
    localStorage.setItem("owb.settings", JSON.stringify(newSettings));

    setFolderName("");
    setDialogOpen(null);
    window.scrollTo(0, 0);
  };
  const handleDragStart = (start) => {
    const draggedItem = lists.find(
      (list) =>
        list.id === start.draggableId || list.folder === start.draggableId,
    );
    const listsInFolder = lists
      .map((list, index) => ({ folder: list.folder, index: index }))
      .filter((list) => list.folder);

    if (draggedItem.type === "folder") {
      setListsInFolder(listsInFolder);
    }
  };
  const handleDeleteOptionChange = (option) => {
    setActiveDeleteOption(option);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>
          Old World Builder - Army builder for Warhammer: The Old World
        </title>
        <link rel="canonical" href="https://old-world-builder.com/" />
      </Helmet>

      <Dialog
        open={dialogOpen === "delete"}
        onClose={() => setDialogOpen(null)}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDeleteConfirm();
          }}
        >
          <p className="home__delete-text">
            <FormattedMessage
              id="home.confirmDelete"
              values={{
                folder: <b>{folderName}</b>,
              }}
            />
          </p>
          <div className="radio">
            <input
              type="radio"
              id="delete-lists"
              name="lists"
              value="delete"
              onChange={() => handleDeleteOptionChange("delete")}
              checked={activeDeleteOption === "delete"}
              className="radio__input"
            />
            <label htmlFor="delete-lists" className="radio__label">
              <span className="unit__label-text">
                <FormattedMessage id="home.deleteLists" />
              </span>
            </label>
          </div>
          <div className="radio">
            <input
              type="radio"
              id="keep-lists"
              name="lists"
              value="keep"
              onChange={() => handleDeleteOptionChange("keep")}
              checked={activeDeleteOption === "keep"}
              className="radio__input"
            />
            <label htmlFor="keep-lists" className="radio__label">
              <span className="unit__label-text">
                <FormattedMessage id="home.keepLists" />
              </span>
            </label>
          </div>
          <div className="editor__delete-dialog">
            <Button
              type="text"
              onClick={handleCancelClick}
              icon="close"
              spaceTop
              color="dark"
            >
              <FormattedMessage id="misc.cancel" />
            </Button>
            <Button type="primary" submitButton icon="delete" spaceTop>
              <FormattedMessage id="misc.delete" />
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={dialogOpen === "edit"} onClose={() => setDialogOpen(null)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleEditConfirm();
          }}
        >
          <label htmlFor="folderName">
            <FormattedMessage id="misc.folderName" />
          </label>
          <input
            type="text"
            id="folderName"
            className="input"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            autoComplete="off"
            maxLength="100"
            required
          />
          <div className="editor__delete-dialog">
            <Button
              type="text"
              onClick={handleCancelClick}
              icon="close"
              spaceTop
              color="dark"
            >
              <FormattedMessage id="misc.cancel" />
            </Button>
            <Button type="primary" submitButton icon="check" spaceTop>
              <FormattedMessage id="misc.confirm" />
            </Button>
          </div>
        </form>
      </Dialog>

      <Dialog open={dialogOpen === "new"} onClose={() => setDialogOpen(null)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNewConfirm();
          }}
        >
          <label htmlFor="newFolderName">
            <FormattedMessage id="misc.folderName" />
          </label>
          <input
            type="text"
            id="newFolderName"
            className="input"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            autoComplete="off"
            maxLength="100"
            required
          />
          <div className="editor__delete-dialog">
            <Button
              type="text"
              onClick={handleCancelClick}
              icon="close"
              spaceTop
              color="dark"
            >
              <FormattedMessage id="misc.cancel" />
            </Button>
            <Button type="primary" submitButton icon="check" spaceTop>
              <FormattedMessage id="misc.confirm" />
            </Button>
          </div>
        </form>
      </Dialog>

      {isMobile && <Header headline="Old World Builder" hasMainNavigation />}
      <MainComponent>
        {listsWithoutFolders.length > 0 && (
          <section className="column-header home__header">
            <Button
              type="text"
              label={intl.formatMessage({ id: "home.newFolder" })}
              color="dark"
              icon="new-folder"
              onClick={() => {
                setFolderName("");
                setDialogOpen("new");
              }}
            >
              <FormattedMessage id="home.newFolder" />
            </Button>
            <Button
              type="text"
              label={intl.formatMessage({ id: "misc.sort" })}
              color="dark"
              onClick={() => {
                setSortMenuOpen(!sortMenuOpen);
              }}
              className={classNames(sortMenuOpen && "header__more-button")}
            >
              <FormattedMessage
                id={`misc.${settings.listSorting || "manual"}`}
              />
              <Icon symbol="sort" className="home__sort-icon" />
            </Button>
            {sortMenuOpen && (
              <ul className="header__more">
                {moreButtonsSort.map(
                  ({ callback, name, type, to: moreButtonTo }) => (
                    <li key={name}>
                      <Button
                        type="text"
                        onClick={() => callback({ type })}
                        to={moreButtonTo}
                      >
                        {name}
                      </Button>
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>
        )}

        <hr className="home__divider" />

        {listsWithoutFolders.length === 0 && (
          <>
            <img
              src={owb}
              alt=""
              width="100"
              height="100"
              className="home__logo"
            />
            <i className="home__empty">
              <FormattedMessage id="home.empty" />
            </i>
          </>
        )}
        <OrderableList
          id="armies"
          onMoved={handleListMoved}
          onDragStart={handleDragStart}
        >
          {lists.map(
            ({
              id,
              name,
              description,
              points,
              game,
              army,
              type,
              folder,
              open,
              ...list
            }) =>
              type === "folder" ? (
                <ListItem
                  key={id}
                  to="#"
                  className={classNames(
                    "home__folder",
                    activeMenu === id && "home__folder--active",
                  )}
                >
                  <span className="home__list-item">
                    <h2 className="home__headline home__headline--folder">
                      <Button
                        type="text"
                        label={intl.formatMessage({
                          id: "export.optionsTitle",
                        })}
                        color="dark"
                        icon="more"
                        onClick={() => {
                          if (activeMenu === id) {
                            setActiveMenu(null);
                          } else {
                            setActiveMenu(id);
                          }
                        }}
                        className={classNames(
                          activeMenu === id && "header__more-button",
                        )}
                      />
                      <span className="home__folder-name">{name}</span>
                      <Button
                        type="text"
                        label={
                          open
                            ? intl.formatMessage({ id: "misc.collapseFolder" })
                            : intl.formatMessage({ id: "misc.expandFolder" })
                        }
                        color="dark"
                        icon={open ? "collapse" : "expand"}
                        onClick={() => {
                          updateLocalList({
                            id,
                            name,
                            type,
                            open: !open,
                          });
                          dispatch(toggleFolder({ folderId: id }));
                        }}
                      />
                    </h2>
                  </span>
                  {activeMenu === id && (
                    <ul className="header__more folder__more">
                      {moreButtonsFolder.map(
                        ({
                          callback,
                          name: buttonName,
                          icon,
                          to: moreButtonTo,
                        }) => (
                          <li key={buttonName}>
                            <Button
                              type="text"
                              onClick={() => callback({ name })}
                              to={moreButtonTo}
                              icon={icon}
                            >
                              {buttonName}
                            </Button>
                          </li>
                        ),
                      )}
                    </ul>
                  )}
                </ListItem>
              ) : (
                <ListItem
                  key={id}
                  to={`/editor/${id}`}
                  active={location.pathname.includes(id)}
                  onClick={resetState}
                  hide={
                    folders.find((folderData) => folderData.id === folder)
                      ?.open === false
                  }
                  className={classNames(
                    listsInFolder.length > 0 && "home__list--dragging",
                  )}
                >
                  {folder ? (
                    <Icon symbol="folder" className="home__folder-icon" />
                  ) : null}
                  <span className="home__list-item">
                    <h2 className="home__headline">{name}</h2>
                    {description && (
                      <p className="home__description">{description}</p>
                    )}
                    <p className="home__points">
                      {getAllPoints({
                        ...list,
                        points,
                      })}{" "}
                      / {points} <FormattedMessage id="app.points" />
                    </p>
                  </span>
                  <div className="home__info">
                    <img
                      height="40"
                      width="40"
                      src={armyIconMap[army] || owb}
                      alt=""
                    />
                  </div>
                </ListItem>
              ),
          )}
        </OrderableList>
        <Button
          centered
          to="/new"
          icon="new-list"
          spaceTop
          onClick={resetState}
          size="large"
        >
          <FormattedMessage id="home.newList" />
        </Button>
        <Button
          centered
          to="/import"
          type="text"
          icon="import"
          color="dark"
          spaceTop
          onClick={resetState}
        >
          <FormattedMessage id="home.import" />
        </Button>

        <hr />

        <p>
          <b>
            <i>
              <FormattedMessage id="home.sponsored" />
            </i>
          </b>
        </p>

        <a
          className="home__banner-link"
          href="https://tinyurl.com/Forg3dOWB"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img
            src={forg3dBanner}
            className="home__banner-image"
            alt={intl.formatMessage({ id: "home.forg3d" })}
            loading="lazy"
          />
        </a>

        {timezone === "europe" ? (
          <a
            className="home__banner-link"
            href={`https://www.fantasywelt.de/?wsa=jcdi7h53acjhc${
              language === "de" ? "&lang=ger" : "&lang=eng"
            }`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={language === "de" ? fantasyweltDe : fantasyweltEn}
              className="home__banner-image"
              alt={intl.formatMessage({ id: "home.fantasywelt" })}
              loading="lazy"
            />
          </a>
        ) : (
          <a
            className="home__banner-link"
            href="https://miniwargamingforge.com?sca_ref=6115787.XxehNS6tUCHiFExD"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={mwgForge}
              className="home__banner-image"
              alt={intl.formatMessage({ id: "home.mwgForge" })}
              loading="lazy"
            />
          </a>
        )}
      </MainComponent>
    </>
  );
};
