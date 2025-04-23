import React from "react";
import {
  Box,
  Link,
  VStack,
  HStack,
  Text,
  Image,
  Divider,
  useColorModeValue,
  Icon,
} from "@chakra-ui/react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { 
  ChevronRightIcon 
} from "@chakra-ui/icons";

function Sidebar() {
  const location = useLocation();
  const bgColor = useColorModeValue("white", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const activeBg = useColorModeValue("brand.50", "brand.900");
  const activeColor = useColorModeValue("brand.600", "brand.200");

  const menuItems = [
    { name: "Página Inicial", path: "/", icon: "🏠" },
    { name: "Cadastros", path: "/cadastros", icon: "📝" },
    { name: "Visualização Geral", path: "/visualizacao-geral", icon: "📊" },
    { name: "Visualização Automática", path: "/visualizacao-automatica", icon: "🔄" },
  ];

  return (
    <Box
      bg={bgColor}
      h="100vh"
      w="250px"
      boxShadow="sm"
      borderRight="1px"
      borderColor={borderColor}
      py={6}
      position="sticky"
      top="0"
    >
      <VStack alignItems="center" mb={8}>
        <Box textAlign="center" p={4}>
          <Text fontSize="2xl" fontWeight="bold" color="brand.600">
            Supermercados Cunha
          </Text>
          <Text fontSize="sm" color="gray.500">
            Sistema de Gestão
          </Text>
        </Box>
      </VStack>

      <Divider mb={6} />

      <VStack spacing={1} align="stretch" px={3}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            as={RouterLink}
            to={item.path}
            textDecoration="none"
            _hover={{ textDecoration: "none" }}
          >
            <HStack
              py={3}
              px={4}
              borderRadius="md"
              bg={location.pathname === item.path ? activeBg : "transparent"}
              color={location.pathname === item.path ? activeColor : "gray.700"}
              _hover={{
                bg: location.pathname === item.path ? activeBg : "gray.100",
                color: location.pathname === item.path ? activeColor : "gray.800",
              }}
              transition="all 0.2s"
            >
              <Text fontSize="lg">{item.icon}</Text>
              <Text fontWeight={location.pathname === item.path ? "600" : "400"}>
                {item.name}
              </Text>
              {location.pathname === item.path && (
                <ChevronRightIcon ml="auto" />
              )}
            </HStack>
          </Link>
        ))}
      </VStack>

      <Box position="absolute" bottom={6} width="100%" px={4}>
        <Divider mb={4} />
        <Text color="gray.500" fontSize="xs" textAlign="center">
          © 2025 Supermercados Cunha
        </Text>
      </Box>
    </Box>
  );
}

export default Sidebar;
