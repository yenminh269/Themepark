import { Box, SimpleGrid, Card, CardBody, CardFooter, Image, Text, Button, HStack, useDisclosure, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { api, getImageUrl } from '../../../../services/api';
import { useState, useEffect, useMemo, useRef } from 'react';
import Loading from '../loading/Loading';
import { PiShoppingBagOpen } from "react-icons/pi";

function StoreLists() {
  const [loading, setLoading] =  useState(true);
  const [stores, setStores] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [viewingStore, setViewingStore] = useState(null);
  const [storeInventory, setStoreInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isInventoryOpen, onOpen: onInventoryOpen, onClose: onInventoryClose } = useDisclosure();
  const cancelRef = useRef();
  const toast = useToast();

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const response = await api.getAllStores();
      setStores(response);
    } catch (err) {
      console.error('Failed to load stores:', err);
      toast({
        title: 'Error',
        description: 'Failed to load stores. Please check backend connection.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!searchText) return stores;
    const normalizedSearch = searchText.toLowerCase().trim();
    return stores.filter(store =>
      store.name?.toLowerCase().includes(normalizedSearch) ||
      store.description?.toLowerCase().includes(normalizedSearch) ||
      store.type?.toLowerCase().includes(normalizedSearch) ||
      store.status?.toLowerCase().includes(normalizedSearch)
    );
  }, [stores, searchText]);

  const handleEdit = (store) => {
    setEditingId(store.store_id);
    setEditedData({
      name: store.name,
      type: store.type,
      status: store.status,
      description: store.description,
      open_time: store.open_time,
      close_time: store.close_time,
      photo_path: store.photo_path,
      available_online: store.available_online,
    });
    setPhotoFile(null);
  };

  const handleSave = async (storeId) => {
    try {
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
        formData.append('type', editedData.type);
        formData.append('status', editedData.status);
        formData.append('description', editedData.description);
        formData.append('open_time', editedData.open_time);
        formData.append('close_time', editedData.close_time);
        formData.append('available_online', editedData.available_online ? 1 : 0);
        formData.append('store_id', storeId);
        updateData = formData;
      } else {
        updateData = { store_id: storeId, ...editedData, available_online: editedData.available_online ? 1 : 0 };
      }

      await api.updateStore(updateData, storeId);
      await fetchStores();
      setEditingId(null);
      setEditedData({});
      setPhotoFile(null);
      toast({
        title: 'Success',
        description: 'Store updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Failed to update store:', err);
      toast({
        title: 'Error',
        description: 'Failed to update store.',
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

  const handleDeleteClick = (store) => {
    setDeleteTarget(store);
    onOpen();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    onClose();
    try {
      setLoading(true);
      await api.deleteStore(deleteTarget.store_id);
      await fetchStores();
      toast({
        title: 'Success',
        description: `${deleteTarget.name} has been deleted successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const handleViewItems = async (store) => {
    try {
      setInventoryLoading(true);
      setViewingStore(store);
      onInventoryOpen();
      const inventory = await api.getStoreInventory(store.store_id);
      setStoreInventory(inventory);
    } catch (err) {
      console.error('Failed to load inventory:', err);
      toast({
        title: 'Error',
        description: 'Failed to load store inventory.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      onInventoryClose();
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleInventoryClose = () => {
    onInventoryClose();
    setViewingStore(null);
    setStoreInventory([]);
  };

  if (loading) return <Loading isLoading={loading} />;

  return (
    <Box position="relative">
      <h2 className="text-2xl font-bold mb-4 !text-[#4B5945]" >Manage Stores</h2>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search stores by name, description, type, or status..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="border rounded px-3 py-2 mb-4 mb-6 w-full"
        style={{ borderColor: '#ccc', fontSize: '14px' }}
      />

      {/* Stores Grid */}
      {filteredData.length > 0 ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredData.map((store) => (
            <Card
              key={store.store_id}
              borderRadius="12px"
              overflow="hidden"
              boxShadow={editingId === store.store_id ? 'xl' : 'md'}
              transition="all 0.3s"
              _hover={{ boxShadow: editingId === store.store_id ? 'xl' : 'lg', transform: 'translateY(-4px)' }}
              bg={editingId === store.store_id ? '#EEF5FF' : 'white'}
            >
              {/* Image */}
              <Image
                src={getImageUrl(store.photo_path)}
                alt={store.name}
                h="250px"
                w="100%"
                objectFit="cover"
              />

              {/* Card Body */}
              <CardBody pb={2}>
                {editingId === store.store_id ? (
                  // Edit Mode
                  <Box>
                    <label className='font-bold text-[#176B87]'>Store Name:</label>
                    <input
                      type="text"
                      value={editedData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Store Name"
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
                      <HStack justify="space-between" mb={2}>
                        <label className='font-bold text-[#176B87]'>Type:</label>
                        <select
                          value={editedData.type || ''}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="border border-black rounded px-2 py-1"
                          style={{ width: '120px', fontSize: '14px' }}
                        >
                          <option value="merchandise">Merchandise</option>
                          <option value="food/drink">Food/Drink</option>
                        </select>
                      </HStack>

                      <HStack justify="space-between" mb={2}>
                        <label className='font-bold text-[#176B87]'>Status:</label>
                        <select
                          value={editedData.status || ''}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="border border-black rounded px-2 py-1"
                          style={{ width: '100px', fontSize: '14px' }}
                        >
                          <option value="open">Open</option>
                          <option value="maintenance">Maintenance</option>
                          <option value="closed">Closed</option>
                        </select>
                      </HStack>

                      <HStack justify="space-between" mb={2}>
                        <label className='w-full font-bold text-[#176B87]'>Open Time:</label>
                        <input
                          type="time"
                          value={editedData.open_time}
                          onChange={(e) => handleInputChange('open_time', e.target.value)}
                          className="border border-black rounded px-2 py-1"
                        />
                      </HStack>

                      <HStack justify="space-between">
                        <label className='w-full font-bold text-[#176B87]'>Close Time:</label>
                        <input
                          type="time"
                          value={editedData.close_time}
                          onChange={(e) => handleInputChange('close_time', e.target.value)}
                          className="border border-black rounded px-2 py-1"
                        />
                      </HStack>

                      <HStack justify="space-between" mb={2}>
                        <label className='font-bold text-[#176B87]'>Available Online:</label>
                        <input
                          type="checkbox"
                          checked={editedData.available_online || false}
                          onChange={(e) => handleInputChange('available_online', e.target.checked)}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      </HStack>
                    </Box>
                  </Box>
                ) : (
                  // View Mode
                  <>
                    <Text fontSize="xl" fontWeight="bold" mb={2} color="#3A6F43">
                      {store.name}
                    </Text>
                    <Text fontSize="sm" color="gray.600" mb={3} noOfLines={3}>
                      {store.description}
                    </Text>

                    {/* Store Details */}
                    <Box fontSize="sm" color="gray.700" space={2}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="bold">Type:</Text>
                        <Text>{store.type}</Text>
                      </HStack>
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="bold">Status:</Text>
                        <Box
                          px={2}
                          py={1}
                          borderRadius="4px"
                          bg={store.status === 'open' ? '#C6F6D5' : store.status === 'maintenance' ? '#FAF089' : '#FED7D7'}
                          color={store.status === 'open' ? '#22543D' : store.status === 'maintenance' ? '#744210' : '#742A2A'}
                          fontSize="xs"
                          fontWeight="bold"
                        >
                          {store.status}
                        </Box>
                      </HStack>
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="bold">Hours:</Text>
                        <Text>
                          {new Date(`2000-01-01T${store.open_time}`).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true})} - {new Date(`2000-01-01T${store.close_time}`).toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit', hour12: true})}
                        </Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Date Added:</Text>
                        <Text>{new Date(store.created_at).toLocaleDateString()}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text fontWeight="bold">Available Online:</Text>
                        <Text>{store.available_online ? 'Yes' : 'No'}</Text>
                      </HStack>
                    </Box>
                  </>
                )}
              </CardBody>

              {/* Card Footer - Actions */}
              <CardFooter gap={2} pt={0}>
                {editingId === store.store_id ? (
                  // Save/Cancel buttons
                  <>
                    <Button
                      flex={1}
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleSave(store.store_id)}
                    >
                      Save
                    </Button>
                    <Button
                      flex={1}
                      size="sm"
                      colorScheme="blue"
                      borderBaseColor="#176B87"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  // Edit/Delete/View Items buttons
                  <>
                    <Button
                      flex={1}
                      size="sm"
                      leftIcon={<PiShoppingBagOpen className='mt-2' />}
                      colorScheme="green"
                      variant="outline"
                      onClick={() => handleViewItems(store)}
                    >
                       Items
                    </Button>
                    <Button
                      flex={1}
                      size="sm"
                      leftIcon={<EditIcon className='mt-2' />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={() => handleEdit(store)}
                    >
                      Edit
                    </Button>
                    <Button
                      flex={1}
                      size="sm"
                      leftIcon={<DeleteIcon className='mt-2' color="red.500" />}
                      colorScheme="red"
                      variant="outline"
                      onClick={() => handleDeleteClick(store)}
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
            No stores found matching your search.
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
              Delete Store
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

      {/* Store Inventory Modal */}
      <Modal isOpen={isInventoryOpen} onClose={handleInventoryClose} size="xl" isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
        <ModalContent mx={4}>
          <ModalHeader color="#3A6F43" fontSize="xl" fontWeight="bold">
            {viewingStore?.name} - Inventory
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {inventoryLoading ? (
              <Box textAlign="center" py={10}>
                <Text>Loading inventory...</Text>
              </Box>
            ) : storeInventory.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Item Name</Th>
                      <Th>Category</Th>
                      <Th isNumeric>Price</Th>
                      <Th isNumeric>Stock</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {storeInventory.map((item, index) => (
                      <Tr key={index}>
                        <Td fontWeight="500">{item.item_name}</Td>
                        <Td>{item.item_type}</Td>
                        <Td isNumeric>${parseFloat(item.price).toFixed(2)}</Td>
                        <Td isNumeric>{item.stock_quantity}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box textAlign="center" py={10}>
                <Text fontSize="md" color="gray.500">
                  No items found in this store's inventory.
                </Text>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}

export default StoreLists;
