import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  HStack,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Tooltip,
  Skeleton,
  Badge,
} from "@chakra-ui/react";
import { 
  SearchIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon,
  TriangleDownIcon,
  TriangleUpIcon,
  ChevronDownIcon,
  RepeatIcon,
} from "@chakra-ui/icons";

const EnhancedTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyMessage = "Nenhum resultado encontrado",
  pageSize = 10,
  currentPage = 1,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  onSearch,
  onSort,
  searchPlaceholder = "Buscar...",
  sortField,
  sortDirection,
  showSearch = true,
  showPagination = true,
}) => {
  const bg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  
  // Calculate total pages
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Handle pagination change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && onPageChange) {
      onPageChange(newPage);
    }
  };
  
  // Handle search input
  const handleSearch = (event) => {
    if (onSearch) {
      onSearch(event.target.value);
    }
  };
  
  // Handle sorting
  const handleSort = (field) => {
    if (onSort) {
      const newDirection = 
        field === sortField && sortDirection === "asc" ? "desc" : "asc";
      onSort(field, newDirection);
    }
  };
  
  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are few
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages with ellipsis for many pages
      if (currentPage <= 3) {
        // Current page is near the beginning
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Current page is near the end
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // Current page is in the middle
        pageNumbers.push(1);
        pageNumbers.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("...");
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Generate skeleton rows when loading
  const renderSkeletonRows = () => {
    return Array(pageSize)
      .fill(0)
      .map((_, rowIndex) => (
        <Tr key={`skeleton-row-${rowIndex}`}>
          {columns.map((column, colIndex) => (
            <Td key={`skeleton-cell-${rowIndex}-${colIndex}`}>
              <Skeleton height="20px" />
            </Td>
          ))}
        </Tr>
      ));
  };

  return (
    <Box borderRadius="lg" overflow="hidden" boxShadow="sm" bg={bg}>
      {/* Table Header with Search and Controls */}
      <Flex 
        p={4} 
        bg={headerBg} 
        borderBottom="1px" 
        borderColor={borderColor}
        justify="space-between"
        align="center"
        flexWrap={{ base: "wrap", md: "nowrap" }}
        gap={3}
      >
        {showSearch && (
          <InputGroup size="md" maxW={{ base: "100%", md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder={searchPlaceholder}
              onChange={handleSearch}
              borderRadius="md"
            />
          </InputGroup>
        )}
        
        <HStack spacing={3} ml="auto">
          {onPageSizeChange && (
            <HStack>
              <Text fontSize="sm" whiteSpace="nowrap">Mostrar:</Text>
              <Select
                size="sm"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                width="70px"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </Select>
            </HStack>
          )}
          
          <Tooltip label="Atualizar dados">
            <IconButton
              icon={<RepeatIcon />}
              aria-label="Refresh"
              variant="ghost"
              size="sm"
            />
          </Tooltip>
        </HStack>
      </Flex>

      {/* Table Content */}
      <TableContainer>
        <Table variant="simple" size="md">
          <Thead>
            <Tr>
              {columns.map((column) => (
                <Th
                  key={column.field}
                  onClick={() => column.sortable && handleSort(column.field)}
                  cursor={column.sortable ? "pointer" : "default"}
                  position="relative"
                  bg={sortField === column.field ? "gray.100" : "transparent"}
                  transition="background-color 0.2s"
                  whiteSpace="nowrap"
                >
                  <Flex align="center">
                    {column.header}
                    {column.sortable && sortField === column.field && (
                      <Box ml={2}>
                        {sortDirection === "asc" ? (
                          <TriangleUpIcon boxSize={3} />
                        ) : (
                          <TriangleDownIcon boxSize={3} />
                        )}
                      </Box>
                    )}
                  </Flex>
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              renderSkeletonRows()
            ) : data.length === 0 ? (
              <Tr>
                <Td colSpan={columns.length} textAlign="center" py={10}>
                  <Text color="gray.500">{emptyMessage}</Text>
                </Td>
              </Tr>
            ) : (
              data.map((row, rowIndex) => (
                <Tr 
                  key={row.id || `row-${rowIndex}`}
                  _hover={{ bg: hoverBg }}
                  transition="background-color 0.2s"
                >
                  {columns.map((column) => (
                    <Td key={`cell-${rowIndex}-${column.field}`}>
                      {column.render 
                        ? column.render(row[column.field], row)
                        : row[column.field]}
                    </Td>
                  ))}
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {showPagination && (
        <Flex
          justify="space-between"
          align="center"
          p={4}
          borderTop="1px"
          borderColor={borderColor}
          flexWrap={{ base: "wrap", md: "nowrap" }}
          gap={3}
        >
          <Text fontSize="sm" color="gray.600">
            Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalItems)} a{" "}
            {Math.min(currentPage * pageSize, totalItems)} de {totalItems} resultados
          </Text>
          
          <HStack spacing={1}>
            <IconButton
              icon={<ChevronLeftIcon />}
              aria-label="Previous Page"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              isDisabled={currentPage === 1}
            />
            
            {generatePageNumbers().map((page, index) => (
              page === "..." ? (
                <Text key={`ellipsis-${index}`} mx={1}>...</Text>
              ) : (
                <Button
                  key={`page-${page}`}
                  size="sm"
                  colorScheme={currentPage === page ? "brand" : "gray"}
                  variant={currentPage === page ? "solid" : "ghost"}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              )
            ))}
            
            <IconButton
              icon={<ChevronRightIcon />}
              aria-label="Next Page"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              isDisabled={currentPage === totalPages}
            />
          </HStack>
        </Flex>
      )}
    </Box>
  );
};

export default EnhancedTable;
