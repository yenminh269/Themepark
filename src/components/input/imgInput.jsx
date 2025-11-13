import { useEffect, useState } from "react";
import {
  HStack,
  VStack,
  Input,
  Switch,
  Text,
  Image,
  Box,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";

const MAX_URL_LENGTH = 255;

function ImageInputToggle({ useLink, setUseLink, photoFile, setPhotoFile,
  photoLink, setPhotoLink }) {
  const [urlError, setUrlError] = useState("");
  const handleToggle = () => {
    setUseLink(!useLink);
    setPhotoLink("");
    setPhotoFile(null);
    setUrlError("");
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setPhotoLink(url);

    if (url.length > MAX_URL_LENGTH) {
      setUrlError(`URL is too long (${url.length}/${MAX_URL_LENGTH} characters). The database only supports URLs up to ${MAX_URL_LENGTH} characters.`);
    } else {
      setUrlError("");
    }
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
          <>
            <Input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={photoLink}
              onChange={handleUrlChange}
              borderColor={urlError ? "red.500" : "#4B5945"}
              _hover={{ borderColor: urlError ? "red.600" : "#3A6F43" }}
              _focus={{ borderColor: urlError ? "red.600" : "#3A6F43", boxShadow: urlError ? "0 0 0 1px red" : "0 0 0 1px #3A6F43" }}
              isInvalid={!!urlError}
            />
            {urlError && (
              <Alert status="error" mt={2} borderRadius="md">
                <AlertIcon />
                <AlertDescription fontSize="sm">{urlError}</AlertDescription>
              </Alert>
            )}
          </>
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