import React from 'react'

function ZoomDiv({children}) {
  return (
    <div
    data-aos="zoom-in"
            data-aos-duration="500"
            data-aos-delay="200"
    >
        {children}
    </div>
  )
}

export default ZoomDiv