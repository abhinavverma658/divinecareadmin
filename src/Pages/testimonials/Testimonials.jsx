import React, { useEffect, useState } from 'react'
import MotionDiv from '../../Components/MotionDiv'
import CustomTable, { DeleteButton, EditButton, ViewButton } from '../../Components/CustomTable'
import { Col, Container, Image, Row } from 'react-bootstrap'
import ModalTemplate from '../../Components/ModalTemplate';
import { useNavigate } from 'react-router-dom';
import DeleteModal from '../../Components/DeleteModal';
import { imgAddr, useDeleteTestimonialMutation, useGetTestimonialsMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';

function Testimonials() {

  const [showTestimonial,setShowTestimonial] = useState(false);
 const [selectedData,setSelectedData] = useState(null)
 const [getTestimonials,{isLoading}] = useGetTestimonialsMutation();
 const [deleteTestimonial,{isLoading:deleteLoading}] = useDeleteTestimonialMutation();
  const [testimonials,setTestimonials] = useState([]);
 const navigate = useNavigate();
  const handleShowModal = ()=>setShowTestimonial(true);
  const handleCloseModal = ()=>{
    setShowTestimonial(false);
    setSelectedData(null)
  }
  const [showDeleteModal,setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = ()=>setShowDeleteModal(true);
  const handleHideDeleteModal = ()=>setShowDeleteModal(false);

  const fetchTestimonials = async()=>{
    try {
      const data = await getTestimonials().unwrap();
      setTestimonials(data?.testimonials)
    } catch (error) {
      getError(error)
    }
  }
  
  const handleDeleteTestimonial = async()=>{
    try {
        const data = await deleteTestimonial(selectedData?._id).unwrap();
        toast.success(data?.message);
        handleHideDeleteModal();
        fetchTestimonials();
    } catch (error) {
        getError(error)
    }
  }
  
  useEffect(()=>{
    fetchTestimonials();
  },[])
  

  return (
    <MotionDiv>
        <CustomTable
        title={'Testimonials'}
        isSearch={false}
        // searchPlaceholder={'Search Testimonial'}
        createOnClick={()=>navigate('add-testimonial')}
        createText={'Add Testimonial'}
        column={['Sr.No','Name','Profile Pic','Message','Actions']}
        paging={false}
        loading={isLoading}
        >
  {testimonials &&
            testimonials?.map((data, i) => (
              <tr key={i} className="odd" style={{fontSize:'0.75rem'}}>
                <td className="text-center">{i + 1}</td>
                
                <td className='text-center'>{data?.name}</td>
                <td className='text-center'>
                  <Image src={ imgAddr+data?.profile ||`/avatar.png`} fluid   style={{aspectRatio:'1/1',maxHeight:'35px',borderRadius:'50%',border:'1px solid var(--neutral-color)',padding:'2px',objectFit:'contain'}}/>
                </td>
                <td className='text-center'>{data?.message?.substring(0,100)}</td>
                <td className='text-center'>
                    <ViewButton onClick={()=>{
                      setSelectedData(data);
                      handleShowModal();
                    }
                    }/>
                    <EditButton onClick={()=>navigate(`edit-testimonial/${data?._id}`)}/>
                    <DeleteButton onClick={()=>{
                      setSelectedData(data);
                      handleShowDeleteModal();
                    }}/>

                </td>

              </tr>
            ))}

        </CustomTable>
        <ModalTemplate title={'Testimonial'} show={showTestimonial} onHide={handleCloseModal}>
         <Container className='text-center'>
          <Image src={ imgAddr+selectedData?.profile ||`/avatar.png`} fluid className='my-2'   style={{aspectRatio:'1/1',height:'60px',borderRadius:'50%',border:'1px solid var(--neutral-color)',padding:'2px',objectFit:'contain'}}/>
         
          <br/>
          
          <h6 className='d-inline '>Name:</h6> <p className='d-inline'>{selectedData?.name}</p>
         <br/>
         <h6 className='d-inline'>Message:</h6> <p className='d-inline'>{selectedData?.message}</p>
          </Container>
        </ModalTemplate>

        <DeleteModal
    title={"Are you sure you want to delete this testimonial?"}
    onDiscard={handleHideDeleteModal}
    show={showDeleteModal}
    onHide={handleHideDeleteModal}
    onConfirm={handleDeleteTestimonial}
    loading={deleteLoading}
/>
    </MotionDiv>
  )
}

export default Testimonials