import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import classNames from "classnames";

import { Icon } from "../icon";
import { Button } from "../button";

import "./Dialog.css";

export const Dialog = ({ open, onClose, children }) => {
  const dialogRef = useRef(null);
  const handleClose = () => {
    dialogRef.current.close();
    onClose();
  };
  useEffect(() => {
    if (open) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [open]);

  return (
    <dialog className="dialog" ref={dialogRef} onClose={handleClose}>
      <Button
        className="unit-preview__close"
        icon="close"
        type="text"
        label="Close dialog"
        color="dark"
        onClick={handleClose}
      />
      {children}
    </dialog>
  );
};

Dialog.propTypes = {};

Dialog.defaultProps = {};
