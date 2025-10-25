import { Box, Text, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

const DataTable = ({ title, columns, data, onRowSelect }) => {
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
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              {columns.map((column, index) => (
                <Th key={index} color="gray.500" fontSize="xs" fontWeight="700">
                  {column}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {data.map((row, rowIndex) => (
              <Tr key={rowIndex}  _hover={{ bg: "#c6cbb8ff", cursor: "pointer" }} onClick={() => onRowSelect && onRowSelect(row[0])} >
                {row.map((cell, cellIndex) => (
                  <Td
                    key={cellIndex}
                    color="gray.900"
                    fontSize="sm"
                    fontWeight="500"
                  >
                    {cell}
                  </Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default DataTable;