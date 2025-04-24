import React, { useState } from "react";
import {
  Card,
  CardBody,
  VStack,
  HStack,
  Badge,
  Text,
  Heading,
  Link,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { formatPrice, getSupermarketName } from "../../utils/formatters";

/**
 * Component for displaying search result cards
 * @param {Object} props
 * @param {Object} props.item - Result item data
 */
const ResultCard = ({ item }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Card
      bg={cardBg}
      borderRadius="lg"
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-2px)", boxShadow: "md" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      position="relative"
      overflow="hidden"
    >
      {isHovered && (
        <Link 
          href={item.link} 
          target="_blank" 
          rel="noopener noreferrer"
          position="absolute"
          top={0}
          right={0}
          bottom={0}
          left={0}
          bg="blackAlpha.50"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1}
        >
          <Button 
            leftIcon={<ExternalLinkIcon />} 
            size="sm" 
            colorScheme="brand"
            variant="solid"
          >
            Ver no Site
          </Button>
        </Link>
      )}
      
      <CardBody py={4} px={5}>
        <VStack align="start" spacing={2}>
          <HStack w="full" justify="space-between">
            <Badge 
              colorScheme={
                item.supermercado === 'atacadao' ? 'blue' : 
                item.supermercado === 'spani' ? 'green' : 
                item.supermercado === 'tenda' ? 'orange' : 'gray'
              }
              px={2}
              py={0.5}
              borderRadius="full"
            >
              {getSupermarketName(item.supermercado)}
            </Badge>
            <Text fontSize="xs" color="gray.500">
              {item.data}
            </Text>
          </HStack>
          
          <Heading size="sm" noOfLines={2} h="40px">
            {item.produto}
          </Heading>
          
          <HStack w="full" justify="space-between" pt={1}>
            <Text fontSize="sm" color="gray.600">
              {item.quantidade} {item.unidade}
            </Text>
            <Text fontSize="xl" fontWeight="bold" color="brand.600">
              {formatPrice(item.preco)}
            </Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ResultCard;