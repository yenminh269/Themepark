import { Box, SimpleGrid, Icon, Flex, Text } from '@chakra-ui/react';
import {MdBarChart,MdAttachMoney,MdShoppingCart, MdPeople, MdTrendingUp
} from 'react-icons/md';
import StatCard from '../../card/StatCard';
import ChartCard from '../../card/ChartCard';
import DataTable from '../../data-table/DataTable';
import { api } from '../../../services/api';
import { useEffect, useState } from 'react';
import Loading from './loading/Loading';

const AdminDashboard = () => {
  // Mock data for stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avgTicketPerMonth, setAvgTicketPerMonth] = useState();
  const [averageRidesBrokenMaintenance, setAverageRidesBrokenMaintenance] = useState();
  const [storeSales, setStoreSales] = useState();

  useEffect(() => {
    getAvgRidesPerMonth();
  }, []);

  const getAvgRidesPerMonth = async() => {
    try{
      setLoading(true);
      const data = await api.getAvgRidesPerMonth();
      setAvgRidePerMonth(data);
      setError(null);
    }catch(err){
      setError('Failed to load average rides per month');
    } finally {
      setLoading(false);
    }
  }
  

  // Mock data for tables
  const recentOrdersColumns = ['Name', 'Status', 'Date', 'Amount'];
  const recentOrdersData = [
    ['Horizon UI PRO', 'Approved', 'Jan 12, 2024', '$2,400'],
    ['Chakra UI Kit', 'Pending', 'Jan 11, 2024', '$1,200'],
    ['Theme Bundle', 'Approved', 'Jan 10, 2024', '$3,500'],
    ['Premium Template', 'Rejected', 'Jan 9, 2024', '$890']
  ];

  const topProductsColumns = ['Product', 'Category', 'Sales', 'Revenue'];
  const topProductsData = [
    ['Product A', 'Electronics', '234', '$12,400'],
    ['Product B', 'Clothing', '189', '$8,900'],
    ['Product C', 'Books', '145', '$5,600'],
    ['Product D', 'Toys', '98', '$3,200']
  ];
  if(loading) return <Loading />

  return (
    <Box pt={{ base: '20px', md: '40px' }} px={{ base: '20px', md: '40px' }}>
      {/* Stats Grid */}
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, xl: 5 }}
        gap="20px"
        mb="20px"
      >
          <StatCard
            key={0}
            icon={<Icon as={MdBarChart} w="32px" h="32px" color="blue.500" />}
            name='Total Revenue'
            value={revenue}
          />
          <StatCard
            key={1}
            icon={<Icon as={MdAttachMoney} w="32px" h="32px" color="green.500" />}
            name='Average Rides Broken/Maintenance Per Month'
            value={averageRidesBrokenMaintenance}
          />
          <StatCard
            key={2}
            icon={<Icon as={MdShoppingCart} w="32px" h="32px" color="purple.500" />}
            name='Store Sales'
            value={storeSales}
          />
          <StatCard
            key={3}
            icon={<Icon as={MdShoppingCart} w="32px" h="32px" color="purple.500" />}
            name='Ride Ticket Sales'
            value={rideTicketSales}
          />
          <StatCard
            key={4}
            icon={<Icon as={MdTrendingUp} w="32px" h="32px" color="orange.500" />}
            name='Average Ride Tickets Per Month'
            value={avgTicketPerMonth}
          />
      </SimpleGrid>

      {/* Charts Row */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
        <ChartCard title="Weekly Revenue">
          <Flex h="200px" align="center" justify="center">
            <Text color="gray.400" fontSize="sm">
              Chart Placeholder - Weekly Stats
            </Text>
          </Flex>
        </ChartCard>
        <ChartCard title="Sales by Category">
          <Flex h="200px" align="center" justify="center">
            <Text color="gray.400" fontSize="sm">
              Pie Chart
            </Text>
          </Flex>
        </ChartCard>
      </SimpleGrid>

      {/* Tables Row */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} gap="20px" mb="20px">
        <DataTable
          title="Recent Orders"
          columns={recentOrdersColumns}
          data={recentOrdersData}
        />
        <DataTable
          title="Top Products"
          columns={topProductsColumns}
          data={topProductsData}
        />
      </SimpleGrid>
    </Box>
  );
};

export default AdminDashboard;