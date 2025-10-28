import React, { useState, useEffect } from "react";
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure, Select } from "@chakra-ui/react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { api } from "../../../services/api";

export default function StoreInventoryLists() {
  const [inventory, setInventory] = useState([]);
  const [stores, setStores] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const toast = useToast();

  // Form states
  const [formData, setFormData] = useState({
    store_id: '',
    item_id: '',
    stock_quantity: ''
  });

  const [editFormData, setEditFormData] = useState({
    stock_quantity: ''
  });

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryResult, storesResult, merchResult] = await Promise.all([
        api.getAllInventories(),
        api.getAllStores(),
        api.getAllMerchandise()
      ]);

      setInventory(inventoryResult);
      setStores(storesResult);
      setMerchandise(merchResult);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInventory = async () => {
    try {
      const inventoryResult = await api.getAllInventories();
      setInventory(inventoryResult);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast({
        title: "Error",
        description: "Failed to refresh inventory data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleAdd = async () => {
    try {
      await api.addToInventory(formData);
      toast({
        title: "Success",
        description: "Item added to inventory successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchInventory();
      onAddClose();
      resetForm();
    } catch (error) {
      console.error('Error adding to inventory:', error);
      toast({
        title: "Error",
        description: "Failed to add item to inventory",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = async () => {
    try {
      await api.updateInventory(selectedItem.store_id, selectedItem.item_id, editFormData);
      toast({
        title: "Success",
        description: "Inventory updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchInventory();
      onEditClose();
      resetEditForm();
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      store_id: '',
      item_id: '',
      stock_quantity: ''
    });
  };

  const resetEditForm = () => {
    setEditFormData({
      stock_quantity: ''
    });
    setSelectedItem(null);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setEditFormData({
      stock_quantity: item.stock_quantity.toString()
    });
    onEditOpen();
  };

  if (loading) {
    return (
      <Box p={6}>
        <p>Loading inventory...</p>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#176B87' }}>
          Store Inventory Management
        </h1>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={onAddOpen}
        >
          Add to Inventory
        </Button>
      </Box>

      <Box bg="white" borderRadius="lg" shadow="md" overflow="hidden">
        <Table variant="simple">
          <Thead bg="#176B87">
            <Tr>
              <Th color="white">Store</Th>
              <Th color="white">Item</Th>
              <Th color="white">Type</Th>
              <Th color="white">Stock Quantity</Th>
              <Th color="white">Price</Th>
              <Th color="white">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {inventory.map((item) => (
              <Tr key={`${item.store_id}-${item.item_id}`} _hover={{ bg: 'gray.50' }}>
                <Td fontWeight="medium">{item.store_name}</Td>
                <Td>{item.item_name}</Td>
                <Td>
                  <Badge colorScheme="blue" textTransform="capitalize">
                    {item.item_type}
                  </Badge>
                </Td>
                <Td>
                  <Badge colorScheme={item.stock_quantity > 10 ? 'green' : item.stock_quantity > 0 ? 'orange' : 'red'}>
                    {item.stock_quantity}
                  </Badge>
                </Td>
                <Td>${parseFloat(item.price).toFixed(2)}</Td>
                <Td>
                  <IconButton
                    icon={<EditIcon />}
                    colorScheme="blue"
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(item)}
                    aria-label="Edit inventory"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {inventory.length === 0 && (
          <Box p={8} textAlign="center" color="gray.500">
            No inventory items found. Add items to stores to get started.
          </Box>
        )}
      </Box>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Item to Inventory</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box as="form" onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
              <Box mb={4}>
                <label>Store</label>
                <Select
                  value={formData.store_id}
                  onChange={(e) => setFormData({...formData, store_id: e.target.value})}
                  placeholder="Select store"
                  required
                >
                  {stores.map(store => (
                    <option key={store.store_id} value={store.store_id}>
                      {store.name} ({store.type})
                    </option>
                  ))}
                </Select>
              </Box>

              <Box mb={4}>
                <label>Item</label>
                <Select
                  value={formData.item_id}
                  onChange={(e) => setFormData({...formData, item_id: e.target.value})}
                  placeholder="Select merchandise"
                  required
                >
                  {merchandise.map(item => (
                    <option key={item.item_id} value={item.item_id}>
                      {item.name} - ${item.price} ({item.type})
                    </option>
                  ))}
                </Select>
              </Box>

              <Box mb={4}>
                <label>Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </Box>

              <Box display="flex" gap={3} justifyContent="flex-end">
                <Button onClick={onAddClose} variant="ghost">Cancel</Button>
                <Button colorScheme="blue" type="submit">Add to Inventory</Button>
              </Box>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update Stock Quantity</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box as="form" onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
              {selectedItem && (
                <Box mb={4}>
                  <p><strong>Store:</strong> {selectedItem.store_name}</p>
                  <p><strong>Item:</strong> {selectedItem.item_name}</p>
                  <p><strong>Current Stock:</strong> {selectedItem.stock_quantity}</p>
                </Box>
              )}

              <Box mb={4}>
                <label>New Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={editFormData.stock_quantity}
                  onChange={(e) => setEditFormData({...editFormData, stock_quantity: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </Box>

              <Box display="flex" gap={3} justifyContent="flex-end">
                <Button onClick={onEditClose} variant="ghost">Cancel</Button>
                <Button colorScheme="blue" type="submit">Update Stock</Button>
              </Box>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
