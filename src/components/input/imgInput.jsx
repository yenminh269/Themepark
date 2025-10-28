import { useEffect } from "react";
import {
  HStack,
  VStack,
  Input,
  Switch,
  Text,
  Image,
  Box,
} from "@chakra-ui/react";

function ImageInputToggle({ useLink, setUseLink, photoFile, setPhotoFile, 
  photoLink, setPhotoLink }) {
  const handleToggle = () => {
    setUseLink(!useLink);
    setPhotoLink("");
    setPhotoFile(null);
  };

  const previewUrl = useLink 
    ? photoLink 
    : photoFile 
    ? URL.createObjectURL(photoFile) 
    : null;

  useEffect(() => {
    return () => {
      if (photoFile && !useLink) {
        URL.revokeObjectURL(URL.createObjectURL(photoFile));
      }
    };
  }, [photoFile, useLink]);

  return (
    <VStack align="stretch" spacing={3} mb={4}>
      {/* Toggle Header */}
      <HStack justify="space-between" align="center">
        <VStack align="start" spacing={0}>
          <Text fontWeight="semibold" fontSize="md" color="#576751ff">
            {useLink ? "Image URL" : "Upload Image"}
          </Text>
          <Text fontSize="sm" color="gray.600">
            {useLink 
              ? "Paste a link to your image" 
              : "Choose a file from your device"}
          </Text>
        </VStack>
        
        <HStack spacing={2}>
          <Text fontSize="sm" color="gray.600">
            {useLink ? "File": "URL"}
          </Text>
         <Switch
            size="lg"
            isChecked={useLink}
            onChange={handleToggle}
            sx={{
              'span.chakra-switch__track[data-checked]': {
                backgroundColor: '#66785F',
              },
              'span.chakra-switch__track:hover[data-checked]': {
                backgroundColor: '#556B50',
              },
            }}
          />
        </HStack>
      </HStack>

      {/* Input Field */}
       <Box>
        {useLink ? (
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            value={photoLink}
            onChange={(e) => setPhotoLink(e.target.value)}
            borderColor="#4B5945"
            _hover={{ borderColor: "#3A6F43" }}
            _focus={{ borderColor: "#3A6F43", boxShadow: "0 0 0 1px #3A6F43" }}
          />
        ) : (
          <HStack 
            spacing={0} 
            borderWidth="1px" 
            borderColor="#4B5945"
            borderRadius="md"
            overflow="hidden"
          >
            <Box
              flex="1"
              px={4}
              py={2}
              bg="white"
              color="gray.500"
              fontSize="sm"
            >
              {photoFile ? photoFile.name : "No file chosen"}
            </Box>
            <Box
              as="label"
              px={4}
              py={2}
              bg="#4B5945"
              color="white"
              cursor="pointer"
              fontWeight="medium"
              fontSize="sm"
              _hover={{ bg: "#597168" }}
              transition="background 0.2s"
            >
              Choose File
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0])}
                display="none"
              />
            </Box>
          </HStack>
        )}
      </Box>

      {/* Image Preview */}
      {previewUrl && (
        <Box
          borderWidth="1px"
          borderColor="gray.200"
          borderRadius="md"
          overflow="hidden"
          p={2}
        >
          <Image 
            src={previewUrl} 
            alt="Preview" 
            maxH="200px" 
            objectFit="contain"
            mx="auto"
          />
        </Box>
      )}
    </VStack>
  );
}

export default ImageInputToggle;