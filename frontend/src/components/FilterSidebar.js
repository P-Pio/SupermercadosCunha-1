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
} from "@chakra-ui/react";

function FilterSidebar({
  setPriceRange,
  priceRange,
  selectedSupermarkets,
  setSelectedSupermarkets,
  selectedBrands,
  setSelectedBrands,
  selectedItems,
  setSelectedItems,
  brands,
  items,
  supermarkets,
  setSortOrder,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [localPriceRange, setLocalPriceRange] = useState(priceRange);

  useEffect(() => {
    // Ensure local price range state is updated when global state changes
    setLocalPriceRange(priceRange);
  }, [priceRange]);

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

  const applyFilters = () => {
    setPriceRange(localPriceRange);
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen}>Abrir Filtros</Button>
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>Filtros</DrawerHeader>
          <DrawerBody>
            <Accordion allowMultiple>
              {/* Price Range Filter */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Faixa de Preço
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <RangeSlider
                    aria-label={["minPrice", "maxPrice"]}
                    min={0}
                    max={10000}
                    value={localPriceRange}
                    onChange={handlePriceChange}
                  >
                    <RangeSliderTrack>
                      <RangeSliderFilledTrack />
                    </RangeSliderTrack>
                    <RangeSliderThumb index={0} />
                    <RangeSliderThumb index={1} />
                  </RangeSlider>
                  <Box display="flex" mt="4">
                    <Input value={`$${localPriceRange[0]}`} readOnly />
                    <Input value={`$${localPriceRange[1]}`} readOnly />
                  </Box>
                </AccordionPanel>
              </AccordionItem>

              {/* Sorting Options */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Organizar Ordem
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <RadioGroup onChange={setSortOrder}>
                    <VStack align="start">
                      <Radio value="lowest">Preço mais baixo primeiro</Radio>
                      <Radio value="highest">Preço mais alto primeiro</Radio>
                    </VStack>
                  </RadioGroup>
                </AccordionPanel>
              </AccordionItem>

              {/* Supermarkets Filter */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Supermercados
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <CheckboxGroup
                    value={selectedSupermarkets}
                    onChange={handleSupermarketChange}
                  >
                    <Stack pl={6} mt={1} spacing={1}>
                      {supermarkets.map((supermarket) => (
                        <Checkbox key={supermarket._id} value={supermarket._id}>
                          {supermarket.name}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </AccordionPanel>
              </AccordionItem>

              {/* Brands Filter */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Marcas
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <CheckboxGroup
                    value={selectedBrands}
                    onChange={handleBrandChange}
                  >
                    <Stack pl={6} mt={1} spacing={1}>
                      {brands.map((brand) => (
                        <Checkbox key={brand._id} value={brand._id}>
                          {brand.name}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </AccordionPanel>
              </AccordionItem>

              {/* Items Filter */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">
                      Itens
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <CheckboxGroup
                    value={selectedItems}
                    onChange={handleItemChange}
                  >
                    <Stack pl={6} mt={1} spacing={1}>
                      {items.map((item) => (
                        <Checkbox key={item._id} value={item._id}>
                          {item.name}
                        </Checkbox>
                      ))}
                    </Stack>
                  </CheckboxGroup>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </DrawerBody>
          <DrawerFooter>
            <Button colorScheme="red" variant="outline" mr={3} onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme="blue" onClick={applyFilters}>
              Aplicar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default FilterSidebar;
