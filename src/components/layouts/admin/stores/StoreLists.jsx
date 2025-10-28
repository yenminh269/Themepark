import DataTable from '../../../data-table/DataTable';
import { Box, useToast, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, Button } from '@chakra-ui/react';
import { api } from '../../../../services/api';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useDisclosure } from '@chakra-ui/react';
import Loading from '../loading/loading';
import { WarningIcon } from '@chakra-ui/icons';

function StoreLists() {
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const cancelRef = useRef();
  const toast = useToast();

  const StoreAttr = [
    'Store Id', 'Store Name', 'Category', 'Operational Status', 'Description', 'Open Time', 'Close Time', 'Date Added'
  ];

  const columnKeys = [
    'store_id', 'name', 'type', 'status', 'description', 'open_time', 'close_time', 'created_at'
  ];

  const storeTypeOptions = ['merchandise','food/drink'];
  const storeStatusOptions = ['closed','open', 'maintenance'];

  // Fetch all stores
  const fetchStores = async () => {
    try {
      setLoading(true);
      const data = await api.getAllStores();
      setStores(data);
    } catch (err) {
      console.error('Failed to load stores:', err);
      alert('Failed to load stores. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const filteredData = useMemo(() => {
    if (!searchText) return stores;
    const normalizedSearch = searchText.toLowerCase().trim();
    return stores.filter(storeObj =>
      columnKeys.some(key =>
        storeObj[key]?.toString().toLowerCase().includes(normalizedSearch)
      )
    );
  }, [stores, searchText]);

  const formattedData = filteredData.map(storeObj =>
    columnKeys.map(key => {
      if (key === 'created_at' && storeObj[key])
        return new Date(storeObj[key]).toLocaleDateString();
      if ((key === 'open_time' || key === 'close_time') && storeObj[key]) {
        const [hour, minute] = storeObj[key].split(':');
        const h = parseInt(hour, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        return `${displayHour}:${minute} ${ampm}`;
      }
      return storeObj[key] ?? '';
    })
  );

  const handleEdit = (id) => {
    setEditingId(id);
    const store = stores.find(s => s.store_id === id);
    if (store) setEditedData({ ...store });
  };

  const handleSave = async (id) => {
    try {
      setLoading(true);
      const updateData = { store_id: id, ...editedData };
      await api.updateStore(updateData, id);
      await fetchStores();
      setEditingId(null);
      setEditedData({});
      toast({
        title: 'Store updated',
        description: `Store "${editedData.name}" has been updated.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      console.error('Failed to update store:', err);
      alert('Failed to update store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedData({});
  };

  const handleInputChange = (key, value) => {
    setEditedData(prev => ({ ...prev, [key]: value }));
  };

  const handleDelete = (id, row) => {
    setDeleteTarget({ id, name: row[1] });
    onOpen();
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    onClose();
    try {
      setLoading(true);
      await api.deleteStore(deleteTarget.id);
      await fetchStores();
      toast({
        title: 'Store deleted',
        description: `${deleteTarget.name} has been removed successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete store. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const renderEditableRow = (storeObj) => {
    return columnKeys.map((key, idx) => {
      if (key === 'store_id' || key === 'created_at') return storeObj[key];

      if (key === 'type') {
        return (
          <select
            value={editedData[key] ?? ''}
            onChange={e => handleInputChange(key, e.target.value)}
            className="border rounded px-3 py-2 text-sm md:text-base"
            style={{ minWidth: '120px' }}
          >
            {storeTypeOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }

      if (key === 'status') {
        return (
          <select
            value={editedData[key] ?? ''}
            onChange={e => handleInputChange(key, e.target.value)}
            className="border rounded px-3 py-2 text-sm md:text-base"
            style={{ minWidth: '120px' }}
          >
            {storeStatusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      }

      let inputType = 'text';
      if (key === 'open_time' || key === 'close_time') inputType = 'time';

      return (
        <input
          type={inputType}
          value={editedData[key] ?? ''}
          onChange={e => handleInputChange(key, e.target.value)}
          className="border rounded px-3 py-2 text-sm md:text-base"
          placeholder={StoreAttr[idx]}
          style={{ minWidth: '120px' }}
        />
      );
    });
  };

  const displayData = formattedData.map((storeObj, idx) => {
    const storeId = filteredData[idx].store_id;
    if (editingId === storeId) return renderEditableRow(filteredData[idx]);
    return storeObj;
  });

  if (loading) return <Loading isLoading={loading} />;

  return (
    <Box position="relative" p={4}>
      <input
        type="text"
        placeholder="Search stores..."
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        className="border rounded px-3 py-1 mb-4 w-full"
      />

      <DataTable
        title="Stores"
        columns={StoreAttr}
        data={displayData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSave={editingId ? handleSave : null}
        onCancel={editingId ? handleCancel : null}
        editingId={editingId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isCentered
      >
        <AlertDialogOverlay bg="blackAlpha.300" backdropFilter="blur(10px)">
          <AlertDialogContent mx={4}>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" display="flex" alignItems="center" gap={2}>
              <WarningIcon color="red.500" boxSize={5} />
              Delete Store
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete <b>{deleteTarget?.name}</b>? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose} variant="ghost">Cancel</Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}

export default StoreLists;
