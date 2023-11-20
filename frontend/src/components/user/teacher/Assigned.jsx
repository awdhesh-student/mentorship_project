import React, { useEffect, useState } from 'react'
import { Button, styled, TableRow, TableHead, TableContainer, Paper, Table, TableBody, TableCell, tableCellClasses } from '@mui/material'
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
   // hide last border
   '&:last-child td, &:last-child th': {
      border: 0,
   },
}));

const Assigned = () => {
   const [assignedAssessment, setAssignedAssessment] = useState([])
   const [selectedAssessment, setSelectedAssessment] = useState(null);
   const [marks, setMarks] = useState(0)

   const handleClose = () => setSelectedAssessment(null);
   const handleShow = (assessment) => setSelectedAssessment(assessment);

   const allAssignedAssessment = async () => {
      try {
         const res = await axiosInstance.get('/api/user/teacher/getallassignedassessment', {
            headers: {
               Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
         })
         if (res.data.success) {
            setAssignedAssessment(res.data.results)
         }

      } catch (error) {
         console.log(error)
      }
   }

   useEffect(() => {
      allAssignedAssessment()
   }, [])

   const makeRegularDateTime = (datetime) => {
      const regularDateTime = new Date(datetime).toLocaleString();
      return regularDateTime
   }

   const handleDownload = async (url, assessmentId) => {
      try {
         const res = await axiosInstance.get('/api/user/teacher/getfiledownload', {
            headers: {
               'Authorization': `Bearer ${localStorage.getItem("token")}`,
            },
            params: { assessmentId },
            responseType: 'blob'
         });
         if (res.data) {
            const fileUrl = window.URL.createObjectURL(new Blob([res.data], { "type": "application/pdf" }));
            const downloadLink = document.createElement("a");
            document.body.appendChild(downloadLink);
            downloadLink.setAttribute("href", fileUrl);

            // Extract the file name from the url parameter
            const fileName = url.split("/").pop(); // Assuming the URL is in the format "uploads/document.pdf"

            // Set the file name for the download
            downloadLink.setAttribute("download", fileName);
            downloadLink.style.display = "none";
            downloadLink.click();
         } else {
            message.error(res.data.error);
         }
      } catch (error) {
         console.log(error);
         message.error('Something went wrong');
      }
   };

   const assignedMarks = async (assessmentId) => {
      try {
         const res = await axiosInstance.post(`/api/user/teacher/settingmarks/${assessmentId}`, { marks }, {
            headers: {
               Authorization: `Bearer ${localStorage.getItem("token")}`
            }
         })

         if (res.data.success) {
            alert(res.data.message)
            allAssignedAssessment()
         }
         else {
            alert(res.data.error)
         }
         setMarks(0)

      } catch (error) {
         console.log(error);
         message.error('Something went wrong');
      }
      handleClose()
   }

   return (
      <div>
         <h3 className='text-center my-4 fw-bold fs-2'>All Assigend Assessments</h3>
         <TableContainer component={Paper}>
            <Table sx={{ minWidth: 700 }} aria-label="customized table">
               <TableHead>
                  <TableRow>
                     <StyledTableCell>Student ID</StyledTableCell>
                     <StyledTableCell align="left">Assesment ID</StyledTableCell>
                     <StyledTableCell align="left">Assigned Date</StyledTableCell>
                     <StyledTableCell align="center">Assessement Content</StyledTableCell>
                     <StyledTableCell align="left">Status</StyledTableCell>
                     <StyledTableCell align="left">Marks</StyledTableCell>
                  </TableRow>
               </TableHead>
               <TableBody>
                  {
                     assignedAssessment.length > 0 ? (
                        assignedAssessment.map((assessment) => (
                           <StyledTableRow key={assessment._id}>
                              <StyledTableCell component="th" scope="row">
                                 {assessment.studentID}
                              </StyledTableCell>
                              <StyledTableCell component="th" scope="row">
                                 {assessment.assessmentID}
                              </StyledTableCell>
                              <StyledTableCell component="th" scope="row">
                                 {makeRegularDateTime(assessment.assignedDate)}
                              </StyledTableCell >
                              <StyledTableCell align='center' component="th" scope="row">
                                 {assessment.contents ? Object.keys(assessment.contents).length : 0}
                              </StyledTableCell >
                              <StyledTableCell component="th" scope="row">
                                 {assessment.status}
                              </StyledTableCell>
                              <StyledTableCell component="th" scope="row">
                                 <Button onClick={() => handleShow(assessment)}
                                    color='info'
                                 >
                                    {assessment.Marks}
                                 </Button>
                                 {selectedAssessment && selectedAssessment === assessment && (
                                    <Modal show={true} onHide={handleClose}>
                                       <Modal.Header closeButton>
                                          <Modal.Title>Assements Answers</Modal.Title>
                                       </Modal.Header>
                                       <Modal.Body>
                                          <Form onSubmit={(e) => {
                                             e.preventDefault()
                                             assignedMarks(assessment._id)
                                          }}>
                                             <div className="contents">
                                                <p>Contents: {assessment.contents && assessment.contents.content}</p>
                                                <p>File: <Button variant='link' onClick={() => handleDownload(assessment.contents.file.path, assessment._id)}>{assessment.contents.file.filename}</Button></p>

                                             </div>
                                             <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                                <Form.Label>Marks</Form.Label>
                                                <Form.Control
                                                   type="number"
                                                   placeholder="Enter Marks"
                                                   value={marks}
                                                   onChange={(e) => setMarks(e.target.value)}
                                                   autoFocus
                                                />
                                             </Form.Group>
                                             <Button variant="primary" type='submit'>
                                                Save Changes
                                             </Button>
                                          </Form>
                                       </Modal.Body>
                                    </Modal>
                                 )}
                              </StyledTableCell>
                           </StyledTableRow>
                        )))
                        :
                        (<p className='px-2'>No assigned assessment found</p>)
                  }
               </TableBody>
            </Table>
         </TableContainer>
      </div>
   )
}

export default Assigned
