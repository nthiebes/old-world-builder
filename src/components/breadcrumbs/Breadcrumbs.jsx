import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { FormattedMessage } from "react-intl";

import "./Breadcrumbs.css";

export const Breadcrumbs = ({ pagename }) => {
  return (
    <nav className="breadcrumbs">
      <Link to="/">
        <FormattedMessage id="misc.startpage" />
      </Link>
      {" > "}
      <FormattedMessage id={pagename} />
    </nav>
  );
};

Breadcrumbs.propTypes = {
  pagename: PropTypes.string,
};
