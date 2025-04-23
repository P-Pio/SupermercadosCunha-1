import React from "react";
import { Box, Text, VStack, Spinner, useColorModeValue } from "@chakra-ui/react";

const LoadingAnimation = ({ message = "Carregando..." }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.300");
  
  return (
    <VStack 
      spacing={4}
      p={8}
      borderRadius="lg"
      bg={bgColor}
      boxShadow="md"
      width="fit-content"
      mx="auto"
      my={10}
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color="brand.500"
        size="xl"
      />
      <Text color={textColor} fontWeight="medium">
        {message}
      </Text>
    </VStack>
  );
};

export default LoadingAnimation;
