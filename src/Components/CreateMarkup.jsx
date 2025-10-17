import React from 'react'
import { Container } from 'react-bootstrap';

function CreateMarkup({content}) {
 
  
    
      const createMarkupF = (htmlContent) => {
      
        return { __html: htmlContent };
      };
    
      return (
       
              <div dangerouslySetInnerHTML={createMarkupF(content)} />
       
      )
}

export default CreateMarkup