import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  HStack,
  Button,
  Text,
  Divider,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  CheckboxGroup,
  Stack,
} from "@chakra-ui/react";

function VisualizacaoGeral() {
  const [selectedItems, setSelectedItems] = useState([]);
  const [externalResults, setExternalResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

  const handleSearchSelected = async () => {
    if (selectedItems.length === 0) return;
    setLoading(true);
    const allResults = [];

    for (const term of selectedItems) {
      try {
        const res = await fetch(
          `${apiUrl}/api/automation/search-external?term=${encodeURIComponent(term)}`
        );
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
      } catch (err) {
        console.error(`Erro ao buscar: ${term}`, err.message);
      }
    }

    setExternalResults(allResults);
    setLoading(false);
  };

  return (
    <VStack spacing={6} p={8} align="stretch">
      <Heading size="xl" textAlign="center">
        Lista de Produtos
      </Heading>

      <Text>Selecione os produtos que deseja buscar:</Text>

      {/* ✅ Menu-like selection box */}
      <Box
        maxHeight="300px"
        overflowY="auto"
        borderWidth="1px"
        borderRadius="md"
        p={4}
        bg="gray.50"
      >
        <CheckboxGroup value={selectedItems} onChange={setSelectedItems}>
          <Stack spacing={2}>
            {defaultItemList.map((item) => (
              <Checkbox key={item} value={item}>
                {item}
              </Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
      </Box>

      <HStack spacing={4} mt={4}>
        <Button
          colorScheme="blue"
          onClick={handleSearchSelected}
          isDisabled={selectedItems.length === 0}
        >
          Buscar Selecionados
        </Button>
        <Text fontSize="sm" color="gray.600">
          {selectedItems.length} selecionado(s)
        </Text>
      </HStack>

      {loading && (
        <HStack justify="center" mt={6}>
          <Spinner size="lg" />
          <Text>Buscando nos supermercados...</Text>
        </HStack>
      )}

      {!loading && externalResults.length > 0 && (
        <Box mt={10}>
          <Divider mb={4} />
          <Heading size="md" mb={4}>
            Resultados
          </Heading>
          <Table variant="striped" size="md">
            <Thead>
              <Tr>
                <Th>Supermercado</Th>
                <Th>Produto</Th>
                <Th>Preço(R$)</Th>
                <Th>Quantidade</Th>
                <Th>Unidade</Th>
                <Th>Data</Th>
                <Th>Link</Th>
              </Tr>
            </Thead>
            <Tbody>
              {externalResults.map((item, index) => (
                <Tr key={index}>
                  <Td>
                    {{
                      atacadao: "Atacadão",
                      spani: "Spani",
                      tenda: "Tenda",
                    }[item.supermercado] || item.supermercado}
                  </Td>
                  <Td>{item.produto}</Td>
                  <Td>
                    {typeof item.preco === "number"
                      ? item.preco.toFixed(2).replace(".", ",")
                      : "-"}
                  </Td>
                  <Td>{item.quantidade}</Td>
                  <Td>{item.unidade}</Td>
                  <Td>{item.data}</Td>
                  <Td>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#3182ce" }}
                    >
                      Ver
                    </a>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </VStack>
  );
}

export default VisualizacaoGeral;
