import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  HStack,
  Button,
  Text,
  Divider,
  Container,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Input,
  InputRightElement,
  Checkbox,
  CheckboxGroup,
  Stack,
  Flex,
  Badge,
  Image,
  Tag,
  useColorModeValue,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  Progress,
  Link,
  useToast,
} from "@chakra-ui/react";
import {
  SearchIcon,
  CheckIcon,
  CloseIcon,
  InfoIcon,
  ExternalLinkIcon,
  DownloadIcon,
  RepeatIcon,
  ChevronDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
} from "@chakra-ui/icons";

// Component for displaying product cards
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
    >
      <CardBody py={3} px={4}>
        <Flex justify="space-between" align="center">
          <Checkbox 
            isChecked={isSelected}
            onChange={() => {}}
            colorScheme="brand"
            size="lg"
          >
            <Text fontWeight={isSelected ? "medium" : "normal"} ml={2}>
              {product}
            </Text>
          </Checkbox>
          {isSelected && (
            <Tag size="sm" colorScheme="brand" borderRadius="full">
              <CheckIcon mr={1} boxSize={2} />
              Selecionado
            </Tag>
          )}
        </Flex>
      </CardBody>
    </Card>
  );
};

// Component for result item card
const ResultCard = ({ item }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const [isHovered, setIsHovered] = useState(false);
  
  // Format price display
  const formatPrice = (price) => {
    if (typeof price === "number") {
      return `R$ ${price.toFixed(2).replace(".", ",")}`;
    }
    return "-";
  };
  
  // Get friendly supermarket name
  const getSupermarketName = (key) => {
    const names = {
      atacadao: "Atacadão",
      spani: "Spani",
      tenda: "Tenda",
    };
    return names[key] || key;
  };
  
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

function VisualizacaoAutomatica() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [externalResults, setExternalResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [filterText, setFilterText] = useState("");
  const [activeView, setActiveView] = useState("grid"); // "grid" or "table"
  const [sortBy, setSortBy] = useState({ field: "supermercado", direction: "asc" });
  
  const toast = useToast();
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");

  const defaultItemList = [
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

  // Filter items based on search text
  const filteredItems = defaultItemList.filter(item =>
    item.toLowerCase().includes(filterText.toLowerCase())
  );

  // Toggle item selection
  const toggleItem = (item) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item) 
        : [...prev, item]
    );
  };

  // Select all visible items
  const selectAllVisible = () => {
    setSelectedItems(prev => {
      const newSelection = [...prev];
      filteredItems.forEach(item => {
        if (!newSelection.includes(item)) {
          newSelection.push(item);
        }
      });
      return newSelection;
    });
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedItems([]);
  };

  // Handle search operation
  const handleSearchSelected = async () => {
    if (selectedItems.length === 0) return;
    
    setLoading(true);
    setSearchProgress(0);
    setExternalResults([]);
    const allResults = [];
    
    try {
      // Show start toast
      toast({
        title: "Busca iniciada",
        description: `Buscando ${selectedItems.length} produtos...`,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
      
      for (let i = 0; i < selectedItems.length; i++) {
        const term = selectedItems[i];
        try {
          const res = await fetch(
            `${apiUrl}/api/automation/search-external?term=${encodeURIComponent(term)}`
          );
          
          if (!res.ok) {
            throw new Error(`Erro ao buscar ${term}: ${res.status}`);
          }
          
          const data = await res.json();
          
          for (const [source, items] of Object.entries(data.results)) {
            if (Array.isArray(items)) {
              items.forEach((item) => {
                allResults.push({
                  supermercado: source,
                  produto: item.name || "-",
                  preco: item.price || "-",
                  quantidade: item.quantity,
                  unidade: item.unit,
                  data: new Date().toLocaleDateString("pt-BR"),
                  link: item.link || "#",
                });
              });
            }
          }
          
          // Update progress
          setSearchProgress(((i + 1) / selectedItems.length) * 100);
          
        } catch (err) {
          console.error(`Erro ao buscar: ${term}`, err.message);
          // Show error toast for this specific item
          toast({
            title: "Erro na busca",
            description: `Não foi possível buscar "${term}": ${err.message}`,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top-right"
          });
        }
      }
      
      // Sort results by default sorting
      const sortedResults = sortResults(allResults, sortBy.field, sortBy.direction);
      setExternalResults(sortedResults);
      
      // Show completion toast
      toast({
        title: "Busca concluída",
        description: `Encontrados ${allResults.length} resultados`,
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
      
    } catch (error) {
      console.error("Erro na busca:", error);
      toast({
        title: "Erro na busca",
        description: "Ocorreu um erro ao buscar os produtos",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right"
      });
    } finally {
      setLoading(false);
      setSearchProgress(100);
    }
  };

  // Sort results
  const sortResults = (results, field, direction) => {
    return [...results].sort((a, b) => {
      let aValue = a[field];
      let bValue = b[field];
      
      // Handle string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      // Handle price special case
      if (field === 'preco') {
        aValue = typeof aValue === 'number' ? aValue : Number.MAX_VALUE;
        bValue = typeof bValue === 'number' ? bValue : Number.MAX_VALUE;
      }
      
      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Handle sorting change
  const handleSort = (field) => {
    setSortBy(prev => {
      const newDirection = prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc';
      
      // Sort the current results
      const sortedResults = sortResults(externalResults, field, newDirection);
      setExternalResults(sortedResults);
      
      return { field, direction: newDirection };
    });
  };

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" my={6}>
          Visualização Automática
        </Heading>
        
        {/* Product Selection Section */}
        <Card borderRadius="lg" boxShadow="sm" bg={cardBg} overflow="hidden">
          <CardHeader bg={headerBg} py={4}>
            <Flex justifyContent="space-between" alignItems="center">
              <Heading size="md">Selecione os Produtos</Heading>
              <HStack spacing={2}>
                <Button 
                  size="sm" 
                  leftIcon={<CheckIcon />}
                  onClick={selectAllVisible}
                  variant="outline"
                  colorScheme="brand"
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
              <Flex justify="space-between" align="center">
                <Text fontSize="sm" color="gray.600">
                  {filteredItems.length} produtos encontrados
                </Text>
                <Badge colorScheme="brand" py={1} px={2} borderRadius="full">
                  {selectedItems.length} selecionados
                </Badge>
              </Flex>
              
              {/* Products Grid */}
              <Box 
                maxH="300px" 
                overflowY="auto" 
                pr={2}
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
                  templateColumns="repeat(auto-fill, minmax(250px, 1fr))" 
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
                size="lg"
                leftIcon={<SearchIcon />}
                onClick={handleSearchSelected}
                isLoading={loading}
                loadingText="Buscando..."
                isDisabled={selectedItems.length === 0}
                width="100%"
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
        
        {/* Results Section */}
        {externalResults.length > 0 && (
          <Card borderRadius="lg" boxShadow="sm" bg={cardBg} overflow="hidden">
            <CardHeader bg={headerBg} py={4}>
              <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Heading size="md">Resultados ({externalResults.length})</Heading>
                
                <HStack spacing={3}>
                  {/* View Toggle */}
                  <Tabs 
                    variant="soft-rounded" 
                    size="sm" 
                    colorScheme="brand"
                    index={activeView === "grid" ? 0 : 1}
                    onChange={(index) => setActiveView(index === 0 ? "grid" : "table")}
                  >
                    <TabList>
                      <Tab>Grade</Tab>
                      <Tab>Tabela</Tab>
                    </TabList>
                  </Tabs>
                  
                  {/* Export Button */}
                  <Tooltip label="Exportar resultados">
                    <IconButton
                      icon={<DownloadIcon />}
                      aria-label="Exportar"
                      variant="outline"
                      colorScheme="brand"
                    />
                  </Tooltip>
                </HStack>
              </Flex>
            </CardHeader>
            
            <CardBody p={4}>
              {/* Grid View */}
              {activeView === "grid" && (
                <Grid 
                  templateColumns={{
                    base: "repeat(1, 1fr)",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(3, 1fr)",
                    lg: "repeat(4, 1fr)",
                    xl: "repeat(5, 1fr)"
                  }}
                  gap={4}
                >
                  {externalResults.map((item, index) => (
                    <ResultCard key={index} item={item} />
                  ))}
                </Grid>
              )}
              
              {/* Table View */}
              {activeView === "table" && (
                <TableContainer>
                  <Table variant="simple" size="md">
                    <Thead>
                      <Tr>
                        <Th 
                          cursor="pointer" 
                          onClick={() => handleSort("supermercado")}
                          position="relative"
                          px={4}
                        >
                          <Flex align="center">
                            Supermercado
                            {sortBy.field === "supermercado" && (
                              <Box ml={1}>
                                {sortBy.direction === "asc" ? (
                                  <ArrowUpIcon boxSize={3} />
                                ) : (
                                  <ArrowDownIcon boxSize={3} />
                                )}
                              </Box>
                            )}
                          </Flex>
                        </Th>
                        <Th 
                          cursor="pointer" 
                          onClick={() => handleSort("produto")}
                        >
                          <Flex align="center">
                            Produto
                            {sortBy.field === "produto" && (
                              <Box ml={1}>
                                {sortBy.direction === "asc" ? (
                                  <ArrowUpIcon boxSize={3} />
                                ) : (
                                  <ArrowDownIcon boxSize={3} />
                                )}
                              </Box>
                            )}
                          </Flex>
                        </Th>
                        <Th 
                          cursor="pointer" 
                          onClick={() => handleSort("preco")}
                          isNumeric
                        >
                          <Flex align="center" justifyContent="flex-end">
                            Preço(R$)
                            {sortBy.field === "preco" && (
                              <Box ml={1}>
                                {sortBy.direction === "asc" ? (
                                  <ArrowUpIcon boxSize={3} />
                                ) : (
                                  <ArrowDownIcon boxSize={3} />
                                )}
                              </Box>
                            )}
                          </Flex>
                        </Th>
                        <Th>Quantidade</Th>
                        <Th>Unidade</Th>
                        <Th>Data</Th>
                        <Th>Link</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {externalResults.map((item, index) => (
                        <Tr key={index} _hover={{ bg: "gray.50" }}>
                          <Td>
                            <Badge 
                              colorScheme={
                                item.supermercado === 'atacadao' ? 'blue' : 
                                item.supermercado === 'spani' ? 'green' : 
                                item.supermercado === 'tenda' ? 'orange' : 'gray'
                              }
                            >
                              {{
                                atacadao: "Atacadão",
                                spani: "Spani",
                                tenda: "Tenda",
                              }[item.supermercado] || item.supermercado}
                            </Badge>
                          </Td>
                          <Td maxW="300px" isTruncated>{item.produto}</Td>
                          <Td isNumeric fontWeight="bold" color="brand.600">
                            {typeof item.preco === "number"
                              ? item.preco.toFixed(2).replace(".", ",")
                              : "-"}
                          </Td>
                          <Td>{item.quantidade}</Td>
                          <Td>{item.unidade}</Td>
                          <Td>{item.data}</Td>
                          <Td>
                            <Link
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              color="brand.500"
                              display="inline-flex"
                              alignItems="center"
                            >
                              Ver <ExternalLinkIcon ml={1} />
                            </Link>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
}

export default VisualizacaoAutomatica;
