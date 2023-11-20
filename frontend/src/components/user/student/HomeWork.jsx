import React, { useEffect, useState } from 'react'
import axiosInstance from '../../common/AxiosInstance'
import { Card, CardActions, CardContent, Button, Typography } from '@mui/material'
import { Form, Modal } from 'react-bootstrap';

const HomeWork = () => {
   const [homeWork, setHomeWork] = useState([])
   const [homeWorkStatus, setHomeWorkStatus] = useState([])
   const [selectedHomeWork, setSelectedHomeWork] = useState(null);
   const [homeWorkContent, setHomeWorkContent] = useState({
      file: '',
      para: ''
   });

   const handleClose = () => setSelectedHomeWork(null);
   const handleShow = (assessment) => setSelectedHomeWork(assessment);

   const handleDocumentChange = (e) => {
      const file = e.target.files[0];
      setHomeWorkContent({ ...homeWorkContent, file: file });
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setHomeWorkContent({ ...homeWorkContent, [name]: value });
   };

   const fetchHomeWork = async () => {
      try {
         const res = await axiosInstance.get('/api/user/student/allhomeworktasks', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
         })

         if (res.data.success) {
            setHomeWork(res.data.data.allHomeWork)
            setHomeWorkStatus(res.data.data.statusHomeWorkID)
         } else {
            alert("Error fetching homework")
         }
      } catch (error) {
         console.error(error);
      }
   }

   useEffect(() => {
      fetchHomeWork()
   }, [])


   const handleSubmit = async (homeworkID) => {
      const formData = new FormData();
      formData.append('file', homeWorkContent.file);
      formData.append('para', homeWorkContent.para);

      try {
         const response = await axiosInstance.post(`/api/user/student/submithomework/${homeworkID}`, formData, {
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

   return (
      <>
         {homeWork.length > 0 ? (
            homeWork.map((work, index) => (
               <Card key={index} sx={{ maxWidth: 345 }}>
                  <CardContent>
                     <Typography gutterBottom variant="h5" component="div">
                        {work.title}
                     </Typography>
                     <Typography variant="body2" color="text.secondary">
                        {work.description}
                     </Typography>
                  </CardContent>
                  <CardActions>
                     {homeWorkStatus.length > 0 && homeWorkStatus[index]?.status !== "completed" ? (
                        <Button size="small" onClick={() => handleShow(work)}>Add Contents</Button>
                     ) : (
                        <Typography variant="body2" color="text.secondary">
                           {homeWorkStatus[index]?.status}
                        </Typography>
                     )}
                  </CardActions>
                  {selectedHomeWork && selectedHomeWork === work && (
                     <Modal show={true} onHide={handleClose}>
                        <Modal.Header closeButton>
                           <Modal.Title>{work.title}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                           <Form onSubmit={(e) => {
                              e.preventDefault();
                              handleSubmit(work._id, work.assessmentID);
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
               </Card>
            ))
         ) : null}
      </>
   )
}

export default HomeWork
