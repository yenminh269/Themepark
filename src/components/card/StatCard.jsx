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
        <Flex align="center" gap="10px">
          <Text
            color="gray.900"
            fontSize="2xl"
            fontWeight="700"
          >
            {value}
          </Text>
          {growth && (
            <Text
              color="green.500"
              fontSize="sm"
              fontWeight="700"
            >
              {growth}
            </Text>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default StatCard;
