import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { fetcher } from "../../utils/fetcher";
import { getRandomId } from "../../utils/id";

import "./Editor.css";

const updateList = (updatedList) => {
  const localLists = JSON.parse(localStorage.getItem("lists"));
  const updatedLists = localLists.map((list) => {
    if (list.id === updatedList.id) {
      return updatedList;
    } else {
      return list;
    }
  });

  localStorage.setItem("lists", JSON.stringify(updatedLists));
};

export const Editor = () => {
  const { id } = useParams();
  const [army, setArmy] = useState(null);
  const [list, setList] = useState(null);

  const addLord = () => {
    const lord = {
      name: "Grimgork Eisenpelz",
    };

    setList({
      ...list,
      lords: [...list.lords, lord],
    });
    updateList({
      ...list,
      lords: [...list.lords, lord],
    });
  };

  useEffect(() => {
    const localLists = JSON.parse(localStorage.getItem("lists"));
    const localList = localLists.find(({ id: localId }) => id === localId);

    setList(localList);

    fetcher({
      url: `armies/${id}`,
      onSuccess: (data) => {
        setArmy(data);
      },
    });
  }, [id]);

  if (!list) {
    return null;
  }

  return (
    <>
      <header className="header">
        <div className="title">
          <h1>
            {list.name} <button className="button">Edit</button>
          </h1>
          <p>{list.points} Punkte</p>
        </div>
        <Link to="/">Zurück</Link>
      </header>
      <main>
        <header className="list__header">
          <h2>
            Kommandanten
            {/* <br /> */}
            {/* <span>(123 Pkte.)</span> */}
          </h2>
          <div className="list__points">
            <p>
              {/* <b>123 Punkte</b> (Max. 300) */}
              123 / 300 Punkte
            </p>
            <progress value="130" max="300" className="progress">
              130 Pkte.
            </progress>
          </div>
          <button className="button" onClick={addLord}>
            Neu +
          </button>
        </header>
        <ul>
          {list &&
            list.lords.map(({ name }, index) => <li key={index}>{name}</li>)}
        </ul>
        <header className="list__header">
          <h2>Helden</h2>
          <div className="list__points">
            <p>
              <b>220 / 300</b> Punkte
            </p>
            <progress value="220" max="300" className="progress--red">
              220 Pkte.
            </progress>
          </div>
          <button className="button">Neu +</button>
        </header>
        <header className="list__header">
          <h2>Kerneinheiten</h2>
        </header>
        <header className="list__header">
          <h2>Eliteeinheiten</h2>
        </header>
        <header className="list__header">
          <h2>Seltene Einheiten</h2>
        </header>
      </main>
    </>
  );
};
