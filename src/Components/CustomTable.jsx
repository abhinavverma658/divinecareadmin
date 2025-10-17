import { Button, Card, Col, Form, InputGroup, Row, Table } from "react-bootstrap";

import { useNavigate } from "react-router-dom";

import Skeleton from "react-loading-skeleton";
import { Pagination } from "react-bootstrap";
import { FaEdit, FaEye, FaPlusCircle, FaTrash } from "react-icons/fa";
import SearchField from "./SearchField";
import { IoAddCircleSharp } from "react-icons/io5";


const CustomSkeleton = ({ resultPerPage, column }) => {
  // console.log({ resultPerPage, column });
  
  return [...Array(parseInt(resultPerPage)).keys()].map((r) => (
    <tr key={r}>
      {[...Array(column).keys()].map((d) => (
        <td key={d}>
          <Skeleton height={30} />
        </td>
      ))}
    </tr>
  ));
};




const CustomPagination = ({ pages, pageHandler, curPage }) => {
  //   console.log("cur page", curPage);
  const [left, setLeft] = useState();
  const [right, setRight] = useState();

  const getPageArray = () => {
    const arr = [...Array(pages).keys()].slice(left + 1, right);
    // console.log(curPage === left);
    // console.log(left, right, arr);
    return arr;
  };

  useEffect(() => {
    if (pages <= 5) {
      setLeft(-1);
      setRight(pages);
    } else {
      if (curPage <= 3) {
        setLeft(1);
        setRight(5);
      } else if (curPage >= pages - 2) {
        setLeft(pages - 4);
        setRight(pages);
      } else {
        setLeft(curPage - 2);
        setRight(curPage + 2);
      }
    }
  }, [curPage, pages]);

  return (
    <div className="mt-3 float-end">
      <Pagination>
        {pages <= 5 ? (
          <>
            {getPageArray().map((i) => (
              <Pagination.Item
                key={i}
                active={i + 1 === curPage}
                activeLabel=""
                onClick={() => pageHandler(i + 1)}
              >
                {i + 1}
              </Pagination.Item>
            ))}
          </>
        ) : (
          <>
            <Pagination.First
              disabled={curPage === 1}
              onClick={() => pageHandler(1)}
            />
            <Pagination.Prev
              disabled={curPage === 1}
              onClick={() => pageHandler(curPage - 1)}
            />
            <Pagination.Item
              active={curPage === left}
              activeLabel=""
              onClick={() => pageHandler(left)}
            >
              {console.log("ffdfdf", left)}
              {left}
            </Pagination.Item>
            <Pagination.Ellipsis />

            {getPageArray().map((i) => (
              <Pagination.Item
                key={i}
                active={curPage === i}
                activeLabel=""
                onClick={() => pageHandler(i)}
              >
                {i}
              </Pagination.Item>
            ))}

            <Pagination.Ellipsis />
            <Pagination.Item
              active={curPage === right}
              activeLabel=""
              onClick={() => pageHandler(right)}
            >
              {right}
            </Pagination.Item>
            <Pagination.Next
              disabled={curPage === pages}
              onClick={() => pageHandler(curPage + 1)}
            />
            <Pagination.Last
              disabled={curPage === pages}
              onClick={() => pageHandler(pages)}
            />
          </>
        )}
      </Pagination>
    </div>
  );
};





export default function CustomTable({column,isSearch=true,searchPlaceholder,title,createOnClick,createText,loading,query,setQuery,children,resultPerPage=10,paging=false,numOfPages,pageHandler,curPage}) {
  const navigate = useNavigate();
  




  const len = column?.length;
  return (
    <Card className="glass-morf rounded-4 border-0">
      <Card.Header className="border-bottom">
        <Row>
          <Col className="d-flex justify-content-between">
          {title &&         <h3 style={{color:'var(--dark-color)'}}>{title}</h3>
        }
          
         
         
          
        <div className="d-flex align-items-center">
          {isSearch &&
         <SearchField placeholder={searchPlaceholder} query={query} setQuery={setQuery} />         
          }
{createText && createOnClick &&
        <CreateBtn onClick={createOnClick} text={createText} />       
}         
</div>
           </Col>
        </Row>
      </Card.Header>
      <Card.Body>
        <Table responsive borderless hover className="text-center">
          <thead>
            <tr>{len && column?.map((col) => <th key={col}>{col}</th>)}</tr>
          </thead>
          <tbody>
            {loading ? (
              <CustomSkeleton resultPerPage={resultPerPage} column={len} />
            ) : (
              <>{children}</>
            )}
          </tbody>
        </Table>
      </Card.Body>

     {paging && <Card.Footer>
        <div className="float-start d-flex align-items-center mt-3">
          <p className="p-bold m-0 me-3">Number of Row</p>
          <Form.Group controlId="resultPerPage">
            <Form.Select
              value={resultPerPage}
              onChange={(e) => {
               setResultPerPage && setResultPerPage(e.target.value);
               pageHandler && pageHandler(1);
              }}
              aria-label="Default select example"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
            </Form.Select>
          </Form.Group>
        </div>
        {paging && (
          <CustomPagination
            pages={numOfPages}
            pageHandler={pageHandler}
            curPage={curPage}
          />
        )}
      </Card.Footer>
}
    </Card>
  );
}


export const ViewButton = ({ onClick }) => {
  return (
    <Button variant="transparent" className="p-0 mx-1 " onClick={onClick} >
      <FaEye color="var(--neutral-color)"/>
    </Button>
  );
};
export const EditButton = ({ onClick }) => {
  return (
    <Button variant="transparent" className="p-0 mx-1 " onClick={onClick} >
      <FaEdit color="var(--dark-color)"/>
    </Button>
  );
};

export const DeleteButton = ({ onClick }) => {
  return (
    <Button variant="transparent" className="p-0 mx-1 " onClick={onClick} >
      {/* <FaRegTrashAlt color="rgba(0, 26, 114, 1)" /> */}
      <FaTrash color="var(--danger-red)"/>
    </Button>
  );
};


export function CreateBtn({onClick,text}) {
  // const navigate = useNavigate();
return (
  <Button
  onClick={onClick}
  variant="transparent"
  className="add-btn  px-3 mx-2 m-1 text-nowrap d-inline"
  style={{height:'2.5rem'}}
>
{text && text} <FaPlusCircle className='mb-1' />

</Button>
)
}








