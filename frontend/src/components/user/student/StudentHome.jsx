import React, { useState, useEffect } from 'react';
import { Button, styled, TableRow, TableHead, TableContainer, Paper, Table, TableBody, TableCell, tableCellClasses } from '@mui/material';
import axiosInstance from '../../common/AxiosInstance';
import { Form, Modal } from 'react-bootstrap';

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
   '&:last-child td, &:last-child th': {
      border: 0,
   },
}));

const StudentHome = () => {
   const [allAssessments, setAllAssessments] = useState([]);
   const [selectedAssessment, setSelectedAssessment] = useState(null);

   const [assessmentContent, setAssessmentContent] = useState({
      file: '',
      para: ''
   });

   const handleClose = () => setSelectedAssessment(null);
   const handleShow = (assessment) => setSelectedAssessment(assessment);

   const handleDocumentChange = (e) => {
      const file = e.target.files[0];
      setAssessmentContent({ ...assessmentContent, file: file });
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setAssessmentContent({ ...assessmentContent, [name]: value });
   };

   const getAllAssessments = async () => {
      try {
         const res = await axiosInstance.get('api/user/student/getallassignedassessment', {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`
            }
         });

         if (res.data.success) {
            setAllAssessments(res.data.results);
         } else {
            alert(res.data.message);
         }
      } catch (err) {
         console.error(err);
      }
   };

   useEffect(() => {
      getAllAssessments();
   }, []);

   const handleSubmit = async (assignedID, assessmentID) => {
      const formData = new FormData();
      formData.append('file', assessmentContent.file);
      formData.append('para', assessmentContent.para);

      try {
         const response = await axiosInstance.post(`/api/user/student/submitanswer/${assessmentID}/${assignedID}`, formData, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
               "Content-Type": "multipart/form-data"
            },
         });
         if (response.data.success) {
            alert(response.data.message);
         } else {
            alert(response.data.message);
         }
      } catch (error) {
         console.error('Error in adding answer:', error);
      }
      handleClose();
   }

   const makeRegularDateTime = (datetime) => {
      const regularDateTime = new Date(datetime).toLocaleString();
      return regularDateTime;
   };

   return (
      <div>
         <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
               <TableHead>
                  <TableRow>
                     <StyledTableCell>Assessment ID</StyledTableCell>
                     <StyledTableCell align="left">Assessment Title</StyledTableCell>
                     <StyledTableCell align="left">Assigned Date</StyledTableCell>
                     <StyledTableCell align="left">Contents</StyledTableCell>
                     <StyledTableCell align="left">Assessment Status</StyledTableCell>
                     <StyledTableCell align="left">Assessment Score</StyledTableCell>
                     <StyledTableCell align="left">Assessment Description</StyledTableCell>
                     <StyledTableCell align="left">Action</StyledTableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {allAssessments.length > 0 ? (
                     allAssessments.map((assessment) => (
                        <StyledTableRow key={assessment.assignedAssessment._id}>
                           <StyledTableCell component="th" scope="row">
                              {assessment.assignedAssessment.assessmentID}
                           </StyledTableCell>
                           <StyledTableCell component="th" scope="row">
                              {assessment.assessmentDetails.title}
                           </StyledTableCell>
                           <StyledTableCell style={{ maxWidth: '300px', overflow: 'hidden', overflowX: 'auto' }} component="th" scope="row">
                              {makeRegularDateTime(assessment.assignedAssessment.assignedDate)}
                           </StyledTableCell>
                           <StyledTableCell align='center' key={assessment.assignedAssessment._id} component="th" scope="row">
                              {assessment.assignedAssessment.contents ? Object.keys(assessment.assignedAssessment.contents).length : 0}
                           </StyledTableCell>
                           <StyledTableCell align='center' component="th" scope="row">
                              {assessment.assignedAssessment.status}
                           </StyledTableCell>
                           <StyledTableCell align='center' component="th" scope="row">
                              {assessment.assignedAssessment.Marks}
                           </StyledTableCell>
                           <StyledTableCell style={{ maxWidth: '200px', overflowX: 'auto' }} component="th" scope="row">
                              {assessment.assessmentDetails.description}
                           </StyledTableCell>
                           <StyledTableCell className='d-flex' component="th" scope="row">
                              <Button style={{ fontSize: 10 }} size='small' variant="primary" onClick={() => handleShow(assessment)}>
                                 Add Items
                              </Button>
                              {selectedAssessment && selectedAssessment === assessment && (
                                 <Modal show={true} onHide={handleClose}>
                                    <Modal.Header closeButton>
                                       <Modal.Title>{assessment.assessmentDetails.title} contents</Modal.Title>
                                    </Modal.Header>
                                    <Modal.Body>
                                       <Form onSubmit={(e) => {
                                          e.preventDefault();
                                          handleSubmit(assessment.assignedAssessment._id, assessment.assignedAssessment.assessmentID);
                                       }}>
                                          <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                             <Form.Label>File</Form.Label>
                                             <Form.Control name='file' accept="application/pdf" onChange={handleDocumentChange} type='file' autoFocus />
                                          </Form.Group>
                                          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                                             <Form.Label>Description</Form.Label>
                                             <Form.Control name='para' onChange={handleChange} as="textarea" rows={3} />
                                          </Form.Group>
                                          <Button type='submit' variant="primary">
                                             Save Changes
                                          </Button>
                                       </Form>
                                    </Modal.Body>
                                 </Modal>
                              )}
                           </StyledTableCell>
                        </StyledTableRow>

                     ))
                  ) : (
                     <TableRow>
                        <TableCell colSpan={7} align="center">
                           <p className='px-2'>No assessments found</p>
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </TableContainer>
      </div>
   );
};

export default StudentHome;
