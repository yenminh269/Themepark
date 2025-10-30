import { Box, Flex, Text } from '@chakra-ui/react';

const StatCard = ({ icon, name, value }) => {
  return (
    <Box
      p="20px"
      bg="white"
      borderRadius="20px"
      boxShadow="sm"
    >
      <Flex direction="column">
        {icon && (
          <Box mb="10px">
            {icon}
          </Box>
        )}
        <Text
          color="gray.500"
          fontSize="sm"
          fontWeight="500"
          mb="4px"
        >
          {name}
        </Text>
        <Text
          color="gray.900"
          fontSize="2xl"
          fontWeight="700"
        >
          {value}
        </Text>
      </Flex>
    </Box>
  );
};

export default StatCard;
