import {MdOutlineSupervisedUserCircle, MdDashboard, MdAdd, MdList, MdBuild, MdOutlineAnalytics,
  MdPeople, MdOutlineLogout, MdOutlineReviews, MdCloud ,
  MdOutlineStorefront, MdReport, MdAccountCircle  } from "react-icons/md"

const entities = [
    {
      name: 'Main Dashboard',
      path: '/admin',
      icon: MdDashboard
    },
    {
      category: 'REPORT SECTION'
    },
    {
      name: 'Customer Summary',
      path: '/admin/customer-summary',
      icon: MdOutlineSupervisedUserCircle
    },
    {
      name: 'Ride Report',
      path: '/admin/ride-report',
      icon: MdOutlineAnalytics
    },
    {
      category: 'RIDES SECTION'
    },
    {
      name: 'Add New Ride',
      path: '/admin/add/ride',
      icon: MdAdd
    },
    {
      name: 'Manage Rides',
      path: '/admin/list/rides',
      icon: MdList
    },
    {
      name: 'Rain History',
      path: '/admin/rain-out',
      icon: MdCloud
    },
    {
      name: 'Ride Maintenance',
      path: '/admin/ride-maintenance',
      icon: MdBuild
    },
    {
      category: 'STORES'
    },
    {
      name: 'Add New Store',
      path: '/admin/add/store',
      icon: MdAdd
    },
    {
      name: 'Manage Stores',
      path: '/admin/list/stores',
      icon: MdOutlineStorefront
    },
    {
      category: 'EMPLOYEES'
    },
    {
      name: 'Manage Employees',
      path: '/admin/employees',
      icon: MdPeople
    },
    {
      category: 'ACCOUNT'
    },
    {
      name: 'My Profile',
      path: '/admin/profile',
      icon: MdAccountCircle
    },
    {
      name: 'Log Out',
      path: '/logout',
      icon: MdOutlineLogout
    }
  ];
  export default entities;