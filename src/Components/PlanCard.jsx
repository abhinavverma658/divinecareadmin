import React from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { FaRegCheckCircle } from "react-icons/fa";
// import { BsDot } from "react-icons/bs";

function PlanCard({
  id,
  onClick,
  title,
  tagline,
  status,
  annualPrice,
  bgColor,
  textColor,
  monthlyPrice,
  featureTitle,
  features,
}) {
  const totalMonthlyCost = monthlyPrice * 12;
  const totalAnnualCost = annualPrice * 12;

  const difference = totalMonthlyCost - totalAnnualCost;
  const result = Math.floor((difference / totalMonthlyCost) * 100);

  return (
    <Card
      className=" position-realtive border-0 shadow h-100 plan-card"
      style={{ color: textColor || "#fff", minHeight: "400px" }}
    >
      <Card.Body
        className="p-0 rounded-3 overflow-hidden border-0"
        style={{ borderTopLeftRadius: "1rem" }}
      >
        <div style={{ background: bgColor || "#ddd" }}>
          <p
            className="rounded-pill position-absolute px-3 mb-1 "
            style={{
              color: `${status === "Active" ? "white" : "white"}`,
              background: `${
                status === "Active" ? "rgb(1, 199, 57,1)" : "rgb(238, 29, 0,1)"
              }`,
              top: "-10px",
              right: 0,
              fontSize: "0.8rem",
            }}
          >
            {" "}
            {status}
          </p>

          <Row className=" ">
            <Col className="text-center">
              <h3 className="mb-1 mt-2" style={{ fontWeight: 600 }}>
                {title}
              </h3>
              <p className="mt-0" style={{ fontWeight: 600 }}>
                {tagline}
              </p>
            </Col>
          </Row>

          {annualPrice && (
            <Row>
              <Col className="text-center">
                <div
                  className="mb-1 mx-5"
                  style={{ borderTop: "2px solid #ccc" }}
                />
                <h5>AUD ${annualPrice}</h5>
                <p className="mb-0" style={{ fontSize: "0.8rem" }}>
                  Per month, Billed annually
                </p>
                {Number.isFinite(result) && (
                  <div
                    className=" bg-white px-3 mb-1 fw-semibold my-2"
                    style={{ color: "var(--primary-color)" }}
                  >
                    Save {result}%
                  </div>
                )}
                <p className="mb-0" style={{ fontSize: "0.85rem" }}>
                  ${monthlyPrice} billed monthly
                </p>
                <div
                  className="m-2 mx-5"
                  style={{ borderTop: "2px solid #ccc" }}
                />
              </Col>
            </Row>
          )}
          {featureTitle && (
            <div
              className="text-center mb-0 d-flex align-items-center justify-content-center"
              style={{
                fontSize: "0.90rem",
                background: "rgba(255, 255, 255, 0.25)",
                minHeight: "3rem",
              }}
            >
              <span>{featureTitle}</span>
            </div>
          )}
        </div>

        <Row>
          <Col className="px-4 bg-grey pt-2">
            {features &&
              features?.map((feature, i) => (
                <p
                  className="mb-1 "
                  style={{ fontSize: "0.8rem", color: "rgba(0, 0, 0, 0.8)" }}
                >
                  <FaRegCheckCircle /> {feature}
                </p>
              ))}
          </Col>
        </Row>
      </Card.Body>
      <Card.Footer className="bg-white px-3 border-0">
        <Button
          onClick={onClick}
          className="w-100 border-white "
          style={{ background: bgColor || "#ddd", fontWeight: 600 }}
        >
          Edit {title}
        </Button>
      </Card.Footer>
    </Card>
  );
}

export default PlanCard;
