import React from 'react'
import { Button, Col, Row } from 'react-bootstrap'
import LongCard from './LongCard'
import { FaPlus } from 'react-icons/fa6'
import Skeleton from 'react-loading-skeleton'

function AssetLiabilityLayout({title,data,onClick,onCreateClick,onEdit,onDelete,loading=false}) {
  return (
    <>
    <Row>
    <Col>
  <h5>{title}</h5>
    
    </Col>
    <Col className='text-end'>
    <Button variant='transparent' onClick={onCreateClick} className='add-btn rounded-pill'><FaPlus/> Add New {title}</Button>
    </Col>
  </Row>
{loading
?
Array.from({ length: 5 }).map((_, index) => (
    <Skeleton width={'100%'} height={'4rem'} className='m-1' />
))

:
data?.length >0 ?
data?.map((item,i)=>(

<LongCard item={item} onClick={onClick} onEdit={onEdit} onDelete={onDelete}/>
))
:
<p>No Data</p>
}

</>
  )

}

export default AssetLiabilityLayout