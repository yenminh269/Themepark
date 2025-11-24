import { Box, SimpleGrid, Icon, Flex, Text, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import {MdBarChart,MdAttachMoney,MdShoppingCart, MdPeople, MdTrendingUp
} from 'react-icons/md';
import StatCard from '../../card/StatCard';
import ChartCard from '../../card/ChartCard';
import { api } from '../../../services/api';
import { useEffect, useState, useRef } from 'react';
import Loading from './loading/Loading';
import { hover } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [avgTicketPerMonth, setAvgTicketPerMonth] = useState(0);
  const [averageRidesBrokenMaintenance, setAverageRidesBrokenMaintenance] = useState(0);
  const [storeSales, setStoreSales] = useState('0.00');
  const [rideTicketSales, setRideTicketSales] = useState('0.00');
  const [revenue, setRevenue] = useState('0.00');
  const [rideOrders, setRideOrders] = useState([]);
  const [orderOffset, setOrderOffset] = useState(0);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [orderDetails, setOrderDetails] = useState({});
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const [topProducts, setTopProducts] = useState([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState([]);
  const ordersTableRef = useRef(null);

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async() => {
    try{
      setLoading(true);
      const [
      avgTicketsData,
      revenueData,
      storeSalesData,
      rideTicketSalesData,
      avgBrokenData,
      rideOrdersData,
        topProductsData,
        weeklyRevenueData
      ] = await Promise.all([
      api.getAvgRidesPerMonth(),
      api.getTotalRevenue(),
      api.getStoreSales(),
      api.getRideTicketSales(),
      api.getAvgRidesBrokenMaintenance(),
        api.getRecentRideOrders(0, 5),
        api.getTopProducts(),
        api.getWeeklyRevenue()
      ]);

      setAvgTicketPerMonth(avgTicketsData || 0);
      setRevenue(revenueData.total || '0.00');
      setStoreSales(storeSalesData || '0.00');
      setRideTicketSales(rideTicketSalesData || '0.00');
      setAverageRidesBrokenMaintenance(avgBrokenData || 0);
      setRideOrders(rideOrdersData || []);
      setTopProducts(topProductsData || []);
      setWeeklyRevenue(weeklyRevenueData || []);
      setOrderOffset(5);

      setError(null);
    }catch(err){
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  const handleShowMore = async () => {
    try {
      const moreOrders = await api.getRecentRideOrders(orderOffset, 5);
      if (moreOrders.length < 5) {
        // No more orders available
        setHasMoreOrders(false);
      }
      if (moreOrders.length > 0) {
        setRideOrders(prev => [...prev, ...moreOrders]);
        setOrderOffset(prev => prev + 5);
      } else {
        // No orders returned at all
        setHasMoreOrders(false);
      }
    } catch (err) {
      console.error('Error loading more orders:', err);
    }
  };

  const handleBackToTop = async () => {
    try {
      setLoading(true);
      const firstOrders = await api.getRecentRideOrders(0, 5);
      setRideOrders(firstOrders);
      setOrderOffset(5);
      setHasMoreOrders(true);
      setExpandedOrders({});

      // Scroll to the orders table after data is loaded
      setTimeout(() => {
        if (ordersTableRef.current) {
          ordersTableRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } catch (err) {
      console.error('Error resetting orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleOrderDetails = async (orderId) => {
    if (expandedOrders[orderId]) {
      // Collapse
      setExpandedOrders(prev => ({ ...prev, [orderId]: false }));
    } else {
      // Expand and fetch details if not already loaded
      if (!orderDetails[orderId]) {
        try {
          const details = await api.getRideOrderDetails(orderId);
          setOrderDetails(prev => ({ ...prev, [orderId]: details }));
        } catch (err) {
          console.error('Error loading order details:', err);
        }
      }
      setExpandedOrders(prev => ({ ...prev, [orderId]: true }));
    }
  };
  

  // Define columns for ride orders table
  const recentOrdersColumns = ['Order ID', 'Date', 'Amount', 'Status', 'Actions'];
  if(loading) return <Loading />

  return (
    <Box>
      {/* Error Message */}
      {error && (
        <Box bg="red.100" color="red.700" p="4" borderRadius="md" mb="20px">
          {error}
        </Box>
      )}
      <h2 className="text-2xl font-bold mb-4 !text-[#4B5945]" >Dashboard</h2>
      {/* Charts Row */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap="20px" mb="20px">
        <ChartCard title="Weekly Revenue">
          <Box h="250px" w="100%">
            {weeklyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyRevenue}
                  margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="week"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total_revenue"
                    stroke="#3A6F43"
                    strokeWidth={2}
                    name="Total Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="ride_revenue"
                    stroke="#4299E1"
                    strokeWidth={2}
                    name="Ride Revenue"
                  />
                  <Line
                    type="monotone"
                    dataKey="store_revenue"
                    stroke="#9F7AEA"
                    strokeWidth={2}
                    name="Store Revenue"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Flex h="100%" align="center" justify="center">
                <Text color="gray.400" fontSize="sm">No revenue data available</Text>
              </Flex>
            )}
          </Box>
        </ChartCard>
        <ChartCard title="Top Merchandise Items">
          <Box h="250px">
            {topProducts.length > 0 ? (
              <Flex h="100%" align="flex-end" justify="space-around" gap="8px">
                {topProducts.slice(0, 5).map((product, index) => {
                  const maxRevenue = Math.max(...topProducts.map(p => parseFloat(p.total_revenue)));
                  const barHeight = (product.total_revenue / maxRevenue) * 100;

                  return (
                    <Flex key={index} direction="column" align="center" flex="1" h="100%">
                      <Flex direction="column" justify="flex-end" h="85%" w="100%">
                        <Flex direction="column" align="center" mb="4px">
                          <Text fontSize="xs" fontWeight="600" color="green.600">
                            ${product.total_revenue}
                          </Text>
                        </Flex>
                        <Box
                          w="100%"
                          h={`${barHeight}%`}
                          bg="green.400"
                          borderRadius="md"
                          transition="height 0.3s ease"
                        />
                      </Flex>
                      <Text
                        fontSize="xs"
                        fontWeight="500"
                        color="gray.700"
                        mt="8px"
                        textAlign="center"
                        noOfLines={2}
                        h="15%"
                      >
                        {product.product_name}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            ) : (
              <Flex h="100%" align="center" justify="center">
                <Text color="gray.400" fontSize="sm">No product data available</Text>
              </Flex>
            )}
          </Box>
        </ChartCard>
      </SimpleGrid>

      {/* Recent Ride Orders Table */}
      <Box mb="20px">
        <Box
          ref={ordersTableRef}
          p="20px"
          bg="white"
          borderRadius="20px"
          boxShadow="sm"
        >
          <Text
            color="#3A6F43"
            fontSize="lg"
            fontWeight="700"
            mb="20px"
          >
            Recent Ride Orders
          </Text>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  {recentOrdersColumns.map((column, index) => (
                    <Th key={index} color="gray.500" fontSize="xs" fontWeight="700">
                      {column}
                    </Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {rideOrders.map((order) => {
                  const orderDate = new Date(order.order_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  });
                  const isExpanded = expandedOrders[order.order_id];

                  return (
                    <>
                      <Tr key={order.order_id} _hover={{ bg: "#c6cbb8ff" }}>
                        <Td color="gray.900" fontSize="md" fontWeight="500">{order.order_id}</Td>
                        <Td color="gray.900" fontSize="md" fontWeight="500">{orderDate}</Td>
                        <Td color="gray.900" fontSize="md" fontWeight="500">${parseFloat(order.total_amount).toFixed(2)}</Td>
                        <Td color="gray.900" fontSize="md" fontWeight="500">{order.status}</Td>
                        <Td>
                          <button
                            onClick={() => handleToggleOrderDetails(order.order_id)}
                            className="py-1 underline"
                            style={isExpanded ? { color: '#176B87' }: { } }
                          >
                            {isExpanded ? 'Hide' : 'View'} Details
                          </button>
                        </Td>
                      </Tr>
                      {isExpanded && (
                        <Tr key={`details-${order.order_id}`}>
                          <Td colSpan={5} bg="gray.50" p={4}>
                            <Text fontWeight="bold" mb={2}>Order #{order.order_id} Details:</Text>
                            {orderDetails[order.order_id] && orderDetails[order.order_id].length > 0 ? (
                              <Box as="table" width="100%" fontSize="sm">
                                <thead>
                                  <tr>
                                    <Text as="th" textAlign="left" p={2}>Ride Name</Text>
                                    <Text as="th" textAlign="left" p={2}>Quantity</Text>
                                    <Text as="th" textAlign="left" p={2}>Price/Ticket</Text>
                                    <Text as="th" textAlign="left" p={2}>Subtotal</Text>
                                  </tr>
                                </thead>
                                <tbody>
                                  {orderDetails[order.order_id].map((detail, idx) => (
                                    <tr key={idx}>
                                      <Text as="td" p={2}>{detail.ride_name}</Text>
                                      <Text as="td" p={2}>{detail.number_of_tickets}</Text>
                                      <Text as="td" p={2}>${parseFloat(detail.price_per_ticket).toFixed(2)}</Text>
                                      <Text as="td" p={2}>${(detail.number_of_tickets * parseFloat(detail.price_per_ticket)).toFixed(2)}</Text>
                                    </tr>
                                  ))}
                                </tbody>
                              </Box>
                            ) : (
                              <Text>Loading details...</Text>
                            )}
                          </Td>
                        </Tr>
                      )}
                    </>
                  );
                })}
              </Tbody>
            </Table>
          </Box>

          <Flex justify="center" mt={4}>
            <button
              onClick={hasMoreOrders ? handleShowMore : handleBackToTop}
              className="px-4 py-2 underline"
            >
              {hasMoreOrders ? 'Show More' : 'Back to Top'}
            </button>
          </Flex>
        </Box>
      </Box>
      {/* Stats Grid */}
      <SimpleGrid
        columns={{ base: 1, md: 2, lg: 3, xl: 5 }}
        gap="20px"
        mb="20px"
      >
          <StatCard
            key={0}
            icon={<Icon as={MdAttachMoney} w="32px" h="32px" color="green.500" />}
            name='Total Revenue'
            value={`$${revenue}`}
          />
          <StatCard
            key={1}
            icon={<Icon as={MdBarChart} w="32px" h="32px" color="red.500" />}
            name='Average Rides Broken/Maintenance Per Month'
            value={averageRidesBrokenMaintenance}
          />
          <StatCard
            key={2}
            icon={<Icon as={MdShoppingCart} w="32px" h="32px" color="purple.500" />}
            name='Total Store Sales'
            value={`$${storeSales}`}
          />
          <StatCard
            key={3}
            icon={<Icon as={MdShoppingCart} w="32px" h="32px" color="blue.500" />}
            name='Total Ride Ticket Sales'
            value={`$${rideTicketSales}`}
          />
          <StatCard
            key={4}
            icon={<Icon as={MdTrendingUp} w="32px" h="32px" color="orange.500" />}
            name='Average Ride Tickets Per Month'
            value={avgTicketPerMonth}
          />
      </SimpleGrid>

    </Box>
  );
};

export default AdminDashboard;