import React, { useState, useContext } from 'react'
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { UserContext } from '../../App';
import { NavLink } from 'react-router-dom';
import { Badge } from 'antd';

import NotificationsIcon from '@mui/icons-material/Notifications';



const NavBar = ({ setSelectedComponent }) => {

   const user = useContext(UserContext)
   const [activeMenuItem, setActiveMenuItem] = useState('');

   if (!user) {
      return null
   }


   const handleLogout = () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
   }
   const handleOptionClick = (component) => {
      setSelectedComponent(component);
      // setActiveMenuItem(component);
   };

   return (
      <Navbar expand="lg" className="bg-body-tertiary">
         <Container fluid>
            <Navbar.Brand>
               <h3>Mentoring Capture</h3>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="navbarScroll" />
            <Navbar.Collapse id="navbarScroll">
               <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '100px' }} navbarScroll>
                  <NavLink onClick={() => handleOptionClick('home')}>Home</NavLink>
                  {user.userData.type === 'Teacher' && (<>
                     <NavLink onClick={() => handleOptionClick('assigned')}>Project Assigned</NavLink>
                  </>

                  )}
                  {user.userData.type === 'Admin' && (
                     <>
                        <NavLink onClick={() => handleOptionClick('cousres')}>Courses</NavLink>
                     </>
                  )}
                  {user.userData.type === 'Student' && (
                     <>
                        <NavLink onClick={() => handleOptionClick('homework')}>Home Work</NavLink>
                        {/* <NavLink onClick={() => handleOptionClick('enrolledcourese')}>Enrolled Courses</NavLink> */}
                     </>

                  )}
               </Nav>
               <Nav>
                  <h5 className='mx-3'>Hi {user.userData.name}</h5>
                  <Badge className={`notify ${activeMenuItem === 'notification' ? 'active' : ''}`} onClick={() => handleOptionClick('notification')} count={user.userData?.notification ? user.userData.notification.length : 0}>
                     <NotificationsIcon className="icon" />
                  </Badge>
                  <Button onClick={handleLogout} size='sm' variant='outline-danger'>Log Out</Button >
               </Nav>
            </Navbar.Collapse>
         </Container>
      </Navbar>
   )
}

export default NavBar

