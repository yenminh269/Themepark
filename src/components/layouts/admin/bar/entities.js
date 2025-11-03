import {MdOutlineSupervisedUserCircle, MdDashboard, MdAdd, MdList, MdBuild, MdOutlineAnalytics,
  MdPeople, MdOutlineLogout, MdOutlineReviews, MdCloud ,
  MdOutlineStorefront, MdReport  } from "react-icons/md"

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
      name: 'Most Frequently Ridden Rides per Month',
      path: '/admin/most-frequently-ridden-rides',
      icon: MdOutlineAnalytics
    },
    {
      name: 'Customer Summary',
      path: '/admin/customer-summary',
      icon: MdOutlineSupervisedUserCircle
    },
    {
      name: 'Ride Maintenance Report',
      path: '/admin/ride-maintenance-report',
      icon: MdReport
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
      name: 'Ride Gallery',
      path: '/admin/view/rides',
      icon: MdOutlineReviews
    },
    {
      name: 'Ride Lists',
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
      name: 'Log Out',
      path: '/logout',
      icon: MdOutlineLogout
    }
  ];
  export default entities;