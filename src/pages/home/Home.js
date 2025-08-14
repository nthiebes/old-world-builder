import { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { FormattedMessage, useIntl } from "react-intl";
import { Helmet } from "react-helmet-async";

import { Button } from "../../components/button";
import { Icon } from "../../components/icon";
import { ListItem, OrderableList } from "../../components/list";
import { Header, Main } from "../../components/page";
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
import forg3dBanner from "../../assets/forg3d.jpg";
import fantasyweltDe from "../../assets/fantasywelt_de.jpg";
import fantasyweltEn from "../../assets/fantasywelt_en.jpg";
import mwgForge from "../../assets/mwg-forge.gif";
import { swap } from "../../utils/collection";
import { useLanguage } from "../../utils/useLanguage";
import { setLists, toggleFolder } from "../../state/lists";
import { getRandomId } from "../../utils/id";
import { updateListsFolder, updateLocalList } from "../../utils/list";

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
};

export const Home = ({ isMobile }) => {
  const MainComponent = isMobile ? Main : Fragment;
  const lists = useSelector((state) => state.lists);
  const location = useLocation();
  const { language } = useLanguage();
  const { timezone } = useTimezone();
  const dispatch = useDispatch();
  const intl = useIntl();
  const resetState = () => {
    dispatch(setArmy(null));
    dispatch(setItems(null));
  };
  const handleListMoved = ({ sourceIndex, destinationIndex }) => {
    const newLists = updateListsFolder(
      swap(lists, sourceIndex, destinationIndex)
    );

    localStorage.setItem("owb.lists", JSON.stringify(newLists));
    dispatch(setLists(newLists));
  };
  const folders = lists.filter((list) => list.type === "folder");
  const listsWithoutFolders = lists.filter((list) => list.type !== "folder");

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

      {isMobile && <Header headline="Old World Builder" hasMainNavigation />}
      <MainComponent>
        {listsWithoutFolders.length > 0 && (
          <section>
            <Button
              type="text"
              label={intl.formatMessage({ id: "home.newFolder" })}
              color="dark"
              icon="new-folder"
              onClick={() => {
                const newLists = [
                  {
                    id: `folder-${getRandomId()}`,
                    name: "New folder",
                    type: "folder",
                    open: true,
                  },
                  ...lists,
                ];
                localStorage.setItem("owb.lists", JSON.stringify(newLists));
                dispatch(setLists(newLists));
              }}
            />
          </section>
        )}

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
        <OrderableList id="armies" onMoved={handleListMoved}>
          {lists.map(
            (
              {
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
              },
              index
            ) =>
              type === "folder" ? (
                <ListItem key={index} to="#" className="home__folder">
                  <span className="home__list-item">
                    <h2 className="home__headline">
                      <Icon className="" symbol="folder" />
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
                </ListItem>
              ) : (
                <ListItem
                  key={index}
                  to={`/editor/${id}`}
                  active={location.pathname.includes(id)}
                  onClick={resetState}
                  hide={
                    folders.find((folderData) => folderData.id === folder)
                      ?.open === false
                  }
                >
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
              )
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
