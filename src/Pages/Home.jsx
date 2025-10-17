import React from "react";
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ZoomDiv from "../Components/ZoomDiv";
function Home() {

  const navigate =useNavigate();


  return (
    <section className="custom-background">
      <Container className=" custom-section d-flex align-items-center justify-content-center  text-center" >
        <ZoomDiv>
        <h1 className="main-logo">Welcome to Revolt</h1>
        <p>
        Ready to unlock your data's potential? Let's dive in!
        </p>
        <button onClick={()=>navigate('/signup')} className=" main-button fw-bold mx-auto"><span>Get Started</span></button>
      </ZoomDiv>
      </Container>
    </section>
  );
}

export default Home;
