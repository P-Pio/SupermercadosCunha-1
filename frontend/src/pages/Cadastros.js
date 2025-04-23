import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Flex,
  InputGroup,
  InputLeftElement,
  Select,
} from "@chakra-ui/react";
import SelectSearch from "react-select";

function Cadastros() {
  const [supermercadoName, setSupermercadoName] = useState("");
  const [city, setCity] = useState(""); // State for city
  const [state, setState] = useState(""); // State for state (Brazilian states)
  const [itemName, setItemName] = useState("");
  const [items, setItems] = useState([]); // Holds the list of items
  const [supermarkets, setSupermarkets] = useState([]); // Holds the list of supermarkets
  const [selectedItem, setSelectedItem] = useState(""); // Selected item ID
  const [selectedSupermarket, setSelectedSupermarket] = useState(""); // Selected supermarket ID
  const [valorItemValor, setValorItemValor] = useState("");
  const [brandOptions, setBrandOptions] = useState([]); // State to hold the list of brands
  const [selectedBrand, setSelectedBrand] = useState("");
  const [brandName, setBrandName] = useState("");
  const [unitType, setUnitType] = useState("");
  const [unitValue, setUnitValue] = useState("");
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Fallback to localhost for development
  const toast = useToast();

  // Array of states in Brazil
  const brazilianStates = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
    "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", 
    "SP", "SE", "TO"
  ];

  useEffect(() => {
    fetchItems();
    fetchSupermarkets();
    fetchBrands();
  }, []);

  const fetchItems = async () => {
    const response = await fetch(`${apiUrl}/api/items`);
    const data = await response.json();
    setItems(data);
  };

  const fetchSupermarkets = async () => {
    const response = await fetch(`${apiUrl}/api/supermarkets`);
    const data = await response.json();
    setSupermarkets(data);
  };

  const handleSupermercadoSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/supermarkets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: supermercadoName, 
          city: city,  // Add city to the request body
          state: state // Add state to the request body
        }),
      });
      if (!response.ok) throw new Error("Failed to save supermarket");
      toast({
        title: "Success",
        description: "Supermarket saved successfully",
        status: "success",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      setSupermercadoName("");
      setCity("");  // Clear city input
      setState(""); // Clear state selection
      fetchSupermarkets();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: itemName }),
      });
      if (!response.ok) throw new Error("Failed to save item");
      toast({
        title: "Success",
        description: "Item saved successfully",
        status: "success",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      setItemName("");
      fetchItems();
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/brands`);
      const brands = await response.json();
      const options = brands.map((brand) => ({
        value: brand._id, // Assuming each brand has an _id and a name
        label: brand.name,
      }));
      setBrandOptions(options);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch brands.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleBrandSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/brands`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: brandName }),
      });
      if (!response.ok) throw new Error("Failed to save brand");
      toast({
        title: "Success",
        description: "Brand saved successfully",
        status: "success",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      setBrandName("");
      fetchBrands(); // Fetch the updated list of brands
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleValorItemSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiUrl}/api/prices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          price: valorItemValor,
          itemId: selectedItem,
          supermarketId: selectedSupermarket,
          brandId: selectedBrand.value, // Assuming the backend expects 'brandId'
          unitValue: unitValue,
          unitType: unitType,
          city: city,  // Added city to the request body
          state: state // Added state to the request body
        }),
      });

      if (!response.ok) throw new Error("Failed to save price");
      toast({
        title: "Success",
        description: "Price saved successfully",
        status: "success",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      setValorItemValor("");
      setSelectedItem("");
      setSelectedSupermarket("");
      setSelectedBrand("");
      setCity(""); // Clear city input
      setState(""); // Clear state selection
      setUnitType("");
      setUnitValue("");
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleBrandChange = (selectedOption) => {
    setSelectedBrand(selectedOption);
  };

  return (
    <VStack spacing={4}>
      <Heading as="h1" size="xl" textAlign="center" my={6}>
        Cadastros Gerais
      </Heading>
      <Flex>
        <Box p="5">
          <form onSubmit={handleSupermercadoSubmit}>
            <FormControl isRequired>
              <FormLabel>Supermercado</FormLabel>
              <Input
                placeholder="Nome do Supermercado"
                value={supermercadoName}
                onChange={(e) => setSupermercadoName(e.target.value)}
              />
            </FormControl>
            <Button mt="4" colorScheme="blue" type="submit">
              Salvar Supermercado
            </Button>
          </form>
        </Box>

        <Box p="5">
          <form onSubmit={handleItemSubmit}>
            <FormControl isRequired>
              <FormLabel>Item</FormLabel>
              <Input
                placeholder="Nome do Item"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </FormControl>
            <Button mt="4" colorScheme="blue" type="submit">
              Salvar Item
            </Button>
          </form>
        </Box>
        <Box p="5">
          <form onSubmit={handleBrandSubmit}>
            <FormControl isRequired>
              <FormLabel>Marca</FormLabel>
              <Input
                placeholder="Nome da Marca"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </FormControl>
            <Button mt="4" colorScheme="blue" type="submit">
              Salvar Marca
            </Button>
          </form>
        </Box>
      </Flex>
      <Box p="6">
        <form onSubmit={handleValorItemSubmit}>
          <Flex>
            <FormControl isRequired>
              <FormLabel>Selecione o Item</FormLabel>
              <Select
                placeholder="Selecione o Item"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
              >
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Valor Item</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none" children="R$" />
                <Input
                  type="number"
                  name="Valor"
                  placeholder="Valor"
                  onChange={(e) => setValorItemValor(e.target.value)}
                  value={valorItemValor}
                />
              </InputGroup>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Selecione a Marca</FormLabel>
              <SelectSearch
                options={brandOptions}
                value={selectedBrand}
                onChange={handleBrandChange}
                className="basic-single"
                classNamePrefix="select"
                placeholder="Selecione a Marca"
                isClearable
              />
            </FormControl>
          </Flex>
          <Flex>
            <FormControl isRequired>
              <FormLabel>Selecione a Medidade de Unidade</FormLabel>
              <Select
                placeholder="Selecione a unidade"
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
              >
                <option value="Kg">Kg</option>
                <option value="g">g</option>
                <option value="L">L</option>
                <option value="mL">mL</option>
                <option value="Unid">Unid</option>
                <option value="Caixa">Caixa</option>
              </Select>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Peso/Volume/Unidade do Item</FormLabel>
              <Input
                placeholder="Peso/Volume/Unidade do Item"
                type="number"
                value={unitValue}
                onChange={(e) => setUnitValue(e.target.value)}
              />
            </FormControl>
          </Flex>
          <FormLabel>Selecione o Supermercado/Mercado</FormLabel>
          <Select
            placeholder="Selecione o Supermercado/Mercado"
            value={selectedSupermarket}
            onChange={(e) => setSelectedSupermarket(e.target.value)}
          >
            {supermarkets.map((supermarket) => (
              <option key={supermarket._id} value={supermarket._id}>
                {supermarket.name}
              </option>
            ))}
          </Select>

         {/* Add City and State inputs */}
         <Flex>
            <FormControl isRequired>
              <FormLabel>Cidade</FormLabel>
              <Input
                placeholder="Nome da Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Estado</FormLabel>
              <Select
                placeholder="Selecione o Estado"
                value={state}
                onChange={(e) => setState(e.target.value)}
              >
                {brazilianStates.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Flex>
          <Button mt="4" colorScheme="blue" type="submit">
            Salvar Valor do Item
          </Button>
        </form>
      </Box>
    </VStack>
  );
}

export default Cadastros;
