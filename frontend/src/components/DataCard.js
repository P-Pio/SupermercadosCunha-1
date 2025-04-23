import React from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";

const DataCard = ({
  title,
  value,
  subtitle,
  icon,
  change,
  changeType = "increase", // 'increase' or 'decrease'
  color = "brand",
  size = "md",
  isLoading = false,
}) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue(`${color}.100`, `${color}.900`);
  const headingColor = useColorModeValue(`${color}.700`, `${color}.300`);
  const iconBg = useColorModeValue(`${color}.100`, `${color}.900`);
  const iconColor = useColorModeValue(`${color}.500`, `${color}.300`);
  
  // Determine sizes based on size prop
  const sizes = {
    sm: {
      padding: 3,
      headingSize: "sm",
      valueSize: "lg",
      iconSize: 8,
    },
    md: {
      padding: 4,
      headingSize: "md",
      valueSize: "xl",
      iconSize: 10,
    },
    lg: {
      padding: 5,
      headingSize: "md",
      valueSize: "2xl",
      iconSize: 12,
    },
  };
  
  const { padding, headingSize, valueSize, iconSize } = sizes[size] || sizes.md;
  
  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      boxShadow="sm"
      p={padding}
      borderLeft="3px solid"
      borderColor={borderColor}
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "md",
      }}
    >
      <Flex justify="space-between" align="center">
        <Box flex="1">
          <Heading
            as="h3"
            size={headingSize}
            color={headingColor}
            fontWeight="600"
            mb={2}
          >
            {title}
          </Heading>
          
          <Stat>
            <StatNumber fontSize={valueSize} fontWeight="bold">
              {value}
            </StatNumber>
            
            {subtitle && (
              <StatHelpText fontSize="sm" mt={1} mb={0}>
                {subtitle}
              </StatHelpText>
            )}
            
            {change && (
              <StatHelpText mt={2}>
                <StatArrow type={changeType} />
                {change}
              </StatHelpText>
            )}
          </Stat>
        </Box>
        
        {icon && (
          <Flex
            w={iconSize}
            h={iconSize}
            align="center"
            justify="center"
            borderRadius="full"
            bg={iconBg}
          >
            <Icon as={icon} w={iconSize / 2} h={iconSize / 2} color={iconColor} />
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default DataCard;
