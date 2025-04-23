import React from "react";
import {
  useToast,
  Box,
  HStack,
  VStack,
  Text,
  CloseButton,
  Icon,
} from "@chakra-ui/react";
import { CheckCircleIcon, WarningIcon, InfoIcon, WarningTwoIcon } from "@chakra-ui/icons";

const NotificationToast = ({ status, title, description, isClosable = true, duration = 5000 }) => {
  const toast = useToast();
  
  const getIcon = () => {
    switch (status) {
      case "success":
        return CheckCircleIcon;
      case "error":
        return WarningTwoIcon;
      case "warning":
        return WarningIcon;
      case "info":
      default:
        return InfoIcon;
    }
  };
  
  const getColor = () => {
    switch (status) {
      case "success":
        return "green.500";
      case "error":
        return "red.500";
      case "warning":
        return "orange.500";
      case "info":
      default:
        return "brand.500";
    }
  };
  
  const showToast = () => {
    toast({
      position: "top-right",
      duration: duration,
      isClosable: isClosable,
      render: () => (
        <Box
          color="white"
          p={3}
          bg={getColor()}
          borderRadius="md"
          boxShadow="md"
          maxW="sm"
        >
          <HStack spacing={4} align="start">
            <Icon as={getIcon()} w={5} h={5} />
            <VStack align="start" spacing={0.5} flex={1}>
              <Text fontWeight="bold">{title}</Text>
              {description && <Text fontSize="sm">{description}</Text>}
            </VStack>
            {isClosable && (
              <CloseButton size="sm" onClick={() => toast.closeAll()} />
            )}
          </HStack>
        </Box>
      ),
    });
  };
  
  return { showToast };
};

export default NotificationToast;
