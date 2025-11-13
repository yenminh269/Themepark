import { getImageUrl } from "../../services/api";
import { Box, Image, Text, Badge, VStack, HStack, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

export default function ItemAdded(props) {
  // Define colors for each status
  const statusColors = {
    open: 'green',
    maintenance: 'orange',
    closed: 'red'
  };

  // Determine if this is a store (has type) or ride (has price/capacity)
  const isStore = props.type !== undefined;

  return (
    <Box
      maxW="400px"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      boxShadow="xl"
      bg="white"
      position="relative"
    >
      {/* Close Button */}
      {props.onClose && (
        <IconButton
          icon={<CloseIcon />}
          size="sm"
          position="absolute"
          top={2}
          right={2}
          zIndex={1}
          colorScheme="red"
          variant="solid"
          onClick={props.onClose}
          aria-label="Add another item"
        />
      )}
      <Image 
        src={getImageUrl(props.photo_path)} 
        alt={props.name || (isStore ? 'Store photo' : 'Ride photo')}
        h="200px"
        w="100%"
        objectFit="cover"
      />
      
      <Box p={4} pb={2}>
        <HStack justify="space-between" align="start">
          <Text fontSize="2xl" fontWeight="bold" color="#4B5945">
            {props.name}
          </Text>
          {props.status && (
            <Badge 
              colorScheme={statusColors[props.status.toLowerCase()] || 'gray'}
              fontSize="sm"
              px={2}
              py={1}
              borderRadius="md"
            >
              {props.status.charAt(0).toUpperCase() + props.status.slice(1)}
            </Badge>
          )}
        </HStack>

        <Text fontSize="sm" color="gray.600" mb={3}>
          {props.description}
        </Text>

        <VStack align="stretch" spacing={1}>
          {/* Store-specific information */}
          {isStore && props.type && (
            <HStack>
              <Text fontSize="sm" fontWeight="semibold" color="#4B5945">Type:</Text>
              <Text fontSize="sm">
                {props.type === 'food/drink' ? 'Food & Drink' : 'Merchandise'}
              </Text>
            </HStack>
          )}

          {/* Ride-specific information */}
          {!isStore && (
            <>
              {props.price && (
                <HStack>
                  <Text fontSize="sm" fontWeight="semibold" color="#4B5945">Price:</Text>
                  <Text fontSize="sm">${props.price}</Text>
                </HStack>
              )}
              {props.capacity && (
                <HStack>
                  <Text fontSize="sm" fontWeight="semibold" color="#4B5945">Capacity:</Text>
                  <Text fontSize="sm">{props.capacity} people</Text>
                </HStack>
              )}
            </>
          )}

          {/* Common information */}
          {props.open_time && (
            <HStack>
              <Text fontSize="sm" fontWeight="semibold" color="#4B5945">Opens:</Text>
              <Text fontSize="sm">{props.open_time}</Text>
            </HStack>
          )}
          {props.close_time && (
            <HStack>
              <Text fontSize="sm" fontWeight="semibold" color="#4B5945">Closes:</Text>
              <Text fontSize="sm">{props.close_time}</Text>
            </HStack>
          )}
        </VStack>
      </Box>
    </Box>
  );
}