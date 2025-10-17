import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { FaTrashAlt } from 'react-icons/fa';
import { FaPlus, FaTrash } from 'react-icons/fa6';

function Features({ references, setReferences }) {
  const addReference = () => {
    const newReferences = [...references, ''];
    setReferences(newReferences);
  };

  const removeReference = (index) => {
    const newReferences = [...references];
    newReferences.splice(index, 1);
    setReferences(newReferences);
  };

  const handleReferenceChange = (index, value) => {
    const newReferences = [...references];
    newReferences[index] = value;
    setReferences(newReferences);
  };

  return (
    <Card className='my-2'>
      <Card.Header >Features:</Card.Header>
      <Card.Body>
      {references?.map((reference, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={reference}
            onChange={(e) => handleReferenceChange(index, e.target.value)}
            style={{ marginRight: '10px' }}
            className='rounded border-1 p-1 my-1 shadow'
          />
          <Button variant="transparent" className='cancel-btn px-1 py-0 m-1' onClick={() => removeReference(index)}>
            <FaTrash />
          </Button>
        </div>
      ))}
        <Button variant="transparent" className='action-btn' onClick={addReference}>
          <FaPlus/>
        </Button>
      </Card.Body>
    </Card>
  );
}

export default Features;
