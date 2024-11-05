import { Box, Link, Stack, useColorModeValue } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

function Sidebar() {
  return (
    <Box
      bg={useColorModeValue("gray.100", "gray.900")}
      w="250px"
      p="5"
      h="100vh"
      boxShadow="md"
    >
      <Stack spacing="5">
        <Link as={RouterLink} to="/">
          Home Page
        </Link>
        <Link as={RouterLink} to="/cadastros">
          Cadastros
        </Link>
        <Link as={RouterLink} to="/visualizacao-geral">
          Visualização Geral
        </Link>
      </Stack>
    </Box>
  );
}

export default Sidebar;
