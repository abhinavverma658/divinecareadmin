import React, { useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
 import Skeleton from 'react-loading-skeleton';
import Select  from 'react-select';
import ImageUpload from './ImageUpload';


function FormField({ label, type,step, placeholder, id, onChange, name, value, disabled = false,loading=false, required=true, options,maxLength,min, as, rows, multiple = false}) {
  
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const getFormattedPastDate = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? 'rgba(45, 49, 166, 1)' : 'transparent', 
      color: state.isFocused ? '#fff' : '#000', 
      '&:hover': {
        backgroundColor: 'rgba(45, 49, 166, 1)', 
        color:'#fff'
      },
    }),
 
  };
  
  return (
    <Form.Group  className="mb-3 custom-input" controlId={id} >
     {label && <Form.Label className='' >{label}</Form.Label>}

      {
      loading?
      <Skeleton height={'2rem'} />
      :
      type === 'image' ? (
        <ImageUpload
          value={value}
          onChange={(newValue) => onChange && onChange({ 
            target: { name, value: newValue } 
          })}
          label={label}
          required={required}
          multiple={multiple}
        />
      )
      :
      type === 'select' ? (
        
        <Select
        className="form-fid "
        name={name}
        
        value={options.find(option => option.value === value) || null}
        options={options}
        isSearchable
        onChange={(selectedOption) => onChange && onChange({ 
          target: {
            name,
            value: selectedOption ? selectedOption.value : '',
            label: selectedOption ? selectedOption.label : '',  
          } 
        }
        
          )
        
        }
        isDisabled={disabled}
        placeholder={placeholder}
        required={required}
        styles={customStyles}
      />
       
      )
  
      :   
      type === 'dropdown'?
      (
      <Form.Select  className="drop-option  "  name={name} value={value} onChange={onChange} disabled={disabled} >
      {options?.map((option, index) => (
        <option key={option?.value} value={option?.value}  className='custom-drop'>
          {option?.label}
        </option>
      ))}
    </Form.Select>
      )
    :
      type === 'password' ?
      (
      <InputGroup className=' rounded'>
        <Form.Control
          className={'form-field '}
          required={required}
          type={showPassword ? 'text' : 'password'}
          aria-label={showPassword ? 'Show password' : 'Hide password'}
          placeholder={placeholder}
          name={name}
          value={value || ''} // Ensure value is never undefined
          onChange={onChange}
          disabled={disabled}
         
        />
        <Button variant="transparent" className='bg-white form-field'  onClick={togglePasswordVisibility}>
          {showPassword ? <HiOutlineEye color='black' />: <HiOutlineEyeOff color='black' /> }
        </Button>
      </InputGroup>
      ):
      type === 'tel' ? (
        <Form.Control
          className={'form-field  '}
          required={required}
          type={type}
          placeholder={placeholder}
          value={value || ''} // Ensure value is never undefined
          name={name}
          onChange={(e) => {
            const inputValue = e.target.value;
            const isValidNumber = /^-?\d*\.?\d*$/.test(inputValue);
      
            if (isValidNumber) {
              onChange({ target: { name, value: inputValue } });
            }
          }}
          pattern="[-]?\d*\.?\d+"
          disabled={disabled}
        />
      )

      :(
        <Form.Control
          className={'form-field '}
          required={required}
          step={step}
          type={type}
          placeholder={placeholder}
          value={value || ''} // Ensure value is never undefined
          name={name}
          as={as}
          rows={rows}
          onChange={onChange}
          disabled={disabled}
          min={min}
          maxLength={maxLength}
        />
      )
      
    }

    </Form.Group>
  );
}

export default FormField;
