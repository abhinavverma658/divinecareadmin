import React from 'react'
import ReactQuill from 'react-quill'

function TextEditor({description,setDescription,onChange}) {

 const modules = {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ["bold", "italic", "underline", "strike"],
        //   ["link", "image", "video"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["blockquote"],
          // ["blockquote", "code-block"],
          [{ color: [] }, { background: [] }],
          ["clean"],
          // ["paragraph"],
          [{ align: [] }],
        //   [{ font: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ indent: "-1" }, { indent: "+1" }],
        //   [{ direction: "rtl" }],
        ],
      };
      
     const formats = [
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        // "code-block",
        "list",
        "bullet",
        "link",
        "image",
        "video",
        "font",
        "align",
        "color",
        "background",
        "header",
        "indent",
        "size",
        "script",
        "clean",
        // "code",
        "direction",
      ];

  return (
    <ReactQuill
                value={description}
                
                onChange={onChange}
                modules={modules}
                formats={formats}
                className='rounded'
                style={{ border: "1px solid black",overflow:'hidden', color: "black" }}
              />
  )
}

export default TextEditor