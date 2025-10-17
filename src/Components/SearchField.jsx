import React, { useState } from 'react';
import { Form, FormControl, Button, InputGroup } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';

const SearchField = ({ label,setQuery,query,placeholder='Search',disabled=false }) => {
  

  return (
    <Form style={{maxWidth:'450px'}} className='w-100 border-0 d-inline shadow rounded-2'>
     <Form.Group>
      {label && <Form.Label className='' >{label}</Form.Label>}
      <InputGroup className='  w-100' >
        {/* <InputGroup.Prepend> */}
          <InputGroup.Text className='bg-white border-0'>
            <FaSearch /> 
          </InputGroup.Text>
        {/* </InputGroup.Prepend> */}
        <FormControl
          type="text"
          placeholder={placeholder}
          className="mr-sm-2 border-0 "
          value={query}
          disabled={disabled}
          style={{height:'2.5rem'}}
          onChange={(e) => setQuery(e.target.value)}
        />
        {/* <Button variant="outline-success" type="submit">Search</Button> */}
      </InputGroup>
      </Form.Group>
    </Form>
  );
};

export default SearchField;
