import React, { useState, useEffect } from "react";
import FilterSidebar from "../components/FilterSidebar";
import ErrorBoundary from "./ErrorBoundary";
import {
  Box,
  FormLabel,
  VStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  Button,
  Flex,
  Spacer,
  HStack,
  Container,
  Text,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Badge,
  Tooltip,
  Skeleton,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  IconButton,
  InputGroup,
  InputLeftElement,
  Input,
  Select,
  useColorModeValue,
  Tag,
  TableContainer,
} from "@chakra-ui/react";
import { SearchIcon, RepeatIcon, InfoIcon, ChevronDownIcon } from "@chakra-ui/icons";
import SelectSearch from "react-select";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

function VisualizacaoGeral() {
  const [prices, setPrices] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedSupermarkets, setSelectedSupermarkets] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [supermarkets, setSupermarkets] = useState([]);
  const [brands, setBrands] = useState([]);
  const [items, setItems] = useState([]);
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [sortOrder, setSortOrder] = useState("");
  const [graphData, setGraphData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("40 days");
  const [currentItemId, setCurrentItemId] = useState(null);
  const [currentUnitType, setCurrentUnitType] = useState(null);
  const [currentUnitValue, setCurrentUnitValue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [chartTitle, setChartTitle] = useState("");
  
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
  
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700");
  const cardBg = useColorModeValue("white", "gray.800");
  const chartCardBg = useColorModeValue("white", "gray.800");

  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fetchPrices = async () => {
          const response = await fetch(`${apiUrl}/api/prices`);
          if (!response.ok) throw new Error("Failed to fetch prices");
          const data = await response.json();
          setPrices(data);
        };

        const fetchSupermarkets = async () => {
          const response = await fetch(`${apiUrl}/api/supermarkets`);
          if (!response.ok) throw new Error("Failed to fetch supermarkets");
          const data = await response.json();
          setSupermarkets(data);
        };

        const fetchBrands = async () => {
          const response = await fetch(`${apiUrl}/api/brands`);
          if (!response.ok) throw new Error("Failed to fetch brands");
          const data = await response.json();
          setBrands(data);
        };

        const fetchItems = async () => {
          const response = await fetch(`${apiUrl}/api/items`);
          if (!response.ok) throw new Error("Failed to fetch items");
          const data = await response.json();
          setItems(data);
        };

        await Promise.all([
          fetchPrices(),
          fetchSupermarkets(),
          fetchBrands(),
          fetchItems()
        ]);
        
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchResources();
  }, [apiUrl]);

  const getUniqueLatestPrices = (prices) => {
    const grouped = prices.reduce((acc, price) => {
      const identifier = `${price.itemId._id}-${price.supermarketId._id}-${price.brandId._id}-${price.unitType}-${price.unitValue}`;
      if (
        !acc[identifier] ||
        new Date(acc[identifier].createdAt) < new Date(price.createdAt)
      ) {
        acc[identifier] = price;
      }
      return acc;
    }, {});

    return Object.values(grouped);
  };

  const filteredPrices = getUniqueLatestPrices(prices)
    .filter(
      (price) =>
        price.price >= priceRange[0] &&
        price.price <= priceRange[1] &&
        (selectedSupermarkets.length
          ? selectedSupermarkets.includes(price.supermarketId._id)
          : true) &&
        (selectedBrands.length
          ? selectedBrands.includes(price.brandId._id)
          : true) &&
        (selectedItems.length ? selectedItems.includes(price.itemId._id) : true)
    )
    .sort((a, b) => {
      if (sortOrder === "lowest") {
        return a.price - b.price;
      } else if (sortOrder === "highest") {
        return b.price - a.price;
      }
      return 0;
    });

  const itemOptions = items.map((item) => ({
    value: item._id,
    label: item.name,
  }));

  const handleSelectItem = (selectedOption) => {
    setSelectedItems(selectedOption ? [selectedOption.value] : []);
    setSelectedItemName(selectedOption ? selectedOption.label : "");
  };

  // Updated function to fetch and process historical data
  const fetchHistoricalData = async (itemId, period, unitType, unitValue) => {
    if (!itemId) {
      console.error("Item ID is undefined!");
      return;
    }

    setLoading(true);
    const encodedPeriod = encodeURIComponent(period);
    const url = `${apiUrl}/api/prices/historical/${itemId}?period=${encodedPeriod}`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        // Find the item name for the chart title
        const item = items.find(i => i._id === itemId);
        const itemName = item ? item.name : "";
        
        // Set the chart title
        setChartTitle(`Histórico de preços: ${itemName} (${unitValue} ${unitType})`);
        
        // First, filter data by unit type and value
        const filteredData = data.filter(
          (item) =>
            item.unitType === unitType &&
            parseFloat(item.unitValue) === parseFloat(unitValue)
        );

        // Now, find the lowest price per day
        const lowestPricesPerDay = {};
        filteredData.forEach((entry) => {
          const day = new Date(entry.createdAt).toISOString().split("T")[0];
          const price = entry.lowestPrice || entry.price;

          // Only keep the lowest price for each day
          if (
            !lowestPricesPerDay[day] ||
            price < lowestPricesPerDay[day].price
          ) {
            lowestPricesPerDay[day] = { date: day, price };
          }
        });
        
        // Map the object back to an array for chart data
        setGraphData(Object.values(lowestPricesPerDay));
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (error) {
      console.error("Error fetching historical prices:", error);
      setError("Falha ao carregar dados históricos: " + error.message);
      setGraphData([]);
    } finally {
      setLoading(false);
    }
  };

  // Update the handleShowGraph function to pass the additional filtering parameters
  const handleShowGraph = (itemId, unitType, unitValue) => {
    setCurrentItemId(itemId);
    setCurrentUnitType(unitType);
    setCurrentUnitValue(unitValue);
    fetchHistoricalData(itemId, selectedPeriod, unitType, unitValue);
  };

  // Update handlePeriodChange if needed
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    if (currentItemId && currentUnitType && currentUnitValue) {
      fetchHistoricalData(
        currentItemId,
        period,
        currentUnitType,
        currentUnitValue
      );
    }
  };

  const chartData = {
    labels: graphData.map((entry) => {
      // Parse the date as UTC to avoid timezone issues
      const date = new Date(entry.date + "T00:00:00Z");
      return date.toLocaleDateString("pt-BR", {
        timeZone: "UTC",
      });
    }),
    datasets: [
      {
        label: "Preço",
        data: graphData.map((entry) => parseFloat(entry.price)),
        borderColor: "rgb(26, 157, 255)",
        backgroundColor: "rgba(26, 157, 255, 0.1)",
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: "white",
        pointBorderColor: "rgb(26, 157, 255)",
        pointBorderWidth: 2,
        tension: 0.3,
      },
    ],
  };
  
  const chartOptions = {
    scales: {
      x: {
        type: "time",
        time: {
          parser: "dd/MM/yyyy",
          unit: "day",
          displayFormats: {
            day: "dd/MM/yy",
          },
        },
        title: {
          display: true,
          text: "Data",
          font: {
            weight: "bold",
          },
        },
        ticks: {
          source: "labels",
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Preço (R$)",
          font: {
            weight: "bold",
          },
        },
        grid: {
          display: true,
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          callback: function(value) {
            return "R$ " + value.toFixed(2);
          }
        }
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function(context) {
            return "R$ " + context.raw.toFixed(2);
          }
        },
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        padding: 10,
        cornerRadius: 6,
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 14,
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    elements: {
      line: {
        borderWidth: 3,
      },
    },
  };

  const customSelectStyles = {
    control: (provided) => ({
      ...provided,
      borderRadius: '0.375rem',
      borderColor: '#E2E8F0',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#4DB3FF',
      },
      minWidth: '250px',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#0080E6' : state.isFocused ? '#E6F7FF' : null,
      color: state.isSelected ? 'white' : 'black',
    }),
  };

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" my={6}>
          Visualização Geral
        </Heading>
        
        <Card borderRadius="lg" boxShadow="sm" bg={cardBg}>
          <CardBody>
            <VStack spacing={6} align="start">
              <FormLabel fontWeight="medium" fontSize="md">Selecione o Item para buscar o preço</FormLabel>
              <HStack spacing={4} w="full" flexWrap={["wrap", "wrap", "nowrap"]}>
                <Box minW="250px">
                  <SelectSearch
                    options={itemOptions}
                    onChange={handleSelectItem}
                    placeholder="Procurar item"
                    isClearable={true}
                    isSearchable={true}
                    styles={customSelectStyles}
                  />
                </Box>
                <Spacer />
                <FilterSidebar
                  isOpen={isOpen}
                  onOpen={onOpen}
                  onClose={onClose}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  supermarkets={supermarkets}
                  selectedSupermarkets={selectedSupermarkets}
                  setSelectedSupermarkets={setSelectedSupermarkets}
                  brands={brands}
                  selectedBrands={selectedBrands}
                  setSelectedBrands={setSelectedBrands}
                  items={items}
                  selectedItems={selectedItems}
                  setSelectedItems={setSelectedItems}
                  setSortOrder={setSortOrder}
                />
              </HStack>
              
              {(selectedSupermarkets.length > 0 || selectedBrands.length > 0 || selectedItems.length > 0) && (
                <Box w="full">
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Filtros ativos:</Text>
                  <Flex flexWrap="wrap" gap={2}>
                    {selectedItems.length > 0 && (
                      <Badge colorScheme="blue" p={1} borderRadius="md">
                        Itens: {selectedItems.length}
                      </Badge>
                    )}
                    {selectedBrands.length > 0 && (
                      <Badge colorScheme="green" p={1} borderRadius="md">
                        Marcas: {selectedBrands.length}
                      </Badge>
                    )}
                    {selectedSupermarkets.length > 0 && (
                      <Badge colorScheme="purple" p={1} borderRadius="md">
                        Supermercados: {selectedSupermarkets.length}
                      </Badge>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                      <Badge colorScheme="orange" p={1} borderRadius="md">
                        Preço: R${priceRange[0]} - R${priceRange[1]}
                      </Badge>
                    )}
                  </Flex>
                </Box>
              )}
            </VStack>
          </CardBody>
        </Card>
        
        <Card borderRadius="lg" boxShadow="sm" bg={cardBg} overflow="hidden">
          <CardHeader bg={tableHeaderBg} py={3}>
            <Flex justify="space-between" align="center">
              <Heading size="md" fontWeight="600">Resultados ({filteredPrices.length})</Heading>
              {sortOrder && (
                <Badge colorScheme="brand" p={1} borderRadius="md">
                  {sortOrder === "lowest" ? "Preço crescente" : "Preço decrescente"}
                </Badge>
              )}
            </Flex>
          </CardHeader>
          <Divider />
          
          <TableContainer>
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th>Item</Th>
                  <Th>Supermercado</Th>
                  <Th>Cidade</Th>
                  <Th>Estado</Th>
                  <Th isNumeric>Preço</Th>
                  <Th>Marca</Th>
                  <Th>Unidade</Th>
                  <Th>Quantidade</Th>
                  <Th>Ações</Th>
                </Tr>
              </Thead>
              <Tbody>
                {loading ? (
                  Array(5).fill(0).map((_, index) => (
                    <Tr key={index}>
                      {Array(9).fill(0).map((_, cellIndex) => (
                        <Td key={cellIndex}>
                          <Skeleton height="20px" />
                        </Td>
                      ))}
                    </Tr>
                  ))
                ) : filteredPrices.length === 0 ? (
                  <Tr>
                    <Td colSpan={9} textAlign="center" py={4}>
                      <Text>Nenhum resultado encontrado. Tente ajustar os filtros.</Text>
                    </Td>
                  </Tr>
                ) : (
                  filteredPrices.map((price) => (
                    <Tr key={price._id} _hover={{ bg: "gray.50" }}>
                      <Td fontWeight="medium">{price.itemId.name}</Td>
                      <Td>{price.supermarketId.name}</Td>
                      <Td>{price.city}</Td>
                      <Td>{price.state}</Td>
                      <Td isNumeric fontWeight="bold" color="brand.600">
                        R$ {parseFloat(price.price).toFixed(2)}
                      </Td>
                      <Td>{price.brandId.name}</Td>
                      <Td>{price.unitType}</Td>
                      <Td>{price.unitValue}</Td>
                      <Td>
                        <Button
                          size="sm"
                          colorScheme="brand"
                          onClick={() =>
                            handleShowGraph(
                              price.itemId._id,
                              price.unitType,
                              price.unitValue
                            )
                          }
                          isLoading={loading && 
                            currentItemId === price.itemId._id && 
                            currentUnitType === price.unitType && 
                            currentUnitValue === price.unitValue}
                        >
                          Ver Gráfico
                        </Button>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Card>
        
        {/* Chart Section */}
        {graphData.length > 0 && (
          <Card borderRadius="lg" boxShadow="sm" bg={chartCardBg} overflow="hidden">
            <CardHeader bg={tableHeaderBg} py={3}>
              <Flex justify="space-between" align="center">
                <Heading size="md" fontWeight="600">{chartTitle}</Heading>
                <HStack>
                  <Tooltip label="Atualizado em: Hoje às 10:15" placement="top">
                    <InfoIcon color="gray.500" />
                  </Tooltip>
                </HStack>
              </Flex>
            </CardHeader>
            <Divider />
            
            <CardBody p={4}>
              <Box height="400px" position="relative">
                <ErrorBoundary>
                  <Line data={chartData} options={chartOptions} />
                </ErrorBoundary>
              </Box>
              
              <Flex justify="center" mt={6} wrap="wrap" gap={4}>
                <Button
                  colorScheme="brand"
                  variant={selectedPeriod === "40 days" ? "solid" : "outline"}
                  onClick={() => handlePeriodChange("40 days")}
                  size="md"
                >
                  40 Dias
                </Button>
                <Button
                  colorScheme="brand"
                  variant={selectedPeriod === "3 months" ? "solid" : "outline"}
                  onClick={() => handlePeriodChange("3 months")}
                  size="md"
                >
                  3 Meses
                </Button>
                <Button
                  colorScheme="brand"
                  variant={selectedPeriod === "6 months" ? "solid" : "outline"}
                  onClick={() => handlePeriodChange("6 months")}
                  size="md"
                >
                  6 Meses
                </Button>
                <Button
                  colorScheme="brand"
                  variant={selectedPeriod === "1 year" ? "solid" : "outline"}
                  onClick={() => handlePeriodChange("1 year")}
                  size="md"
                >
                  1 Ano
                </Button>
              </Flex>
              
              {/* Stats Section */}
              {graphData.length > 1 && (
                <Grid templateColumns="repeat(4, 1fr)" gap={4} mt={8}>
                  <StatsCard
                    title="Preço Atual"
                    value={`R$ ${parseFloat(graphData[graphData.length - 1].price).toFixed(2)}`}
                    color="brand.500"
                  />
                  <StatsCard
                    title="Preço Mínimo"
                    value={`R$ ${Math.min(...graphData.map(item => item.price)).toFixed(2)}`}
                    color="green.500"
                  />
                  <StatsCard
                    title="Preço Máximo"
                    value={`R$ ${Math.max(...graphData.map(item => item.price)).toFixed(2)}`}
                    color="red.500"
                  />
                  <StatsCard
                    title="Média"
                    value={`R$ ${(graphData.reduce((sum, item) => sum + parseFloat(item.price), 0) / graphData.length).toFixed(2)}`}
                    color="purple.500"
                  />
                </Grid>
              )}
            </CardBody>
          </Card>
        )}
      </VStack>
    </Container>
  );
}

// Stats Card Component
const StatsCard = ({ title, value, color }) => {
  const bg = useColorModeValue("white", "gray.700");
  
  return (
    <Box bg={bg} p={4} borderRadius="md" boxShadow="sm" borderLeft="4px solid" borderColor={color}>
      <Text fontSize="sm" color="gray.500">{title}</Text>
      <Text fontSize="xl" fontWeight="bold" color={color}>{value}</Text>
    </Box>
  );
};

export default VisualizacaoGeral;
