import React, { useEffect, useState } from 'react'
import { Dropdown, Container, Col, Form, InputGroup, Row, FloatingLabel, } from 'react-bootstrap';
import { Button, styled, TableRow, TableHead, TableContainer, Paper, Table, TableBody, TableCell, tableCellClasses, Menu, MenuItem } from '@mui/material'

import axiosInstance from '../../common/AxiosInstance'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
   [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
   },
   [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
   },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
   '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
   },
   // hide last border
   '&:last-child td, &:last-child th': {
      border: 0,
   },
}));

const TeacherHome = () => {
   const [assessment, setAssessment] = useState({
      type: '',
      title: '',
      description: ''
   });

   const [student, setStudent] = useState({});
   const [allAssessments, setAllAssessments] = useState([])
   const [selectedAssessment, setSelectedAssessment] = useState(null);
   const [selectedOption, setSelectedOption] = useState('Select Type');

   const [anchorEl, setAnchorEl] = useState(null);
   const open = Boolean(anchorEl);

   const handleClick = (event) => {
      setAnchorEl(event.currentTarget);
   };
   const handleClose = () => {
      setAnchorEl(null);
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setAssessment({
         ...assessment,
         [name]: value
      })
   };

   const handleSelect = (eventKey) => {
      setSelectedOption(eventKey);
      setAssessment({ ...assessment, type: eventKey });
   };

   const getAllAssessments = async () => {
      try {
         const res = await axiosInstance.get('api/user/teacher/allassessment', {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`
            }
         })
         if (res.data.success) {
            setAllAssessments(res.data.results.assessments)
            setStudent({
               stuIDs: res.data.results.students.studentIDs,
               names: res.data.results.students.studentNames
            });
         }
         else {
            alert(res.data.message)
         }
      } catch (err) {
         console.log(err)
      }
   }

   useEffect(() => {
      getAllAssessments()
   }, [])

   const assignedAssessment = async (studentID, assessmentID) => {
      try {
         const res = await axiosInstance.post(`/api/user/teacher/assignassessment/${assessmentID}`, { studentID }, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`
            }
         })
         if (res.data.success) {
            alert(res.data.message)
         } else {
            alert(res.data.message)
         }
         handleClose()
      } catch (error) {
         console.log(error)
         alert(error)
      }
   }

   const handleSubmit = async () => {
      try {
         const res = await axiosInstance.post('/api/user/teacher/addassessment', assessment, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
         })
         if (res.data.success) {
            alert(res.data.message)
            getAllAssessments()
         } else {
            alert("Failed to add new Assessment");
         }
      } catch (error) {
         console.error('An error occurred:', error);
      }
   }


   return (
      <div>
         <h3 className='text-center my-4 fw-bold fs-2'>Create Assessment</h3>
         <Container style={{ width: '60%', border: '1px solid lightblue', borderRadius: '5px', padding: '30px' }}>
            <Form onSubmit={handleSubmit}>
               <Row className="mb-3">
                  <Form.Group as={Col} md="16">
                     <Dropdown className='my-3'>
                        <Dropdown.Toggle variant="outline-secondary" id="dropdown-basic">
                           {selectedOption}
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                           <Dropdown.Item onClick={() => handleSelect("Assessment")}>Assessment</Dropdown.Item>
                           <Dropdown.Item onClick={() => handleSelect("Home Work")}>Home Work</Dropdown.Item>
                        </Dropdown.Menu>
                     </Dropdown>
                  </Form.Group>
                  <Form.Group as={Col} md="16">
                     <Form.Label>Title</Form.Label>
                     <InputGroup hasValidation>
                        <Form.Control
                           type="text"
                           placeholder="Title"
                           aria-describedby="inputGroupPrepend"
                           required
                           name='title'
                           value={assessment.title}
                           onChange={handleChange}
                        />
                     </InputGroup>
                  </Form.Group>
               </Row>
               <Row className="mb-3">
                  <FloatingLabel
                     label="Description"
                     className="mt-4"
                  >
                     <Form.Control
                        name='description'
                        value={assessment.description}
                        onChange={handleChange}
                        as="textarea"
                        placeholder="Leave a comment here"
                     />
                  </FloatingLabel>
               </Row>
               <Button variant="contained" color="success" type="submit">Submit Assessment</Button>
            </Form>

         </Container>

         <h3 className='text-center my-4 fw-bold fs-2'>All Assessments</h3>
         <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
               <TableHead>
                  <TableRow>
                     <StyledTableCell>Assesment ID</StyledTableCell>
                     <StyledTableCell align="left">Work Type</StyledTableCell>
                     <StyledTableCell align="left">Assessment Title</StyledTableCell>
                     <StyledTableCell align="left">Assessement Descrpition</StyledTableCell>
                     <StyledTableCell align="left">Assigned</StyledTableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {
                     allAssessments.length > 0 ? (
                        allAssessments.map((assessment) => (
                           <StyledTableRow key={assessment._id}>
                              <StyledTableCell component="th" scope="row">
                                 {assessment._id}
                              </StyledTableCell>
                              <StyledTableCell component="th" scope="row">
                                 {assessment.type}
                              </StyledTableCell>
                              <StyledTableCell component="th" scope="row">
                                 {assessment.title}
                              </StyledTableCell>
                              <StyledTableCell style={{ maxWidth: '300px', overflow: 'hidden', overflowX: 'auto' }} component="th" scope="row">
                                 {assessment.description}
                              </StyledTableCell>
                              <StyledTableCell component="th" scope="row">
                                 {assessment.type === 'Assessment' ? <div>
                                    <Button
                                       id="basic-button"
                                       aria-controls={open ? 'basic-menu' : undefined}
                                       aria-haspopup="true"
                                       aria-expanded={open ? 'true' : undefined}
                                       onClick={(e) => {
                                          setSelectedAssessment(assessment);
                                          handleClick(e);
                                       }}
                                       color='info'
                                    >
                                       Assigned to
                                    </Button>
                                    <Menu
                                       id="basic-menu"
                                       anchorEl={anchorEl}
                                       open={open}
                                       onClose={handleClose}
                                       slotProps={{
                                          paper: {
                                             style: {
                                                maxHeight: 200,
                                                overflowY: 'auto',
                                             },
                                          },
                                       }}
                                       MenuListProps={{
                                          'aria-labelledby': 'basic-button',
                                       }}
                                    >
                                       {student.stuIDs.map((studentId, index) => (
                                          <MenuItem key={studentId} onClick={() => assignedAssessment(studentId, selectedAssessment._id)}>
                                             {student.names[index]}
                                          </MenuItem>
                                       ))}
                                    </Menu>
                                 </div> : <></>}

                              </StyledTableCell>
                           </StyledTableRow>
                        )))
                        :
                        (<p className='px-2'>No assessment found</p>)
                  }
               </TableBody>
            </Table>
         </TableContainer>
      </div>
   )
}

export default TeacherHome
