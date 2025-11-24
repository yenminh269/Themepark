import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, IconButton, HStack, Button } from '@chakra-ui/react';
import { FiEdit2, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

const DataTable = ({
  title,
  columns,
  data,
  onRowSelect,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  editingId,
  onRevoke,
  onPermanentDelete,
  onResetPassword
}) => {
  return (
    <Box
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
      > {title}</Text>

      <Box overflowX="auto" className="custom-scrollbar">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              {columns.map((column, index) => (
                <Th key={index} color="gray.500" fontSize="xs" fontWeight="700">
                  {column}
                </Th>
              ))}
              {/* Actions header */}
              {(onEdit || onDelete || onRevoke || onPermanentDelete || onResetPassword) && (
                <Th color="gray.500" fontSize="xs" fontWeight="700" textAlign="center">
                  Actions
                </Th>
              )}
            </Tr>
          </Thead>

          <Tbody>
            {data.map((row, rowIndex) => {
              const rowId = row[0]; // First column is assumed to be the ID
              const isEditing = editingId === rowId;

              return (
                <Tr 
                  key={rowIndex}  
                  _hover={{ bg: isEditing ? "#c8d6ceff" : "#c6cbb8ff" }}
                  bg={isEditing ? "#B2C9AD" : "transparent"}
                >
                  {row.map((cell, cellIndex) => (
                    <Td
                      key={cellIndex}
                      color="gray.900"
                      fontSize="md"
                      fontWeight="500"
                      onClick={() => !isEditing && onRowSelect && onRowSelect(rowId)}
                      cursor={!isEditing && onRowSelect ? "pointer" : "default"}
                    >
                      {cell}
                    </Td>
                  ))}
                  
                  {/* Action buttons */}
                  {(onEdit || onDelete || onRevoke || onPermanentDelete || onResetPassword) && (
                    <Td textAlign="center">
                      {isEditing ? (
                        <HStack spacing={1} justify="center">
                          <IconButton
                            icon={<FiCheck />}
                            size="sm"
                            colorScheme="green"
                            variant="ghost"
                            aria-label="Save"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSave && onSave(rowId);
                            }}
                            _hover={{ bg: "#3A6F43", color: "white" }}
                          />
                          <IconButton
                            icon={<FiX />}
                            size="sm"
                            colorScheme="gray"
                            variant="ghost"
                            aria-label="Cancel"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCancel && onCancel();
                            }}
                            _hover={{ bg: "#gray.500", color: "white" }}
                          />
                        </HStack>
                      ) : (
                        <HStack spacing={1} justify="center">
                          {onEdit && (
                            <IconButton
                              icon={<FiEdit2 />}
                              size="sm"
                              colorScheme="blue"
                              variant="ghost"
                              aria-label="Edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(rowId, row);
                              }}
                              _hover={{ bg: "#3A6F43", color: "white" }}
                            />
                          )}
                          {onDelete && (
                            <IconButton
                              icon={<FiTrash2 />}
                              size="sm"
                              colorScheme="red"
                              variant="ghost"
                              aria-label="Delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(rowId, row);
                              }}
                              _hover={{ bg: "#d9534f", color: "white" }}
                            />
                          )}
                          {onRevoke && (
                            <Button
                              size="sm"
                              colorScheme="green"
                              variant="solid"
                              aria-label="Revoke Termination"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRevoke(rowId, row);
                              }}
                              bg="#4682A9"
                              _hover={{ bg: "#145A6B" }}
                            >
                              Revoke
                            </Button>
                          )}
                          {onPermanentDelete && (
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="solid"
                              aria-label="Delete Forever"
                              onClick={(e) => {
                                e.stopPropagation();
                                onPermanentDelete(rowId, row);
                              }}
                              bg="#E74C3C"
                              _hover={{ bg: "#C0392B" }}
                            >
                              Delete Forever
                            </Button>
                          )}
                          {onResetPassword && (
                            <Button
                              size="sm"
                              colorScheme="orange"
                              variant="solid"
                              aria-label="Reset Password"
                              onClick={(e) => {
                                e.stopPropagation();
                                onResetPassword(rowId, row);
                              }}
                              bg="#FFA500"
                              _hover={{ bg: "#FF8C00" }}
                            >
                              Reset Password
                            </Button>
                          )}
                        </HStack>
                      )}
                    </Td>
                  )}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DataTable;