import React, { useEffect, useRef, useState } from 'react'
import MotionDiv from '../../Components/MotionDiv'
import { Button, Col, Form, Image, Row, Spinner } from 'react-bootstrap'
import FormField from '../../Components/FormField'
import { toast } from 'react-toastify';
import { FaUpload } from 'react-icons/fa6';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { imgAddr, useCreateTestimonialMutation, useGetTestimonialByIdMutation, useUpdateTestimonialByIdMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';

function AddEditTestimonial() {

    const [form,setForm] = useState({});
    const [picToUpload,setPicToUpload] = useState(null);
    const [picPreview,setPicPreview] = useState(null);
    const fileInputRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const {id}= useParams();
  
    const [getTestimonialById,{isLoading}] = useGetTestimonialByIdMutation();
    const [createTestimonial,{isLoading:createLoading}] = useCreateTestimonialMutation();
    const [updateTestimonialById,{isLoading:updateLoading}] = useUpdateTestimonialByIdMutation();


    const handleSubmit = async(e)=>{
      e.preventDefault();

      if(picToUpload || form?.image){
        try {
          const formData = new FormData();
          formData.append('name',form?.name)
          formData.append('message',form?.message)
            if(picToUpload){
          formData.append('image',picToUpload)
           }else{
            formData.append('image',form?.image)
          }

          const data = id? await updateTestimonialById({id,data:formData}).unwrap() : await createTestimonial(formData).unwrap()
          toast.success(data?.message);
          navigate(-1)
        } catch (error) {
        getError(error);
      }
      }else{
        toast.warn('Please upload a profile image')
      }

     
    }

    const handleFetchTestimonial = async()=>{
      try {
          const data = await getTestimonialById(id).unwrap();
          setForm({
             name: data?.testimonial?.name,
             message: data?.testimonial?.message,
             image: data?.testimonial?.profile
          });
  
      } catch (error) {
          getError(error)
      }
    }

    useEffect(()=>{
     if(id){
      handleFetchTestimonial();
     }
    },[id])

    const handleImageChange = (e) => {
        const selectedImg = e?.target?.files[0];
        
        if (selectedImg) {
          if (selectedImg.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
          } else {
            setPicToUpload(selectedImg);
           
            setPicPreview(URL.createObjectURL(selectedImg));
          }
        }
      };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };
  const handleChange=(e)=>{
      const {name,value} = e.target;
        setForm({...form,[name]:value});

  }
  return (
    <MotionDiv>
         <h3 style={{color:'var(--dark-color)'}}>{id?'Edit':'Add'} Testimonial</h3>
         <Form style={{maxWidth:'600px'}} className='mx-auto w-100' onSubmit={handleSubmit}>
            <div className='my-3 text-center'>
            <Image  src={picPreview ||form?.image && imgAddr+form?.image || '/avatar.png'} className='border' style={{aspectRatio:'1/1',borderRadius:'50%',objectFit:'contain'}}  height={'100px'}/>
         <Button variant='transparent' className='add-btn m-4' onClick={handleButtonClick}>Upload Image <FaUpload/></Button>
         <input
                id="img-upload"
                ref={fileInputRef}
                onChange={handleImageChange}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
              />
              </div>
            <FormField
            type={'text'}
              name={'name'}
              label={'User Name'}
              placeholder={'Name'}
              value={form?.name} 
              onChange={handleChange}     
            />
            <FormField
              as={'textarea'}
              rows={4}
              name={'message'}
              label={'Message'}
              placeholder={'Message...'}
              value={form?.message} 
              onChange={handleChange}     
            />
            <Row>
                <Col className='text-center'>
                <Button variant="transparent" onClick={()=>navigate(-1)}  className='cancel-btn mx-2'>Cancel</Button>
                
                <Button disabled={createLoading || updateLoading} variant='transparent' type='submit' className='action-btn mx-2'>
                  {createLoading || updateLoading ?
                <Spinner size='sm'/>
                :
                'Save Details'
                }
                  </Button>
                </Col>
            </Row>
         </Form>
    </MotionDiv>
  )
}

export default AddEditTestimonial