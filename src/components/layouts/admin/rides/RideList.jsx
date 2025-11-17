import { Box, SimpleGrid, Card, CardBody, CardFooter, Image, Text, Button, HStack, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useToast } from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { api, getImageUrl } from '../../../../services/api';
import { useState, useEffect, useMemo, useRef } from 'react';
import Loading from '../loading/Loading';

function RideLists() {
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'open', 'closed', 'maintenance', 'approve_expand', 'reject_expand', 'pending_expand_request'
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      setLoading(true);
      const response = await api.getAllRides();
      setRides(response);
    } catch (err) {
      console.error('Failed to load rides:', err);
      toast({
        title: 'Error',
        description: 'Failed to load rides. Please check backend connection.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    // First filter by status
    let filtered = rides;
    if (statusFilter !== 'all') {
      filtered = rides.filter(ride => ride.status?.toLowerCase() === statusFilter.toLowerCase());
    }

    // Then apply search filter
    if (!searchText) return filtered;
    const normalizedSearch = searchText.toLowerCase().trim();
    return filtered.filter(ride =>
      ride.name?.toLowerCase().includes(normalizedSearch) ||
      ride.description?.toLowerCase().includes(normalizedSearch) ||
      ride.status?.toLowerCase().includes(normalizedSearch)
    );
  }, [rides, searchText, statusFilter]);

  const handleEdit = (ride) => {
    setEditingId(ride.ride_id);
    setEditedData({
      name: ride.name,
      price: ride.price,
      capacity: ride.capacity,
      description: ride.description,
      open_time: ride.open_time,
      close_time: ride.close_time,
      photo_path: ride.photo_path,
      status: ride.status,
    });
    setPhotoFile(null);
  };

  const handleSave = async (rideId) => {
  try {
  const currentRide = rides.find(r => r.ride_id === rideId);

  // For rides with pending_expand_request, we only need to update the status
  if (currentRide?.status === 'pending_expand_request') {
    setLoading(true);
    // Only send status update
    const updateData = {
      ride_id: rideId,
      status: editedData.status
    };
    await api.updateRide(updateData, rideId);
    await fetchRides();
    setEditingId(null);
    setEditedData({});
    setPhotoFile(null);
    toast({
      title: 'Success',
      description: 'Ride status updated successfully.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    setLoading(false);
    return;
  }

  // For other rides, validate and update all fields
  // Validate photo is required
  if (!photoFile && !editedData.photo_path) {
  toast({
  title: 'Photo Required',
  description: 'Please upload a file or provide a photo URL/Path',
  status: 'warning',
  duration: 4000,
  isClosable: true,
  });
  return;
  }

  // Validate description length
  if (editedData.description.length > 150) {
  toast({
  title: 'Description Too Long',
  description: 'Description must not exceed 150 characters',
  status: 'warning',
  duration: 4000,
  isClosable: true,
  });
  return;
  }

  // Validate price (decimal 6,2 constraint: max 9999.99)
  if (editedData.price) {
  const priceNum = parseFloat(editedData.price);
  if (isNaN(priceNum) || priceNum < 0 || priceNum > 9999.99) {
  toast({
  title: 'Invalid Price',
  description: 'Price must be between 0 and 9999.99',
  status: 'warning',
  duration: 4000,
  isClosable: true,
  });
  return;
  }
  }

  // Validate photo_path length
  if (editedData.photo_path && editedData.photo_path.length > 255) {
  toast({
  title: 'Photo Path Too Long',
  description: 'Photo path must not exceed 255 characters',
  status: 'warning',
  duration: 4000,
  isClosable: true,
  });
  return;
  }

  setLoading(true);

  let updateData;

  // If photoFile is selected, use FormData; otherwise send JSON
  if (photoFile) {
  const formData = new FormData();
  formData.append('file', photoFile);
  formData.append('name', editedData.name);
  formData.append('description', editedData.description);
  formData.append('price', editedData.price);
    formData.append('capacity', editedData.capacity);
    formData.append('open_time', editedData.open_time);
    formData.append('close_time', editedData.close_time);
         formData.append('ride_id', rideId);
         updateData = formData;
       } else {
         // Remove status from editedData before sending
         const { status, ...dataWithoutStatus } = editedData;
         updateData = { ride_id: rideId, ...dataWithoutStatus };
       }

       await api.updateRide(updateData, rideId);
  await fetchRides();
  setEditingId(null);
  setEditedData({});
  setPhotoFile(null);
  toast({
  title: 'Success',
    description: 'Ride updated successfully.',
      status: 'success',
    duration: 3000,
      isClosable: true,
      });
     } catch (err) {
       console.error('Failed to update ride:', err);
       toast({
         title: 'Error',
         description: 'Failed to update ride.',
         status: 'error',
         duration: 5000,
         isClosable: true,
       });
     } finally {
       setLoading(false);
     }
   };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
    setPhotoFile(null);
  };

  const handleInputChange = (key, value) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const handleDeleteClick = (ride) => {
    setDeleteTarget(ride);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    onClose();
    try {
      setLoading(true);
      await api.deleteRide(deleteTarget.ride_id);
      await fetchRides();
      toast({
        title: 'Success',
        description: `${deleteTarget.name} has been deleted successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Failed to delete ride:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete ride.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  if (loading) return <Loading isLoading={loading} />;

  return (
    <Box position="relative">
      <h2 className="text-2xl font-bold mb-4 !text-[#4B5945]" >Manage Rides</h2>

      {/* Status Filter Buttons */}
      <HStack spacing={2} mb={4} flexWrap="wrap">
        <Button
          size="sm"
          bg={statusFilter === 'all' ? "#4B5945" : "transparent"}
          color={statusFilter === 'all' ? "white" : "black"}
          border={statusFilter === 'all' ? "none" : "1px solid black"}
          _hover={{ bg: statusFilter === 'all' ? "#3a4635" : "gray.200" }}
          onClick={() => setStatusFilter('all')}
        >
          All ({rides.length})
        </Button>

        <Button
          size="sm"
          bg={statusFilter === 'open' ? "#28a745" : "transparent"}
          color={statusFilter === 'open' ? "white" : "black"}
          border={statusFilter === 'open' ? "none" : "1px solid black"}
          _hover={{ bg: statusFilter === 'open' ? "#218838" : "gray.200" }}
          onClick={() => setStatusFilter('open')}
        >
          Open ({rides.filter(r => r.status === 'open').length})
        </Button>

        <Button
          size="sm"
          bg={statusFilter === 'closed' ? "#dc3545" : "transparent"}
          color={statusFilter === 'closed' ? "white" : "black"}
          border={statusFilter === 'closed' ? "none" : "1px solid black"}
          _hover={{ bg: statusFilter === 'closed' ? "#c82333" : "gray.200" }}
          onClick={() => setStatusFilter('closed')}
        >
          Closed ({rides.filter(r => r.status === 'closed').length})
        </Button>

        <Button
          size="sm"
          bg={statusFilter === 'maintenance' ? "#ffc107" : "transparent"}
          color={statusFilter === 'maintenance' ? "black" : "black"}
          border={statusFilter === 'maintenance' ? "none" : "1px solid black"}
          _hover={{ bg: statusFilter === 'maintenance' ? "#e0a800" : "gray.200" }}
          onClick={() => setStatusFilter('maintenance')}
        >
          Maintenance ({rides.filter(r => r.status === 'maintenance').length})
        </Button>

        <Button
          size="sm"
          bg={statusFilter === 'approve_expand' ? "#17a2b8" : "transparent"}
          color={statusFilter === 'approve_expand' ? "white" : "black"}
          border={statusFilter === 'approve_expand' ? "none" : "1px solid black"}
          _hover={{ bg: statusFilter === 'approve_expand' ? "#138496" : "gray.200" }}
          onClick={() => setStatusFilter('approve_expand')}
        >
          Approved Expand ({rides.filter(r => r.status === 'approve_expand').length})
        </Button>

        <Button
          size="sm"
          bg={statusFilter === 'reject_expand' ? "#6c757d" : "transparent"}
          color={statusFilter === 'reject_expand' ? "white" : "black"}
          border={statusFilter === 'reject_expand' ? "none" : "1px solid black"}
          _hover={{ bg: statusFilter === 'reject_expand' ? "#5a6268" : "gray.200" }}
          onClick={() => setStatusFilter('reject_expand')}
        >
          Rejected Expand ({rides.filter(r => r.status === 'reject_expand').length})
        </Button>

        <Button
          size="sm"
          bg={statusFilter === 'pending_expand_request' ? "#007bff" : "transparent"}
          color={statusFilter === 'pending_expand_request' ? "white" : "black"}
          border={statusFilter === 'pending_expand_request' ? "none" : "1px solid black"}
          _hover={{ bg: statusFilter === 'pending_expand_request' ? "#0056b3" : "gray.200" }}
          onClick={() => setStatusFilter('pending_expand_request')}
        >
          Pending Expand ({rides.filter(r => r.status === 'pending_expand_request').length})
        </Button>
      </HStack>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search rides by name, description, or status..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="border rounded px-3 py-2 mb-4 mb-6 w-full"
        style={{ borderColor: '#ccc', fontSize: '14px' }}
      />

      {/* Rides Grid */}
      {filteredData.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredData.map((ride) => (
            <Card
              key={ride.ride_id}
              borderRadius="12px"
              overflow="hidden"
              boxShadow={editingId === ride.ride_id ? 'xl' : 'md'}
              transition="all 0.3s"
              _hover={{ boxShadow: editingId === ride.ride_id ? 'xl' : 'lg', transform: 'translateY(-4px)' }}
              bg={editingId === ride.ride_id ? '#EEF5FF' : 'white'}
            >
              {/* Image */}
              <Image
                src={getImageUrl(ride.photo_path)}
                alt={ride.name}
                h="250px"
                w="100%"
                objectFit="cover"
              />

              {/* Card Body */}
              <CardBody pb={2}>
                {editingId === ride.ride_id ? (
                  // Edit Mode
                  <Box>
                    {ride.status === 'pending_expand_request' ? (
                      // Only show status selector for pending_expand_request rides
                      <Box>
                        <Text fontSize="xl" fontWeight="bold" color="#3A6F43">
                          {ride.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600" >
                          {ride.description}
                        </Text>

                        <Box p={3} bg="blue.100" borderRadius="md" mb={4}>
                          <Text fontSize="md" fontWeight="bold" color="blue.800" mb={2}>
                            Expansion Request Decision
                          </Text>
                          <Text fontSize="sm" color="gray.800" mb={3}>
                            This ride has a pending expansion request. Please approve or reject the request.
                          </Text>
                        </Box>

                        <HStack justify="space-between" mb={2}>
                          <label className='font-bold text-red-600'>Decision:</label>
                          <select
                            value={editedData.status}
                            onChange={(e) => handleInputChange('status', e.target.value)}
                            className="border border-black rounded px-2 py-1"
                            style={{ width: '180px' }}
                          >
                            <option value="pending_expand_request">Pending</option>
                            <option value="approve_expand">Approve Expansion</option>
                            <option value="reject_expand">Reject Expansion</option>
                          </select>
                        </HStack>
                        <Box fontSize="sm" color="gray.700" mt={4} p={3} bg="gray.50" borderRadius="md">
                          <HStack justify="space-between">
                            <Text fontWeight="bold">Price:</Text>
                            <Text>${parseFloat(ride.price).toFixed(2)}</Text>
                          </HStack>
                          <HStack justify="space-between" >
                            <Text fontWeight="bold">Capacity:</Text>
                            <Text>{ride.capacity}</Text>
                          </HStack>
                          <HStack justify="space-between">
                            <Text fontWeight="bold">Hours:</Text>
                            <Text fontSize="xs">
                              {new Date(`2000-01-01T${ride.open_time}`).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true})} - {new Date(`2000-01-01T${ride.close_time}`).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true})}
                            </Text>
                          </HStack>
                        </Box>
                      </Box>
                    ) : (
                      // Full edit mode for other rides
                      <Box>
                        <label className='font-bold text-[#176B87]'>Ride Name:</label>
                        <input
                          type="text"
                          value={editedData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Ride Name"
                          className="border border-black rounded px-2 py-1 mb-3 w-full"
                          style={{ fontSize: '18px', fontWeight: 'bold' }}
                        />

                        <label className='font-bold text-[#176B87]'>Description:</label>
                        <textarea
                        value={editedData.description}
                        onChange={(e) => handleInputChange('description', e.target.value.slice(0, 150))}
                        placeholder="Description"
                        className="border border-black rounded px-2 py-1  w-full"
                        rows={2}
                        style={{ fontSize: '14px', resize: 'none' }}
                        />
                        <Text fontSize="xs" color="gray.600" mb={0}>{editedData.description.length}/150 characters</Text>

                        <label className='font-bold text-[#176B87]'>Photo: <span style={{color: 'red'}}>*</span></label>
                        <div style={{marginBottom: '8px'}}>
                        <label style={{fontSize: '14px', color: 'gray.600'}}>Choose a file from your device:</label>
                        <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          setPhotoFile(e.target.files[0]);
                          handleInputChange('photo_path', '');
                          }}
                          className="border border-black rounded px-2 py-1 w-full"
                            style={{ fontSize: '13px' }}
                          />
                        {photoFile && <Text fontSize="xs" color="green.500">File selected: {photoFile.name}</Text>}
                        </div>
                        <div>
                        <label style={{fontSize: '14px', color: 'gray.600'}}>Or paste URL/Path:</label>
                        <input
                        type="text"
                        value={editedData.photo_path}
                        onChange={(e) => {
                          handleInputChange('photo_path', e.target.value);
                            setPhotoFile(null);
                          }}
                            placeholder="Photo URL or Path"
                              className="border border-black rounded px-2 py-1 w-full"
                              style={{ fontSize: '13px' }}
                              maxLength="255"
                            />
                            <Text fontSize="xs" color={editedData.photo_path.length > 255 ? 'red.500' : 'gray.600'}>{editedData.photo_path.length}/255 characters</Text>
                          </div>


                        <Box fontSize="sm" color="gray.700" space={2}>
                          <HStack justify="space-between" mb={2} >
                            <label className='font-bold text-[#176B87]'>Price:</label>
                            <input type="number"
                                  step="0.01"
                                  value={editedData.price}
                                  onChange={(e) => handleInputChange('price', e.target.value)}
                                  className="border border-black rounded px-2 py-1"
                                  style={{ width: '100px', paddingLeft: '22px'}}
                                />
                          </HStack>

                          <HStack justify="space-between">
                          <label className='font-bold text-[#176B87]'>Capacity:</label>
                          <input
                          type="number"
                          value={editedData.capacity}
                          onChange={(e) => handleInputChange('capacity', e.target.value)}
                          className="border border-black rounded px-2 py-1"
                          style={{ width: '100px' }}
                          />
                          </HStack>
                          <Text margin={0} padding={0} fontSize="xs" color="gray.600">Range(2-70)</Text>

                          <HStack justify="space-between" mb={2}>
                          <label className='font-bold text-[#176B87]'>Status:</label>
                            <Text
                              className="border border-gray-300 rounded px-2 py-1 bg-gray-100"
                              style={{ width: '100px', fontSize: '14px' }}
                            >
                              {editedData.status || ''}
                            </Text>
                          </HStack>

                          <HStack justify="space-between" mb={2}>
                            <label className='font-bold w-full text-[#176B87]'>Open Time:</label>
                            <input
                            type="time"
                            value={editedData.open_time}
                            onChange={(e) => handleInputChange('open_time', e.target.value)}
                            className="border  border-black  rounded px-2 py-1"
                            />
                          </HStack>
                          <HStack justify="space-between">
                            <label className='font-bold w-full text-[#176B87]'>Close Time:</label>
                            <input
                            type="time"
                            value={editedData.close_time}
                            onChange={(e) => handleInputChange('close_time', e.target.value)}
                              className="border border-black rounded px-2 py-1"
                              />
                          </HStack>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : (
                  // View Mode
                  <>
                    <Text fontSize="xl" fontWeight="bold" mb={2} color="#3A6F43">
                      {ride.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={3} noOfLines={3}>
                      {ride.description}
                    </Text>

                    {/* Ride Details */}
                    <Box fontSize="sm" color="gray.700" space={2}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="bold">Price:</Text>
                        <Text>${parseFloat(ride.price).toFixed(2)}</Text>
                      </HStack>
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="bold">Capacity:</Text>
                        <Text>{ride.capacity}</Text>
                      </HStack>
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="bold">Status:</Text>
                        <Box
                          px={2}
                          py={1}
                          borderRadius="4px"
                          bg={ride.status === 'open' ? '#C6F6D5' : ride.status === 'maintenance' ? '#FAF089' :'#FED7D7'}
                          color={ride.status === 'open' ? '#22543D' : ride.status === 'maintenance' ?  '#744210' : '#742A2A'}
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {ride.status}
                        </Box>
                      </HStack>
                      <HStack justify="space-between" mb={1}>
                      <Text fontWeight="bold">Hours:</Text>
                      <Text>
                          {new Date(`2000-01-01T${ride.open_time}`).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true})} - {new Date(`2000-01-01T${ride.close_time}`).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true})}
                         </Text>
                       </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Date Added:</Text>
                        <Text>{new Date(ride.created_at).toLocaleDateString()}</Text>
                      </HStack>
                    </Box>
                  </>
                )}
              </CardBody>

              {/* Card Footer - Actions */}
              <CardFooter gap={2} pt={0}>
                {editingId === ride.ride_id ? (
                  // Save/Cancel buttons
                  <>
                    <Button
                      flex={1}
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleSave(ride.ride_id)}
                    >Save
                    </Button>
                    <Button
                      flex={1}
                      size="sm"
                      colorScheme="blue"
                      borderBaseColor="#176B87"
                      onClick={handleCancel}
                    > Cancel
                    </Button>
                  </>
                ) : (
                  // Edit/Delete buttons
                  <>
                    <Button
                      flex={1}
                      size="sm"
                      leftIcon={<EditIcon className='mt-2' />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleEdit(ride)}
                    >
                      Edit
                    </Button>
                    <Button
                      flex={1}
                      size="sm"
                      leftIcon={<DeleteIcon className='mt-2' color="red.500"  />}
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDeleteClick(ride)}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        <Box textAlign="center" py={10}>
          <Text fontSize="lg" color="gray.500">
            No rides found matching your search.
          </Text>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
        motionPreset="slideInBottom"
      >
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(10px)">
          <AlertDialogContent mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Ride
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete{' '}
              <Text as="span" fontWeight="bold" color="red.600">
                {deleteTarget?.name}
              </Text>
              ? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="ghost">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default RideLists;
