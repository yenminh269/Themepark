import React, { useState, useEffect } from "react";
import { Box, Button, Table, Thead, Tbody, Tr, Th, Td, Badge, IconButton, useToast, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { api } from "../../../../services/api";

export default function MerchandiseLists() {
  const [merchandise, setMerchandise] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const { isOpen: isAddOpen, onOpen: onAddOpen, onClose: onAddClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  const toast = useToast();

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    type: 'apparel'
  });

  useEffect(() => {
    fetchMerchandise();
  }, []);

  const fetchMerchandise = async () => {
    try {
      setLoading(true);
      const result = await api.getAllMerchandise();
      setMerchandise(result);
    } catch (error) {
      console.error('Error fetching merchandise:', error);
      toast({
        title: "Error",
        description: "Failed to load merchandise",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await api.addMerchandise(formData);
      toast({
        title: "Success",
        description: "Merchandise added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchMerchandise();
      onAddClose();
      resetForm();
    } catch (error) {
      console.error('Error adding merchandise:', error);
      toast({
        title: "Error",
        description: "Failed to add merchandise",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = async () => {
    try {
      await api.updateMerchandise(formData, selectedItem.item_id);
      toast({
        title: "Success",
        description: "Merchandise updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchMerchandise();
      onEditClose();
      resetForm();
    } catch (error) {
      console.error('Error updating merchandise:', error);
      toast({
        title: "Error",
        description: "Failed to update merchandise",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this merchandise item?')) return;

    try {
      await api.deleteMerchandise(itemId);
      toast({
        title: "Success",
        description: "Merchandise deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchMerchandise();
    } catch (error) {
      console.error('Error deleting merchandise:', error);
      toast({
        title: "Error",
        description: "Failed to delete merchandise",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      quantity: '',
      description: '',
      type: 'apparel'
    });
    setSelectedItem(null);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      quantity: item.quantity.toString(),
      description: item.description,
      type: item.type
    });
    onEditOpen();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  if (loading) {
    return (
      <Box p={6}>
        <p>Loading merchandise...</p>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#176B87' }}>
          Merchandise Management
        </h1>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={() => {
            resetForm();
            onAddOpen();
          }}
        >
          Add Merchandise
        </Button>
      </Box>

      <Box bg="white" borderRadius="lg" shadow="md" overflow="hidden">
        <Table variant="simple">
          <Thead bg="#176B87">
            <Tr>
              <Th color="white">Name</Th>
              <Th color="white">Type</Th>
              <Th color="white">Price</Th>
              <Th color="white">Stock</Th>
              <Th color="white">Created</Th>
              <Th color="white">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {merchandise.map((item) => (
              <Tr key={item.item_id} _hover={{ bg: 'gray.50' }}>
                <Td fontWeight="medium">{item.name}</Td>
                <Td>
                  <Badge colorScheme="blue" textTransform="capitalize">
                    {item.type}
                  </Badge>
                </Td>
                <Td>{formatCurrency(item.price)}</Td>
                <Td>
                  <Badge colorScheme={item.quantity > 10 ? 'green' : item.quantity > 0 ? 'orange' : 'red'}>
                    {item.quantity}
                  </Badge>
                </Td>
                <Td>{formatDate(item.created_at)}</Td>
                <Td>
                  <IconButton
                    icon={<EditIcon />}
                    colorScheme="blue"
                    variant="ghost"
                    size="sm"
                    mr={2}
                    onClick={() => openEditModal(item)}
                    aria-label="Edit merchandise"
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    colorScheme="red"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.item_id)}
                    aria-label="Delete merchandise"
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

        {merchandise.length === 0 && (
          <Box p={8} textAlign="center" color="gray.500">
            No merchandise items found. Add your first item to get started.
          </Box>
        )}
      </Box>

      {/* Add Modal */}
      <Modal isOpen={isAddOpen} onClose={onAddClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Merchandise</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box as="form" onSubmit={(e) => { e.preventDefault(); handleAdd(); }}>
              <Box mb={4}>
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </Box>

              <Box mb={4}>
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="apparel">Apparel</option>
                  <option value="toys">Toys</option>
                  <option value="accessories">Accessories</option>
                  <option value="drinkware">Drinkware</option>
                  <option value="snacks">Snacks</option>
                  <option value="beverages">Beverages</option>
                </select>
              </Box>

              <Box mb={4}>
                <label>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </Box>

              <Box mb={4}>
                <label>Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </Box>

              <Box mb={4}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                  rows={3}
                  required
                />
              </Box>

              <Box display="flex" gap={3} justifyContent="flex-end">
                <Button onClick={onAddClose} variant="ghost">Cancel</Button>
                <Button colorScheme="blue" type="submit">Add Merchandise</Button>
              </Box>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Merchandise</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box as="form" onSubmit={(e) => { e.preventDefault(); handleEdit(); }}>
              <Box mb={4}>
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </Box>

              <Box mb={4}>
                <label>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                >
                  <option value="apparel">Apparel</option>
                  <option value="toys">Toys</option>
                  <option value="accessories">Accessories</option>
                  <option value="drinkware">Drinkware</option>
                  <option value="snacks">Snacks</option>
                  <option value="beverages">Beverages</option>
                </select>
              </Box>

              <Box mb={4}>
                <label>Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </Box>

              <Box mb={4}>
                <label>Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                  required
                />
              </Box>

              <Box mb={4}>
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border rounded mt-1"
                  rows={3}
                  required
                />
              </Box>

              <Box display="flex" gap={3} justifyContent="flex-end">
                <Button onClick={onEditClose} variant="ghost">Cancel</Button>
                <Button colorScheme="blue" type="submit">Update Merchandise</Button>
              </Box>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
