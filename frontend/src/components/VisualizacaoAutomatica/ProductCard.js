import React from "react";
import {
  Card,
  CardBody,
  Box,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";

/**
 * Component for displaying product selection cards
 * @param {Object} props
 * @param {string} props.product - Product name
 * @param {boolean} props.isSelected - Whether the product is selected
 * @param {Function} props.onToggle - Function to call when the product is toggled
 */
const ProductCard = ({ product, isSelected, onToggle }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const highlightBg = useColorModeValue("brand.50", "brand.900");
  
  return (
    <Card 
      bg={isSelected ? highlightBg : cardBg} 
      borderWidth="1px" 
      borderColor={isSelected ? "brand.300" : "gray.200"}
      borderRadius="lg" 
      overflow="hidden"
      transition="all 0.2s"
      boxShadow={isSelected ? "md" : "sm"}
      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
      cursor="pointer"
      onClick={() => onToggle(product)}
      width="100%"
      minH="50px"
      position="relative"
    >
      {isSelected && (
        <Box 
          position="absolute" 
          top={1} 
          right={1} 
          p={1}
          borderRadius="full"
          bg="brand.100"
          color="brand.700"
          boxSize={6}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <CheckIcon boxSize={3} />
        </Box>
      )}
      <CardBody py={3} px={4}>
        <Text 
          fontWeight={isSelected ? "medium" : "normal"}
          fontSize={{base: "sm", md: "md"}}
          noOfLines={2}
          color={isSelected ? "brand.700" : "gray.700"}
        >
          {product}
        </Text>
      </CardBody>
    </Card>
  );
};

export default ProductCard;