// import { useState } from "react";
import { useParams } from "react-router-dom";

import "./List.css";

export const List = () => {
  let { id } = useParams();
  // const [bla, banana] = useState(0);

  console.log(id);

  return (
    <section>
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
        <button className="button">Neu +</button>
      </header>
      <ul>
        <li>
          <a href="">
            König <span>343 Pkte.</span>
          </a>
        </li>
        <li>
          <a href="">
            Runenmeister <span>343 Pkte.</span>
          </a>
        </li>
      </ul>
      <header className="list__header">
        <h2>Kerneinheiten</h2>
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
    </section>
  );
};
