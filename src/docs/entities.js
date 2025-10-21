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
      path: '/admin/rides/add',
      icon: MdAdd
    },
    {
      name: 'Ride Lists',
      path: '/admin/rides/list',
      icon: MdList
    },
    {
      category: 'MAINTENANCE'
    },
    {
      name: 'Schedule Ride Maintenance',
      path: '/admin/maintenance/add',
      icon: MdBuild
    },
    {
      category: 'INVENTORY'
    },
    {
      name: 'Add New Item',
      path: '/admin/inventory/add',
      icon: MdAdd
    },
    {
      name: 'Item Lists',
      path: '/admin/inventory/list',
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