import { Box, Text } from '@chakra-ui/react';

const ChartCard = ({ title, children }) => {
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
      <Box>
        {children}
      </Box>
    </Box>
  );
};

export default ChartCard;
