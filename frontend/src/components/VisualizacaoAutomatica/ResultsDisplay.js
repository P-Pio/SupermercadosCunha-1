import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  HStack,
  Heading,
  Tabs,
  TabList,
  Tab,
  Tooltip,
  IconButton,
  Grid,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Box,
  Link,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  DownloadIcon,
  ExternalLinkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@chakra-ui/icons";
import ResultCard from "./ResultCard";
import { getSupermarketName, formatPrice } from "../../utils/formatters";

/**
 * Results Display component
 * @param {Object} props
 * @param {Array} props.results - Search results
 * @param {Object} props.sortBy - Current sort settings
 * @param {Function} props.handleSort - Handle sort change
 */
const ResultsDisplay = ({ results, sortBy, handleSort }) => {
  const [activeView, setActiveView] = useState("grid"); // "grid" or "table"
  const cardBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");

  if (results.length === 0) {
    return null;
  }

  return (
    <Card borderRadius="lg" boxShadow="sm" bg={cardBg} overflow="hidden">
      <CardHeader bg={headerBg} py={4}>
        <Flex justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Heading size="md">Resultados ({results.length})</Heading>
          
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
            {results.map((item, index) => (
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
                {results.map((item, index) => (
                  <Tr key={index} _hover={{ bg: "gray.50" }}>
                    <Td>
                      <Badge 
                        colorScheme={
                          item.supermercado === 'atacadao' ? 'blue' : 
                          item.supermercado === 'spani' ? 'green' : 
                          item.supermercado === 'tenda' ? 'orange' : 'gray'
                        }
                      >
                        {getSupermarketName(item.supermercado)}
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
  );
};

export default ResultsDisplay;