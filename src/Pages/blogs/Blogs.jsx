import React, { useEffect, useState } from 'react'
import MotionDiv from '../../Components/MotionDiv'
import CustomTable, { DeleteButton, EditButton, ViewButton } from '../../Components/CustomTable'
import { Col, Container, Image, Row } from 'react-bootstrap'
import ModalTemplate from '../../Components/ModalTemplate';
import { useNavigate } from 'react-router-dom';
import DeleteModal from '../../Components/DeleteModal';
import { imgAddr, useDeleteBlogMutation, useGetBlogsMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import { toast } from 'react-toastify';
import CreateMarkup from '../../Components/CreateMarkup';


// Get BASE_URL from env
const BASE_URL = import.meta.env.VITE_BASE_URL ||'https://divine-care.ap-south-1.storage.onantryk.com';
 
 

function Blogs() {

  const [showTestimonial,setShowTestimonial] = useState(false);
 const [selectedData,setSelectedData] = useState(null)
 const [getBlogs,{isLoading}] = useGetBlogsMutation();
 const [deleteBlog,{isLoading:deleteLoading}] = useDeleteBlogMutation();
  const [blogs,setBlogs] = useState([]);

 const navigate = useNavigate();
  const handleShowModal = ()=>setShowTestimonial(true);
  const handleCloseModal = ()=>{
    setShowTestimonial(false);
    setSelectedData(null)
  }
  const [showDeleteModal,setShowDeleteModal] = useState(false);
  const handleShowDeleteModal = ()=>setShowDeleteModal(true);
const handleHideDeleteModal = ()=>setShowDeleteModal(false);

const fetchBlogs = async()=>{
  try {
    const data = await getBlogs().unwrap();
    setBlogs(data?.blogs)
  } catch (error) {
    getError(error)
  }
}

const handleDeleteBlog = async()=>{
  try {
      const data = await deleteBlog(selectedData?._id).unwrap();
      toast.success(data?.message);
      handleHideDeleteModal();
      fetchBlogs();
  } catch (error) {
      getError(error)
  }
}

useEffect(()=>{
  fetchBlogs();
},[])

 const getImageUrl = (val) => {
  if (!val) return '';
  const str = String(val).trim();
  if (/^https?:\/\//i.test(str)) return str;
  const clean = str.replace(/^\/+/, '');
  const encoded = encodeURI(clean);
  return `${BASE_URL.replace(/\/$/, '')}/${encoded}`;
 };
 

  return (
    <MotionDiv>
        <CustomTable
        title={'Blogs'}
        isSearch={false}
        searchPlaceholder={'Search Blog'}
        createOnClick={()=>navigate('add-blog')}
        createText={'Add Blog'}
        column={['Sr.No','Title','Created At','Actions']}
        paging={false}
        loading={isLoading}
        >
  {blogs &&
            blogs?.map((data, i) => (
              <tr key={i} className="odd" style={{fontSize:'0.75rem'}}>
                <td className="text-center">{i + 1}</td>
                
                <td className='text-center'>{data?.title}</td>
                
                <td className='text-center'>{new Date(data?.createdAt).toLocaleDateString()}</td>
                <td className='text-center'>
                    <ViewButton onClick={()=>{
                      setSelectedData(data);
                      handleShowModal();
                    }
                    }/>
                    <EditButton onClick={()=>navigate(`edit-blog/${data?._id}`)}/>
                    <DeleteButton onClick={()=>{
                      setSelectedData(data)
                      handleShowDeleteModal();
                    }}/>

                </td>

              </tr>
            ))}

        </CustomTable>
        <ModalTemplate size='lg' title={'Blog'} show={showTestimonial} onHide={handleCloseModal}>
         <Container >
          <h6 className='d-inline '>Title:</h6> <p className='d-inline'>{selectedData?.title}</p>
          <br/>
          <Row>
            <Col className='text-center'>

          <Image src={getImageUrl(selectedData?.image_url)} fluid className='my-2 ' rounded   style={{height:'100px',border:'1px solid var(--neutral-color)',padding:'2px'}}/>
            </Col>

          </Row>
         
          <br/>
          
         
         <h6 className=''>Content:</h6>
          <CreateMarkup content={selectedData?.description} />
          </Container>
        </ModalTemplate>

        <DeleteModal
    title={"Are you sure you want to delete this blog?"}
    onDiscard={handleHideDeleteModal}
    show={showDeleteModal}
    onHide={handleHideDeleteModal}
    onConfirm={handleDeleteBlog}
    loading={deleteLoading}
/>
    </MotionDiv>
  )
}

export default Blogs