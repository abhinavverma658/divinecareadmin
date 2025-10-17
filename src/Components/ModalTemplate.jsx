import React from "react";
import { Modal } from "react-bootstrap";

function ModalTemplate({
    size='md',
  show,
  onHide,
  title,
  children
}) {
  return (
    <Modal show={show} onHide={onHide} centered size={size} scrollable>
        <Modal.Header closeButton className="py-1"><h5 className="pt-2">{title}</h5></Modal.Header>
      <Modal.Body >
        {children}
      </Modal.Body>
    </Modal>
  );
}

export default ModalTemplate;
