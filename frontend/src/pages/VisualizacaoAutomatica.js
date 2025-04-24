import React from "react";
import {
  Container,
  VStack,
  Heading,
} from "@chakra-ui/react";

// Import custom components and hooks
import ProductSelection from "../components/VisualizacaoAutomatica/ProductSelection";
import ResultsDisplay from "../components/VisualizacaoAutomatica/ResultsDisplay";
import useProductSearch from "../hooks/useProductSearch";

/**
 * VisualizacaoAutomatica page component
 * This component is responsible for displaying the automatic visualization page
 * that allows users to select products and search for their prices in supermarkets.
 */
function VisualizacaoAutomatica() {
  // Use our custom hook for all search related functionality
  const {
    selectedItems,
    externalResults,
    loading,
    searchProgress,
    sortBy,
    toggleItem,
    selectAllVisible,
    clearSelection,
    handleSearchSelected,
    handleSort
  } = useProductSearch();

  return (
    <Container maxW="container.xl" py={6}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center" my={6}>
          Visualização Automática
        </Heading>
        
        {/* Product Selection Section */}
        <ProductSelection
          selectedItems={selectedItems}
          toggleItem={toggleItem}
          selectAllVisible={selectAllVisible}
          clearSelection={clearSelection}
          handleSearchSelected={handleSearchSelected}
          loading={loading}
          searchProgress={searchProgress}
        />
        
        {/* Results Section - Only shown when there are results */}
        <ResultsDisplay
          results={externalResults}
          sortBy={sortBy}
          handleSort={handleSort}
        />
      </VStack>
    </Container>
  );
}

export default VisualizacaoAutomatica;