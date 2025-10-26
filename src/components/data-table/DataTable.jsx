import { Box, Text, Table, Thead, Tbody, Tr, Th, Td, IconButton, HStack } from '@chakra-ui/react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const DataTable = ({ title, columns, data, onRowSelect, onEdit, onDelete }) => {
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
      >
        {title}
      </Text>
      <Box overflowX="auto" className="custom-scrollbar">
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              {columns.map((column, index) => (
                <Th key={index} color="gray.500" fontSize="xs" fontWeight="700">
                  {column}
                </Th>
              ))}
              {/* Only show Edit/Delete headers if handlers are provided */}
              {onEdit && (
                <Th color="gray.500" fontSize="xs" fontWeight="700" textAlign="center" w="60px">
                  Edit
                </Th>
              )}
              {onDelete && (
                <Th color="gray.500" fontSize="xs" fontWeight="700" textAlign="center" w="60px">
                  Delete
                </Th>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, rowIndex) => (
              <Tr 
                key={rowIndex}  
                _hover={{ bg: "#c6cbb8ff" }}
              >
                {row.map((cell, cellIndex) => (
                  <Td
                    key={cellIndex}
                    color="gray.900"
                    fontSize="sm"
                    fontWeight="500"
                    onClick={() => onRowSelect && onRowSelect(row[0])}
                    cursor={onRowSelect ? "pointer" : "default"}
                  >
                    {cell}
                  </Td>
                ))}
                {/* Only show Edit button if handler is provided */}
                {onEdit && (
                  <Td textAlign="center">
                    <IconButton
                      icon={<FiEdit2 />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      aria-label="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(row[0], row);
                      }}
                      _hover={{ bg: "#3A6F43", color: "white" }}
                    />
                  </Td>
                )}
                {/* Only show Delete button if handler is provided */}
                {onDelete && (
                  <Td textAlign="center">
                    <IconButton
                      icon={<FiTrash2 />}
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      aria-label="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(row[0], row);
                      }}
                      _hover={{ bg: "#d9534f", color: "white" }}
                    />
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DataTable;