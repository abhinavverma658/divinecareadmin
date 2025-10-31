import React from 'react';
import ReactQuill from 'react-quill';

function TextEditor({ value, onChange, description, setDescription, ...rest }) {
  // Support both value/onChange and description/setDescription props
  const quillValue = typeof value !== 'undefined' ? value : (typeof description !== 'undefined' ? description : '');
  const quillOnChange = onChange || (setDescription ? setDescription : () => {});

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote'],
      [{ color: [] }, { background: [] }],
      ['clean'],
      [{ align: [] }],
      [{ script: 'sub' }, { script: 'super' }],
      [{ indent: '-1' }, { indent: '+1' }],
    ],
  };

  const formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'link',
    'image',
    'video',
    'font',
    'align',
    'color',
    'background',
    'header',
    'indent',
    'size',
    'script',
    'clean',
    'direction',
  ];

  return (
    <ReactQuill
      value={quillValue}
      onChange={quillOnChange}
      modules={modules}
      formats={formats}
      className="rounded"
      style={{ border: '1px solid black', overflow: 'hidden', color: 'black' }}
      {...rest}
    />
  );
}

export default TextEditor