import React from "react";
import { Modal, Image, Button, Row, Col, Spinner } from "react-bootstrap";
import { FaTrash } from "react-icons/fa6";

function DeleteModal({
  show,
  onHide,
  src,
  title,
  description,
  onDiscard,
  onConfirm,
  loading = false,
  // color,
  buttonConfirmTxt,
  buttonCancelTxt,
}) {
  return (
    <Modal show={show} onHide={onHide} >
      <Modal.Body className="text-center">
        {/* <Image src={src} style={{maxHeight:'60px'}} className="my-2" /> */}
        <FaTrash color="var(--danger-red)" className="my-3" size={50}/>
        <h5>{title}</h5>
        <p>{description}</p>
        <Row>
          <Col>
            {onDiscard && (
              <Button
                variant="transparent"
                className="add-btn w-100 m-1"
                onClick={onDiscard}
              >
                {buttonCancelTxt ? "Close" : "Discard"}
              </Button>
            )}
          </Col>
          <Col>
            {onConfirm && (
              <Button
                variant="transparent"
                className="cancel-btn w-100 m-1"
                disabled={loading}
                onClick={onConfirm}
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : buttonConfirmTxt ? (
                  buttonConfirmTxt
                ) : (
                  "Confirm"
                )}
              </Button>
            )}
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
}

export default DeleteModal;
