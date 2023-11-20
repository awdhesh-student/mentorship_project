import React, { useContext, useState } from 'react';
import NavBar from './NavBar';
import UserHome from "./UserHome"
import { Container } from 'react-bootstrap';
import { UserContext } from '../../App';
import Assigned from '../user/teacher/Assigned';
import Notification from './Notification';
import HomeWork from './../user/student/HomeWork';


const Dashboard = () => {
   const user = useContext(UserContext)
   const [selectedComponent, setSelectedComponent] = useState('home');

   const renderSelectedComponent = () => {
      switch (selectedComponent) {
         case 'home':
            return <UserHome />
         case 'assigned':
            return <Assigned />
         case 'notification':
             return <Notification />
         case 'homework':
            return <HomeWork />
         // case 'cousres':
         //    return <AllCourses />
         default:
            return <UserHome />

      }
   };
   return (
      <>
         <NavBar setSelectedComponent={setSelectedComponent} />
         <Container className='my-3'>
            {renderSelectedComponent()}
         </Container>
      </>
   );
};

export default Dashboard;