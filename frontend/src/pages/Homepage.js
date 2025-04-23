import React from "react";
import { 
  Button, 
  Heading, 
  VStack, 
  Stack, 
  Text, 
  Box, 
  Container, 
  Grid, 
  GridItem, 
  Flex, 
  Image, 
  Icon,
  useColorModeValue
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

function HomePage() {
  const navigate = useNavigate();
  const bgGradient = useColorModeValue(
    "linear(to-r, brand.50, brand.100)",
    "linear(to-r, gray.800, gray.900)"
  );
  const cardBg = useColorModeValue("white", "gray.800");

  const handleNavigate = (path) => {
    navigate(path);
  };

  const features = [
    {
      title: "Visualização Geral",
      description: "Acesse e compare todos os preços cadastrados de forma rápida e organizada.",
      icon: "📊",
      path: "/visualizacao-geral",
      color: "brand.500"
    },
    {
      title: "Cadastros",
      description: "Gerencie produtos, supermercados, marcas e preços em um único lugar.",
      icon: "📝",
      path: "/cadastros",
      color: "accent.500"
    },
    {
      title: "Visualização Automática",
      description: "Obtenha insights automatizados e análises comparativas de preços.",
      icon: "🔄",
      path: "/visualizacao-automatica",
      color: "purple.500"
    }
  ];

  return (
    <Box width="100%">
      {/* Hero Section */}
      <Box 
        bgGradient={bgGradient}
        pt={10} 
        pb={20} 
        px={8}
        borderRadius="lg"
        m={4}
      >
        <Container maxW="container.xl">
          <VStack spacing={6} align="center" textAlign="center">
            <Heading as="h1" size="2xl" lineHeight="1.2" mb={4}>
              Análise de valores e cadastros para Supermercados
            </Heading>
            <Text fontSize="xl" maxW="800px" opacity="0.9">
              Gerencie, compare e visualize preços de produtos em diferentes supermercados 
              para tomar as melhores decisões de negócio.
            </Text>
            <Stack direction={["column", "row"]} spacing={4} pt={6}>
              <Button 
                size="lg" 
                variant="primary"
                px={8}
                onClick={() => handleNavigate("/visualizacao-geral")}
              >
                Visualização Geral
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                px={8}
                onClick={() => handleNavigate("/cadastros")}
              >
                Cadastros
              </Button>
            </Stack>
          </VStack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={16}>
        <Grid 
          templateColumns={["1fr", "1fr", "repeat(3, 1fr)"]} 
          gap={8}
        >
          {features.map((feature, index) => (
            <Box 
              key={index}
              bg={cardBg}
              p={8}
              borderRadius="lg"
              boxShadow="md"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "lg"
              }}
              onClick={() => handleNavigate(feature.path)}
              cursor="pointer"
            >
              <Flex 
                w="60px" 
                h="60px" 
                bg={`${feature.color}20`} 
                color={feature.color}
                borderRadius="lg"
                justify="center"
                align="center"
                mb={4}
                fontSize="3xl"
              >
                {feature.icon}
              </Flex>
              <Heading as="h3" size="lg" mb={3} color="gray.800">
                {feature.title}
              </Heading>
              <Text color="gray.600">
                {feature.description}
              </Text>
            </Box>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;
