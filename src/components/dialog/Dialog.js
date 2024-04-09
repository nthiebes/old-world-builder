import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useIntl } from "react-intl";

import { Button } from "../button";

import "./Dialog.css";

export const Dialog = ({ open, onClose, children }) => {
  const dialogRef = useRef(null);
  const intl = useIntl();
  const handleClose = () => {
    dialogRef?.current?.close && dialogRef.current.close();
    onClose();
  };
  const handleClick = (event) => {
    if (event.target.className === "dialog") {
      handleClose();
    }
  };
  useEffect(() => {
    if (open) {
      dialogRef?.current?.showModal && dialogRef.current.showModal();
    } else {
      dialogRef?.current?.close && dialogRef.current.close();
    }
  }, [open]);

  return (
    <dialog
      className="dialog"
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleClick}
    >
      <div className="dialog__content">
        <Button
          className="dialog__close"
          icon="close"
          type="text"
          label={intl.formatMessage({ id: "header.close" })}
          color="dark"
          onClick={handleClose}
        />
        {children}
      </div>
    </dialog>
  );
};

Dialog.propTypes = {
  open: PropTypes.bool,
  children: PropTypes.node,
  onClose: PropTypes.func,
};
