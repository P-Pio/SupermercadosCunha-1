import { useState } from "react";
import { useToast } from "@chakra-ui/react";
import { sortResults } from "../utils/formatters";

/**
 * Custom hook for product search functionality
 * @returns {Object} Hook methods and state
 */
export const useProductSearch = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [externalResults, setExternalResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchProgress, setSearchProgress] = useState(0);
  const [sortBy, setSortBy] = useState({ field: "supermercado", direction: "asc" });
  
  const toast = useToast();
  const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000";
  
  /**
   * Toggle item selection
   * @param {string} item - Item to toggle
   */
  const toggleItem = (item) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item) 
        : [...prev, item]
    );
  };

  /**
   * Select all visible items
   * @param {Array} filteredItems - Currently visible/filtered items
   */
  const selectAllVisible = (filteredItems) => {
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

  /**
   * Clear all selections
   */
  const clearSelection = () => {
    setSelectedItems([]);
  };

  /**
   * Handle search operation
   */
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

  /**
   * Handle sorting change
   * @param {string} field - Field to sort by
   */
  const handleSort = (field) => {
    setSortBy(prev => {
      const newDirection = prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc';
      
      // Sort the current results
      const sortedResults = sortResults(externalResults, field, newDirection);
      setExternalResults(sortedResults);
      
      return { field, direction: newDirection };
    });
  };

  return {
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
  };
};

export default useProductSearch;