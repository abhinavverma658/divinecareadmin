import React, { useEffect, useState } from 'react'
import MotionDiv from '../../Components/MotionDiv'
import CustomTable, { DeleteButton, EditButton, ViewButton } from '../../Components/CustomTable'
import { Col, Container, Image, Row, Card, Button } from 'react-bootstrap'
import ModalTemplate from '../../Components/ModalTemplate';
import { useNavigate } from 'react-router-dom';
import DeleteModal from '../../Components/DeleteModal';
import { useDeleteQueryMutation, useGetAdminContactsMutation } from '../../features/apiSlice';
import { toast } from 'react-toastify';
import { getError } from '../../utils/error';
import { FaEdit, FaMapMarkerAlt, FaHeading, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Queries() {

  const [showQuery,setShowQuery] = useState(false);
 const [selectedData,setSelectedData] = useState(null);
const [getAdminContacts,{isLoading}] = useGetAdminContactsMutation()
const [deleteQuery,{isLoading:deleteLoading}] = useDeleteQueryMutation()
 const [queries,setQueries] = useState([]);


 const handleGetQueries = async()=>{
  try {
      const data = await getAdminContacts().unwrap();
      // expected shape: { success: true, data: [ ... ] }
      const items = data?.data || data?.contacts || [];
      setQueries(items);

  } catch (error) {
      const msg = error?.data?.message || error?.message || '';
      if (typeof msg === 'string' && msg.toLowerCase().includes('route not found')) {
        console.warn('Backend route not found when fetching contacts — suppressing toast', msg);
        return;
      }
      getError(error)
  }
}
 const handleDeleteQuery = async()=>{
  try {
      const data = await deleteQuery(selectedData?._id).unwrap();
      toast.success(data?.message);
      handleHideDeleteModal();
      handleGetQueries();
  } catch (error) {
      getError(error)
  }
}

useEffect(()=>{
  handleGetQueries();
},[])

 const navigate = useNavigate();
  const handleShowModal = ()=>setShowQuery(true);
  const handleCloseModal = ()=>{
    setShowQuery(false);
    setSelectedData(null)
  }
  const [showDeleteModal,setShowDeleteModal] = useState(false);
    const handleShowDeleteModal = ()=>setShowDeleteModal(true);
  const handleHideDeleteModal = ()=>setShowDeleteModal(false);

  


  return (
    <MotionDiv>
        {/* Contact Page Content Management */}
        <Container fluid className="px-4 py-3">
          <Row className="mb-4">
            <Col xs={12}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">
                    <FaEnvelope className="me-2" />
                    Contact Page Management
                  </h5>
                </Card.Header>
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={8}>
                      <h6 className="mb-2">Contact Us Page Content</h6>
                      <p className="text-muted mb-3 mb-md-0">
                        Edit the contact page heading, description, map location, and contact information displayed to visitors.
                      </p>
                    </Col>
                    <Col md={4} className="text-md-end">
                      <Link to="/dash/queries/edit-contact-page" className="text-decoration-none">
                        <Button variant="outline-primary" className="d-flex align-items-center ms-auto">
                          <FaEdit className="me-2" />
                          Edit Contact Page
                        </Button>
                      </Link>
                    </Col>
                  </Row>
                  
                  <Row className="mt-3 pt-3 border-top">
                    <Col md={4} className="text-center mb-3 mb-md-0">
                      <div className="mb-2">
                        <FaHeading className="text-primary" size={24} />
                      </div>
                      <h6 className="mb-1">Page Content</h6>
                      <small className="text-muted">Heading & Description</small>
                    </Col>
                    <Col md={4} className="text-center mb-3 mb-md-0">
                      <div className="mb-2">
                        <FaMapMarkerAlt className="text-success" size={24} />
                      </div>
                      <h6 className="mb-1">Map Integration</h6>
                      <small className="text-muted">Google Maps Embed</small>
                    </Col>
                    <Col md={4} className="text-center">
                      <div className="mb-2">
                        <FaEnvelope className="text-info" size={24} />
                      </div>
                      <h6 className="mb-1">Contact Info</h6>
                      <small className="text-muted">Address, Phone & Email</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        <CustomTable
        title={'Queries'}
        isSearch={false}
        searchPlaceholder={'Search Query'}
        column={['Sr.No','Name','Email','Company','Message','Date','Actions']}
        paging={false}
        loading={isLoading}
        >
  {queries &&
            queries?.map((data, i) => (
              <tr key={i} className="odd" style={{fontSize:'0.75rem'}}>
                <td className="text-center">{i + 1}</td>
                
                <td className='text-center'>{data?.name}</td>
                <td className='text-center'>{data?.email}</td>
                <td className='text-center'>{data?.company || 'N/A'}</td>
                <td className='text-center'>
  {data?.message?.length > 100 ? `${data.message.slice(0, 50)}...` : data?.message}
</td>
                <td className='text-center'>
                {new Date(data?.createdAt).toLocaleDateString()}</td>
                <td className='text-center'>
                    <ViewButton onClick={()=>{
                      setSelectedData(data);
                      handleShowModal();
                    }
                    }/>
                    <DeleteButton onClick={()=>{
                      setSelectedData(data)
                      handleShowDeleteModal()
                    }}/>

                </td>

              </tr>
            ))}

        </CustomTable>
        <ModalTemplate title={'Query'} show={showQuery} onHide={handleCloseModal}>
         <Container className=''>         
          
          
          <h6 className='d-inline '>Name:</h6> <p className='d-inline'>{selectedData?.name}</p>
          <br/>
          <h6 className='d-inline '>Email:</h6> <p className='d-inline'>{selectedData?.email}</p>
         <br/>
          <h6 className='d-inline '>Phone:</h6> <p className='d-inline'>{selectedData?.phone}</p>
         <br/>
          <h6 className='d-inline '>Company:</h6> <p className='d-inline'>{selectedData?.company || 'N/A'}</p>
         <br/>
         <h6 className='d-inline'>Message:</h6> <p className='d-inline'>{selectedData?.message}</p>
          </Container>
        </ModalTemplate>

        <DeleteModal
    title={"Are you sure you want to delete this query?"}
    onDiscard={handleHideDeleteModal}
    show={showDeleteModal}
    onHide={handleHideDeleteModal}
    onConfirm={handleDeleteQuery}
    loading={deleteLoading}
/>
    </MotionDiv>
  )
}

export default Queries