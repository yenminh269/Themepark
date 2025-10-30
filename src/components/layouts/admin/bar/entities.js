import { MdDashboard, MdAdd, MdList, MdBuild, MdPeople, MdOutlineLogout, MdOutlineReviews, MdCloud } from "react-icons/md"

const entities = [
    {
      name: 'Main Dashboard',
      path: '/admin',
      icon: MdDashboard
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
      name: 'Rain Out Management',
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
      icon: MdList
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