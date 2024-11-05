import React from "react";
import { Button, Heading, VStack, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; // Import useNavigate

function HomePage() {
  const navigate = useNavigate(); // Use useNavigate instead of useHistory

  const handleNavigate = (path) => {
    navigate(path); // Use navigate() to change routes
  };

  return (
    <VStack spacing={4} align="center" justify="center" height="100vh">
      <Heading as="h1" size="xl" textAlign="center">
        Análise de valores e cadastros gerais para mercados/Supermercados
      </Heading>
      <Stack direction="column" spacing={4} align="center">
        <Button
          colorScheme="teal"
          size="lg"
          mb={4}
          onClick={() => handleNavigate("/visualizacao-geral")}
        >
          Visualização Geral
        </Button>
        <Button
          colorScheme="orange"
          size="lg"
          onClick={() => handleNavigate("/cadastros")}
        >
          Cadastros
        </Button>
      </Stack>
    </VStack>
  );
}

export default HomePage;
