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
} from "@chakra-ui/react";
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
  const { isOpen, onClose, onOn } = useDisclosure();
  const [sortOrder, setSortOrder] = useState("");
  const [graphData, setGraphData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("40 days");
  const [currentItemId, setCurrentItemId] = useState(null);
  const [currentUnitType, setCurrentUnitType] = useState(null);
  const [currentUnitValue, setCurrentUnitValue] = useState(null);
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";


  useEffect(() => {
    const fetchResources = async () => {
      const fetchPrices = async () => {
        const response = await fetch(`${apiUrl}/api/prices`);
        const data = await response.json();
        setPrices(data);
      };

      const fetchSupermarkets = async () => {
        const response = await fetch(`${apiUrl}/api/supermarkets`);
        const data = await response.json();
        setSupermarkets(data);
      };

      const fetchBrands = async () => {
        const response = await fetch(`${apiUrl}/api/brands`);
        const data = await response.json();
        setBrands(data);
      };

      const fetchItems = async () => {
        const response = await fetch(`${apiUrl}/api/items`);
        const data = await response.json();
        setItems(data);
      };

      await fetchPrices();
      await fetchSupermarkets();
      await fetchBrands();
      await fetchItems();
    };

    fetchResources();
  }, []);

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
  };

  // Updated function to fetch and process historical data
  const fetchHistoricalData = async (itemId, period, unitType, unitValue) => {
    if (!itemId) {
      console.error("Item ID is undefined!");
      return;
    }


    const encodedPeriod = encodeURIComponent(period);
    const url = `${apiUrl}/api/prices/historical/${itemId}?period=${encodedPeriod}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error(
          `Server error: ${response.status} ${response.statusText}`
        );
        setGraphData([]);
        return;
      }

      const data = await response.json();
      if (Array.isArray(data)) {
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
        console.error("Unexpected response format:", data);
        setGraphData([]);
      }
    } catch (error) {
      console.error("Error fetching historical prices:", error);
      setGraphData([]);
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
      return date.toLocaleDateString("en-US", {
        timeZone: "UTC",
      });
    }),
    datasets: [
      {
        label: "Price over Time",
        data: graphData.map((entry) => parseFloat(entry.price)),
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgb(75, 192, 192, 0.2)",
        //tension: 0.1,
        fill: false,
        pointRadius: 0.01,
        //hitRadius: 10,
        //pointHoverRadius: 8,
        tension: 0.4,
      },
    ],
  };
  const chartOptions = {
    scales: {
      x: {
        type: "time",
        time: {
          parser: "MM/dd/yyyy",
          unit: "day",
          displayFormats: {
            day: "dd/MM/yyyy", // Adjust this if needed
          },
        },
        title: {
          display: true,
          text: "Date",
        },
        ticks: {
          source: "labels", // This makes the chart use the labels array for ticks
        },
        grid: {
          display: false, // This will hide the grid lines for the x-axis
        },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Preço (R$)",
        },
        grid: {
          display: false, // This will hide the grid lines for the x-axis
        },
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
  };

  return (
    <VStack spacing={4}>
      <Heading as="h1" size="xl" textAlign="center" my={6}>
        Visualização Geral
      </Heading>
      <FormLabel>Selecione o Item para buscar o preço</FormLabel>
      <HStack spacing={2}>
        <SelectSearch
          options={itemOptions}
          onChange={handleSelectItem}
          placeholder="Procurar item"
          isClearable={true}
          isSearchable={true}
        />
        <Spacer my={2}/>
        <FilterSidebar
          isOpen={isOpen}
          onOpen={onOn}
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
      <Box width="full">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Item</Th>
              <Th>Supemercado</Th>
              <Th>Cidade</Th>
              <Th>Estado</Th>
              <Th>Preço</Th>
              <Th>Marca</Th>
              <Th>Unidade</Th>
              <Th>Quantidade</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredPrices.map((price) => (
              <Tr key={price._id}>
                <Td>{price.itemId.name}</Td>
                <Td>{price.supermarketId.name}</Td>
                <Td>{price.city}</Td>
                <Td>{price.state}</Td>
                <Td>{`R$${price.price}`}</Td>
                <Td>{price.brandId.name}</Td>
                <Td>{price.unitType}</Td>
                <Td>{price.unitValue}</Td>
                <Button
                  onClick={() =>
                    handleShowGraph(
                      price.itemId._id,
                      price.unitType,
                      price.unitValue
                    )
                  }
                >
                  Mostrar Gráfico
                </Button>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
      {graphData.length > 0 && (
        <>
          <Box width="full" height="500px">
            {" "}
            {/* You can adjust the height as needed */}
            <ErrorBoundary>
              <Line data={chartData} options={chartOptions} />
            </ErrorBoundary>
          </Box>

          <Box display="flex" justifyContent="space-around" mt={4}>
            <Button
              colorScheme="blue"
              onClick={() => handlePeriodChange("40 days")}
            >
              40 Dias
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handlePeriodChange("3 months")}
            >
              3 Meses
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handlePeriodChange("6 months")}
            >
              6 Meses
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handlePeriodChange("1 year")}
            >
              1 Ano
            </Button>
          </Box>
        </>
      )}
    </VStack>
  );
}

export default VisualizacaoGeral;
