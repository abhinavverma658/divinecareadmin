import React, { useState } from 'react';
import { Container, Dropdown, Row } from 'react-bootstrap';

const HoverDropdown = ({title,children}) => {
  const [show, setShow] = useState(false);

  const handleMouseEnter = () => {
    setShow(true);
  };

  const handleMouseLeave = () => {
    setShow(false);
  };

  return (
    <Dropdown
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      show={show}
      style={{display:'inline'}}
      drop='down-centered'
    >
      <Dropdown.Toggle className='tool-btn' variant="transparent" id="dropdown-basic">
        {title}
      </Dropdown.Toggle>

      <Dropdown.Menu style={{width:'350px'}} className='p-1'>
        <Container>
{children}
</Container>
        {/* <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
        <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
        <Dropdown.Item href="#/action-3">Something else</Dropdown.Item> */}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default HoverDropdown;
