import React, { useEffect, useRef, useState } from 'react';
import MotionDiv from '../../Components/MotionDiv';
import { Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { Image as BootImage } from 'react-bootstrap';
import FormField from '../../Components/FormField';
import { toast } from 'react-toastify';
import { FaUpload } from 'react-icons/fa6';
import { useNavigate, useParams } from 'react-router-dom';
import { imgAddr, useCreateBlogMutation, useGetBlogByIdMutation, useUpdateBlogByIdMutation } from '../../features/apiSlice';
import { getError } from '../../utils/error';
import TextEditor from '../../Components/TextEditor';
import Cropper from 'react-easy-crop';


// Get BASE_URL from env
const BASE_URL = import.meta.env.VITE_BASE_URL ||'https://divine-care.ap-south-1.storage.onantryk.com';
 
 

function AddEditBlog() {
  const [form, setForm] = useState({});
  const [picToUpload, setPicToUpload] = useState(null);
  const [picPreview, setPicPreview] = useState(null);
  const [croppedPicPreview, setCroppedPicPreview] = useState(null);
  const [showPicModal, setShowPicModal] = useState(false);
  const handleShowPicModal = () => setShowPicModal(true);
  const handleClosePicModal = () => setShowPicModal(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [getBlogById, { isLoading }] = useGetBlogByIdMutation();
  const [createBlog, { isLoading: createLoading }] = useCreateBlogMutation();
  const [updateBlogById, { isLoading: updateLoading }] = useUpdateBlogByIdMutation();

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);


  const getCroppedImg = async (imageSrc, croppedAreaPixels) => {
    const image = new Image();
    image.src = imageSrc;
  
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;
  
    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );
  
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (picToUpload || form?.image) {
      try {
        const formData = new FormData();
        formData.append('title', form?.title);
        formData.append('description', form?.description);
        if (picToUpload) {
          formData.append('image', picToUpload);
        } else {
          formData.append('image', form?.image);
        }
        // Include imageKey when available (frontend-uploaded key) so backend can store/delete correctly
        if (form?.imageKey) {
          formData.append('imageKey', form.imageKey);
        }

        const data = id ? await updateBlogById({ id, data: formData }).unwrap() : await createBlog(formData).unwrap();
        toast.success(data?.message);
        navigate(-1);
      } catch (error) {
        getError(error);
      }
    } else {
      toast.warn('Please upload a cover image');
    }
  };

  const handleFetchBlog = async () => {
    try {
      const data = await getBlogById(id).unwrap();
      setForm({
        title: data?.blog?.title,
        description: data?.blog?.description,
        image: data?.blog?.image_url,
        imageKey: data?.blog?.image_key || data?.blog?.imageKey || ''
      });
    } catch (error) {
      getError(error);
    }
  };

  useEffect(() => {
    if (id) {
      handleFetchBlog();
    }
  }, [id]);

  const handleImageChange = (e) => {
    const selectedImg = e?.target?.files[0];

    if (selectedImg) {
      if (selectedImg.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
      } else {
        setPicToUpload(selectedImg);
        setPicPreview(URL.createObjectURL(selectedImg));
        handleShowPicModal();
      }
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };


  const handleImageSave = async () => {
    try {
      const croppedImage = await getCroppedImg(picPreview, croppedAreaPixels);
      setCroppedPicPreview(croppedImage);
      setPicToUpload(croppedImage);
      handleClosePicModal();
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

    const getImageUrl = (val) => {
      if (!val) return '';
      const str = String(val).trim();
      // If already a full URL, return as-is
      if (/^https?:\/\//i.test(str)) return str;
      // Remove leading slashes and encode special characters (spaces, etc.)
      const clean = str.replace(/^\/+/, '');
      const encoded = encodeURI(clean);
      return `${BASE_URL.replace(/\/$/, '')}/${encoded}`;
    };

  return (
    <MotionDiv>
      <h3 style={{ color: 'var(--dark-color)' }}>{id ? 'Edit' : 'Add'} Blog</h3>
      <Form className='mx-auto w-100' onSubmit={handleSubmit}>
        <Row className='my-3'>
          <Col md={6}>
            <Form.Label>Cover Image</Form.Label> <br />
            <BootImage
              src={
                croppedPicPreview
                  ? URL.createObjectURL(croppedPicPreview)
                  : getImageUrl(form?.image)
              }
              className="border"
              style={{ objectFit: 'contain' }}
              rounded
              height={'200px'}
              width={'350px'}
            />
            <Button variant='transparent' className='add-btn m-4' onClick={handleButtonClick}>Upload Image <FaUpload /></Button>
            <input
              id="img-upload"
              ref={fileInputRef}
              onChange={handleImageChange}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
            />
          </Col>
          <Col>
            <FormField
              type={'text'}
              name={'title'}
              label={'Title'}
              placeholder={'Title'}
              value={form?.title}
              onChange={handleChange}
            />
          </Col>
        </Row>

        <TextEditor description={form?.description} onChange={(text) => setForm((form) => ({ ...form, description: text }))} />

        <Row className='mt-3'>
          <Col className='text-center'>
            <Button variant="transparent" onClick={() => navigate(-1)} className='cancel-btn mx-2'>Cancel</Button>
            <Button disabled={createLoading || updateLoading} variant='transparent' type='submit' className='action-btn mx-2'>
              {createLoading || updateLoading ? <Spinner size='sm' /> : 'Save Details'}
            </Button>
          </Col>
        </Row>
      </Form>

      <Modal show={showPicModal} onHide={handleClosePicModal}>
        <Modal.Header closeButton>
          <Modal.Title className='text-white'>Change Profile Picture</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {picPreview && (
            <div style={{ position: 'relative', width: '100%', height: '400px' }}>
              <Cropper
                image={picPreview}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          )}
          <Form className="text-center px-md-4">
            <Form.Control
              type="file"
              id="profilePicture"
              label="Choose a new profile picture"
              accept="image/*"
              onChange={handleImageChange}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='transparent' className='cancel-btn' onClick={handleClosePicModal}>
            Close
          </Button>
          <Button variant="transparent" className='action-btn' onClick={handleImageSave}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </MotionDiv>
  );
}

export default AddEditBlog;


