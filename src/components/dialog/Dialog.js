import React, { useRef, useEffect } from "react";
import PropTypes from "prop-types";

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
        className="dialog__close"
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

Dialog.propTypes = {
  open: PropTypes.bool,
  children: PropTypes.node,
  onClose: PropTypes.func,
};
