import React from 'react'
import { Image } from 'react-bootstrap'
import { FaRegEdit, FaTrash } from 'react-icons/fa'
import { FaAngleRight } from 'react-icons/fa6'
import { imgAddr } from '../features/apiSlice'

function LongCard({item,onClick,onEdit,onDelete}) {

  const img = '/vite.svg'

  return (
    <div className='d-flex mt-2 justify-content-between rounded p-3'
    
     style={{background:'rgba(245, 245, 245, 1)'}}>

<span className='d-flex align-items-center'  onClick={()=>onClick && onClick(item)} style={{cursor:`${onClick ?'pointer':''}`}}>
            <Image src={item?.image && imgAddr+item?.image || img} className='me-1'  height={'30px'} width={'30px'}/>
<span>{item?.title} { Number.isFinite(item?.assetlevel1Count) && `(${item?.assetlevel1Count})`}</span>
{onClick && <FaAngleRight/>}
</span>

<span className='d-flex align-items-center'>
<FaRegEdit style={{cursor:'pointer'}}
 onClick={()=>onEdit(item)} 
 className='mx-2 ' size={15}/>

<FaTrash
style={{cursor:'pointer'}} 
   onClick={()=>onDelete(item)} 
className=' ' size={15}/>
</span>


</div>
  )
}

export default LongCard