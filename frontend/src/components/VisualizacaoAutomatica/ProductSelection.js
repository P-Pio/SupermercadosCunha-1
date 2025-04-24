import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  HStack,
  VStack,
  Button,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Input,
  IconButton,
  Box,
  Text,
  Badge,
  Grid,
  Heading,
  Progress,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  SearchIcon,
  CheckIcon,
  CloseIcon,
} from "@chakra-ui/icons";
import ProductCard from "./ProductCard";

// Default product list
export const DEFAULT_PRODUCT_LIST = [
  "Arroz 5kg",
  "Açúcar 5kg",
  "Feijão 1kg",
  "Óleo de Soja 900ml",
  "Farinha de milho 1kg",
  "Farinha de mandioca 500g",
  "Pó de Café 500g",
  "Macarrão 500g",
  "Farinha de trigo 1kg",
  "Leite UHT 1L",
  "Margarina 500g",
  "Banana 1kg",
  "Batata Inglesa 1kg",
  "Carne bovina contra filé 1kg",
  "Frango inteiro congelado 1kg",
];

/**
 * Product Selection component
 * @param {Object} props
 * @param {Array} props.selectedItems - Currently selected items
 * @param {Function} props.toggleItem - Toggle item selection
 * @param {Function} props.selectAllVisible - Select all visible items
 * @param {Function} props.clearSelection - Clear all selections
 * @param {Function} props.handleSearchSelected - Handle search
 * @param {boolean} props.loading - Loading status
 * @param {number} props.searchProgress - Search progress percentage
 */
const ProductSelection = ({
  selectedItems,
  toggleItem,
  selectAllVisible,
  clearSelection,
  handleSearchSelected,
  loading,
  searchProgress
}) => {
  const [filterText, setFilterText] = useState("");
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");

  // Filter items based on search text
  const filteredItems = DEFAULT_PRODUCT_LIST.filter(item =>
    item.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Card borderRadius="lg" boxShadow="sm" bg={cardBg} overflow="hidden">
      <CardHeader bg={headerBg} py={4}>
        <Flex 
          justifyContent="space-between" 
          alignItems="center"
          flexDirection={{base: "column", sm: "row"}}
          gap={{base: 3, sm: 0}}
        >
          <Heading size="md">Selecione os Produtos</Heading>
          <HStack spacing={2}>
            <Button 
              size="sm" 
              leftIcon={<CheckIcon />}
              onClick={() => selectAllVisible(filteredItems)}
              variant="outline"
              colorScheme="brand"
              width={{base: "full", sm: "auto"}}
            >
              Selecionar Todos
            </Button>
            <Button 
              size="sm" 
              leftIcon={<CloseIcon />}
              onClick={clearSelection}
              variant="outline"
              colorScheme="red"
              isDisabled={selectedItems.length === 0}
              width={{base: "full", sm: "auto"}}
            >
              Limpar
            </Button>
          </HStack>
        </Flex>
      </CardHeader>
      
      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Search Input */}
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input 
              placeholder="Filtrar produtos..." 
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
            {filterText && (
              <InputRightElement>
                <IconButton
                  aria-label="Limpar busca"
                  icon={<CloseIcon />}
                  size="sm"
                  variant="ghost"
                  onClick={() => setFilterText("")}
                />
              </InputRightElement>
            )}
          </InputGroup>
          
          {/* Selection Status */}
          <Flex 
            justify="space-between" 
            align={{base: "flex-start", sm: "center"}}
            flexDirection={{base: "column", sm: "row"}}
            gap={{base: 1, sm: 0}}
          >
            <Text fontSize="sm" color="gray.600">
              {filteredItems.length} produtos encontrados
            </Text>
            <Badge colorScheme="brand" py={1} px={2} borderRadius="full">
              {selectedItems.length} selecionados
            </Badge>
          </Flex>
          
          {/* Products Grid */}
          <Box 
            maxH={{base: "400px", md: "300px"}} 
            overflowY="auto" 
            pr={2}
            mx={{base: "-3px", sm: 0}}
            css={{
              '&::-webkit-scrollbar': {
                width: '8px',
              },
              '&::-webkit-scrollbar-track': {
                width: '10px',
                background: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: 'rgba(0, 0, 0, 0.2)',
                borderRadius: '4px',
              },
            }}
          >
            <Grid 
              templateColumns={{
                base: "repeat(1, 1fr)",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
                lg: "repeat(auto-fill, minmax(200px, 1fr))"
              }}
              gap={3}
            >
              {filteredItems.map((item) => (
                <ProductCard
                  key={item}
                  product={item}
                  isSelected={selectedItems.includes(item)}
                  onToggle={toggleItem}
                />
              ))}
            </Grid>
            
            {filteredItems.length === 0 && (
              <Box py={8} textAlign="center">
                <Text color="gray.500">Nenhum produto encontrado com o filtro atual</Text>
              </Box>
            )}
          </Box>
          
          {/* Action Button */}
          <Button
            colorScheme="brand"
            size={{base: "md", md: "lg"}}
            leftIcon={<SearchIcon />}
            onClick={handleSearchSelected}
            isLoading={loading}
            loadingText="Buscando..."
            isDisabled={selectedItems.length === 0}
            width="100%"
            py={{base: 6, md: 7}}
            fontSize={{base: "sm", md: "md"}}
            mt={2}
          >
            Buscar Preços nos Supermercados
          </Button>
          
          {/* Progress Bar */}
          {loading && (
            <Box>
              <Text fontSize="sm" mb={1}>
                Progresso: {Math.round(searchProgress)}%
              </Text>
              <Progress 
                value={searchProgress} 
                size="sm" 
                colorScheme="brand" 
                hasStripe
                isAnimated
                borderRadius="full"
              />
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default ProductSelection;