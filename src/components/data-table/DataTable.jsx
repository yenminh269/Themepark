import { Box, Text, Table } from '@chakra-ui/react';

const DataTable = ({ title, columns, data }) => {
  return (
    <Box
      p="20px"
      bg="white"
      borderRadius="20px"
      boxShadow="sm"
    >
      <Text
        color="gray.900"
        fontSize="lg"
        fontWeight="700"
        mb="20px"
      >
        {title}
      </Text>
      <Box overflowX="auto">
        <Table.Root variant="outline" size="md">
          <Table.Header>
            <Table.Row>
              {columns.map((column, index) => (
                <Table.ColumnHeader key={index} color="gray.500" fontSize="xs" fontWeight="700">
                  {column}
                </Table.ColumnHeader>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {data.map((row, rowIndex) => (
              <Table.Row key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <Table.Cell
                    key={cellIndex}
                    color="gray.900"
                    fontSize="sm"
                    fontWeight="500"
                  >
                    {cell}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    </Box>
  );
};

export default DataTable;
