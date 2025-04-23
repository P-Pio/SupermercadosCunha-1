import React from "react";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
  Avatar,
  Heading,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Container,
} from "@chakra-ui/react";
import { 
  HamburgerIcon, 
  CloseIcon, 
  ChevronDownIcon,
  ChevronRightIcon
} from "@chakra-ui/icons";
import { Link as RouterLink, useLocation } from "react-router-dom";

function Header() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  // Function to get page title based on current path
  const getPageTitle = (path) => {
    switch (path) {
      case "/":
        return "Página Inicial";
      case "/cadastros":
        return "Cadastros";
      case "/visualizacao-geral":
        return "Visualização Geral";
      case "/visualizacao-automatica":
        return "Visualização Automática";
      default:
        return "Página Inicial";
    }
  };

  // Generate breadcrumb items based on the current path
  const generateBreadcrumbs = () => {
    if (location.pathname === "/") return null;
    
    const pathSegments = location.pathname.split("/").filter(segment => segment);
    
    return (
      <Breadcrumb 
        spacing="8px" 
        separator={<ChevronRightIcon color="gray.500" />}
        fontSize="sm"
      >
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/">
            Início
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {pathSegments.map((segment, index) => {
          const url = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isLast = index === pathSegments.length - 1;
          
          // Format the segment for display
          const formattedSegment = segment
            .split("-")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          
          return (
            <BreadcrumbItem key={url} isCurrentPage={isLast}>
              {isLast ? (
                <Text color="gray.500">{formattedSegment}</Text>
              ) : (
                <BreadcrumbLink as={RouterLink} to={url}>
                  {formattedSegment}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </Breadcrumb>
    );
  };

  return (
    <Box
      bg={bgColor}
      px={4}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top="0"
      zIndex="sticky"
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          
          <HStack spacing={8} alignItems="center">
            <Heading
              as="h1"
              size="md"
              display={{ base: "none", md: "flex" }}
              color="brand.600"
            >
              {getPageTitle(location.pathname)}
            </Heading>
          </HStack>
          
          <Flex alignItems="center">
            <Box display={{ base: "none", md: "block" }}>
              {generateBreadcrumbs()}
            </Box>
            
            <Menu>
              <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minW={0}
                ml={4}
              >
                <Avatar
                  size="sm"
                  bg="brand.500"
                  color="white"
                  name="Admin User"
                />
              </MenuButton>
              <MenuList>
                <MenuItem>Perfil</MenuItem>
                <MenuItem>Configurações</MenuItem>
                <MenuDivider />
                <MenuItem>Sair</MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as="nav" spacing={4}>
              <RouterLink to="/">Página Inicial</RouterLink>
              <RouterLink to="/cadastros">Cadastros</RouterLink>
              <RouterLink to="/visualizacao-geral">
                Visualização Geral
              </RouterLink>
              <RouterLink to="/visualizacao-automatica">
                Visualização Automática
              </RouterLink>
            </Stack>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}

export default Header;
