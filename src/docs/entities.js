import { MdDashboard, MdAdd, MdList, MdBuild, MdPeople, MdOutlineLogout } from "react-icons/md"

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
      name: 'Ride Lists',
      path: '/admin/list/rides',
      icon: MdList
    },
    {
      category: 'MAINTENANCE'
    },
    {
      name: 'Schedule Ride Maintenance',
      path: '/admin/add/maintenance',
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