import classNames from "classnames";
import PropTypes from "prop-types";

import { Button } from "../../components/button";
import { Icon } from "../../components/icon";

import "./Page.css";

export const Header = ({
  className,
  backButton,
  headline,
  subheadline,
  moreButton,
}) => {
  return (
    <header className={classNames("header", className)}>
      {backButton && (
        <Button to="/">
          <Icon symbol="back" />
        </Button>
      )}
      <div className="header__text">
        {headline && <h1 className="header__name">{headline}</h1>}
        {subheadline && <p className="header__points">{subheadline}</p>}
      </div>
      {moreButton && (
        <Button label="Mehr Optionen">
          <Icon symbol="more" />
        </Button>
      )}
    </header>
  );
};

Header.propTypes = {
  className: PropTypes.string,
  backButton: PropTypes.bool,
  headline: PropTypes.string,
  subheadline: PropTypes.string,
  children: PropTypes.node,
  moreButton: PropTypes.bool,
};

export const Main = ({ className, children }) => {
  return <main className={classNames("main", className)}>{children}</main>;
};
