import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Checkbox,
  CheckboxGroup,
  Stack,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Input,
  Radio,
  RadioGroup,
  VStack,
  HStack,
  Text,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Badge,
  Divider,
  Flex,
  Icon,
  Tooltip,
} from "@chakra-ui/react";
import { SearchIcon, RepeatIcon, CloseIcon } from "@chakra-ui/icons";

function FilterSidebar({
  setPriceRange,
  priceRange = [0, 10000],
  selectedSupermarkets = [],
  setSelectedSupermarkets,
  selectedBrands = [],
  setSelectedBrands,
  selectedItems = [],
  setSelectedItems,
  brands = [],
  items = [],
  supermarkets = [],
  setSortOrder,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);
  const [searchTerms, setSearchTerms] = useState({
    supermarkets: "",
    brands: "",
    items: ""
  });
  const [sortValue, setSortValue] = useState("");
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Update local price range state when global state changes
    setLocalPriceRange(priceRange || [0, 10000]);
  }, [priceRange]);

  useEffect(() => {
    // Count active filters for the badge
    let count = 0;
    if (selectedSupermarkets && selectedSupermarkets.length > 0) count++;
    if (selectedBrands && selectedBrands.length > 0) count++;
    if (selectedItems && selectedItems.length > 0) count++;
    if (priceRange && (priceRange[0] > 0 || priceRange[1] < 10000)) count++;
    if (sortValue) count++;
    
    setActiveFiltersCount(count);
  }, [selectedSupermarkets, selectedBrands, selectedItems, priceRange, sortValue]);

  const handleSupermarketChange = (nextValue) => {
    setSelectedSupermarkets(nextValue);
  };

  const handleBrandChange = (nextValue) => {
    setSelectedBrands(nextValue);
  };

  const handleItemChange = (nextValue) => {
    setSelectedItems(nextValue);
  };

  const handlePriceChange = (value) => {
    setLocalPriceRange(value);
  };

  const handleSortChange = (value) => {
    setSortValue(value);
    setSortOrder(value);
  };

  const handleSearchChange = (category, value) => {
    setSearchTerms(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const applyFilters = () => {
    setPriceRange(localPriceRange);
    onClose();
  };

  const resetFilters = () => {
    setLocalPriceRange([0, 10000]);
    setSelectedSupermarkets([]);
    setSelectedBrands([]);
    setSelectedItems([]);
    setSortValue("");
    setSortOrder("");
    setPriceRange([0, 10000]);
    setSearchTerms({
      supermarkets: "",
      brands: "",
      items: ""
    });
  };

  // Safe toLowerCase function that handles nulls
  const safeToLowerCase = (str) => {
    if (typeof str === 'string') {
      return str.toLowerCase();
    }
    return '';
  };

  // Filter functions for search with safety checks
  const filteredSupermarkets = Array.isArray(supermarkets) ? supermarkets.filter(market => 
    market && market.name && safeToLowerCase(market.name).includes(safeToLowerCase(searchTerms.supermarkets))
  ) : [];
  
  const filteredBrands = Array.isArray(brands) ? brands.filter(brand => 
    brand && brand.name && safeToLowerCase(brand.name).includes(safeToLowerCase(searchTerms.brands))
  ) : [];
  
  const filteredItems = Array.isArray(items) ? items.filter(item => 
    item && item.name && safeToLowerCase(item.name).includes(safeToLowerCase(searchTerms.items))
  ) : [];

  return (
    <>
      <Button 
        onClick={onOpen} 
        leftIcon={<SearchIcon />} 
        colorScheme="brand" 
        variant="outline"
        position="relative"
      >
        Filtros
        {activeFiltersCount > 0 && (
          <Badge 
            colorScheme="brand" 
            borderRadius="full" 
            position="absolute" 
            top="-8px" 
            right="-8px"
          >
            {activeFiltersCount}
          </Badge>
        )}
      </Button>
      
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex justify="space-between" align="center">
              <Text>Filtros e Ordenação</Text>
              <Button 
                size="sm" 
                leftIcon={<RepeatIcon />} 
                variant="ghost" 
                onClick={resetFilters}
                colorScheme="red"
              >
                Redefinir
              </Button>
            </Flex>
          </DrawerHeader>

          <DrawerBody>
            <Accordion defaultIndex={[0]} allowMultiple>
              {/* Price Range Filter */}
              <AccordionItem mb={4}>
                <h2>
                  <AccordionButton _expanded={{ bg: 'brand.50', color: 'brand.600' }}>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Faixa de Preço
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <VStack spacing={6}>
                    <RangeSlider
                      aria-label={["minPrice", "maxPrice"]}
                      min={0}
                      max={10000}
                      step={10}
                      value={localPriceRange}
                      onChange={handlePriceChange}
                      colorScheme="brand"
                    >
                      <RangeSliderTrack>
                        <RangeSliderFilledTrack />
                      </RangeSliderTrack>
                      <Tooltip label={`R$${localPriceRange[0]}`} placement="top">
                        <RangeSliderThumb index={0} boxSize={6} />
                      </Tooltip>
                      <Tooltip label={`R$${localPriceRange[1]}`} placement="top">
                        <RangeSliderThumb index={1} boxSize={6} />
                      </Tooltip>
                    </RangeSlider>
                    
                    <HStack width="full" spacing={4}>
                      <InputGroup size="sm">
                        <InputLeftAddon children="R$" />
                        <Input value={localPriceRange[0]} readOnly />
                      </InputGroup>
                      <Text>até</Text>
                      <InputGroup size="sm">
                        <InputLeftAddon children="R$" />
                        <Input value={localPriceRange[1]} readOnly />
                      </InputGroup>
                    </HStack>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* Sorting Options */}
              <AccordionItem mb={4}>
                <h2>
                  <AccordionButton _expanded={{ bg: 'brand.50', color: 'brand.600' }}>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Ordenar Por
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <RadioGroup onChange={handleSortChange} value={sortValue}>
                    <VStack align="start" spacing={3}>
                      <Radio colorScheme="brand" value="lowest">Preço mais baixo primeiro</Radio>
                      <Radio colorScheme="brand" value="highest">Preço mais alto primeiro</Radio>
                    </VStack>
                  </RadioGroup>
                </AccordionPanel>
              </AccordionItem>

              {/* Supermarkets Filter */}
              <AccordionItem mb={4}>
                <h2>
                  <AccordionButton _expanded={{ bg: 'brand.50', color: 'brand.600' }}>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Supermercados
                    </Box>
                    {selectedSupermarkets && selectedSupermarkets.length > 0 && (
                      <Badge colorScheme="brand" mr={2}>
                        {selectedSupermarkets.length}
                      </Badge>
                    )}
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <InputGroup size="sm" mb={4}>
                    <InputLeftAddon children={<SearchIcon />} />
                    <Input 
                      placeholder="Buscar supermercados" 
                      value={searchTerms.supermarkets}
                      onChange={(e) => handleSearchChange('supermarkets', e.target.value)}
                    />
                    {searchTerms.supermarkets && (
                      <InputRightAddon 
                        children={<CloseIcon boxSize={3} />} 
                        cursor="pointer"
                        onClick={() => handleSearchChange('supermarkets', '')}
                      />
                    )}
                  </InputGroup>
                  
                  <CheckboxGroup
                    value={selectedSupermarkets}
                    onChange={handleSupermarketChange}
                  >
                    <VStack align="start" maxH="200px" overflowY="auto" spacing={2} pl={1}>
                      {filteredSupermarkets.length > 0 ? filteredSupermarkets.map((supermarket) => (
                        <Checkbox 
                          key={supermarket._id} 
                          value={supermarket._id}
                          colorScheme="brand"
                        >
                          {supermarket.name}
                        </Checkbox>
                      )) : (
                        <Text fontSize="sm" color="gray.500">
                          {supermarkets && supermarkets.length > 0 
                            ? "Nenhum supermercado encontrado" 
                            : "Carregando supermercados..."}
                        </Text>
                      )}
                    </VStack>
                  </CheckboxGroup>
                </AccordionPanel>
              </AccordionItem>

              {/* Brands Filter */}
              <AccordionItem mb={4}>
                <h2>
                  <AccordionButton _expanded={{ bg: 'brand.50', color: 'brand.600' }}>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Marcas
                    </Box>
                    {selectedBrands && selectedBrands.length > 0 && (
                      <Badge colorScheme="brand" mr={2}>
                        {selectedBrands.length}
                      </Badge>
                    )}
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <InputGroup size="sm" mb={4}>
                    <InputLeftAddon children={<SearchIcon />} />
                    <Input 
                      placeholder="Buscar marcas" 
                      value={searchTerms.brands}
                      onChange={(e) => handleSearchChange('brands', e.target.value)}
                    />
                    {searchTerms.brands && (
                      <InputRightAddon 
                        children={<CloseIcon boxSize={3} />} 
                        cursor="pointer"
                        onClick={() => handleSearchChange('brands', '')}
                      />
                    )}
                  </InputGroup>
                  
                  <CheckboxGroup
                    value={selectedBrands}
                    onChange={handleBrandChange}
                  >
                    <VStack align="start" maxH="200px" overflowY="auto" spacing={2} pl={1}>
                      {filteredBrands.length > 0 ? filteredBrands.map((brand) => (
                        <Checkbox 
                          key={brand._id} 
                          value={brand._id}
                          colorScheme="brand"
                        >
                          {brand.name}
                        </Checkbox>
                      )) : (
                        <Text fontSize="sm" color="gray.500">
                          {brands && brands.length > 0 
                            ? "Nenhuma marca encontrada" 
                            : "Carregando marcas..."}
                        </Text>
                      )}
                    </VStack>
                  </CheckboxGroup>
                </AccordionPanel>
              </AccordionItem>

              {/* Items Filter */}
              <AccordionItem mb={4}>
                <h2>
                  <AccordionButton _expanded={{ bg: 'brand.50', color: 'brand.600' }}>
                    <Box flex="1" textAlign="left" fontWeight="medium">
                      Itens
                    </Box>
                    {selectedItems && selectedItems.length > 0 && (
                      <Badge colorScheme="brand" mr={2}>
                        {selectedItems.length}
                      </Badge>
                    )}
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <InputGroup size="sm" mb={4}>
                    <InputLeftAddon children={<SearchIcon />} />
                    <Input 
                      placeholder="Buscar itens" 
                      value={searchTerms.items}
                      onChange={(e) => handleSearchChange('items', e.target.value)}
                    />
                    {searchTerms.items && (
                      <InputRightAddon 
                        children={<CloseIcon boxSize={3} />} 
                        cursor="pointer"
                        onClick={() => handleSearchChange('items', '')}
                      />
                    )}
                  </InputGroup>
                  
                  <CheckboxGroup
                    value={selectedItems}
                    onChange={handleItemChange}
                  >
                    <VStack align="start" maxH="200px" overflowY="auto" spacing={2} pl={1}>
                      {filteredItems.length > 0 ? filteredItems.map((item) => (
                        <Checkbox 
                          key={item._id} 
                          value={item._id}
                          colorScheme="brand"
                        >
                          {item.name}
                        </Checkbox>
                      )) : (
                        <Text fontSize="sm" color="gray.500">
                          {items && items.length > 0 
                            ? "Nenhum item encontrado" 
                            : "Carregando itens..."}
                        </Text>
                      )}
                    </VStack>
                  </CheckboxGroup>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="brand" onClick={applyFilters}>
              Aplicar Filtros
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default FilterSidebar;
