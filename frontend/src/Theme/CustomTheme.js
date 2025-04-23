import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    body: "Helvetica, sans-serif",
    heading: "Helvetica, sans-serif",
  },
  colors: {
    brand: {
      50: "#e6f7ff",
      100: "#b3e0ff",
      200: "#80caff",
      300: "#4db3ff",
      400: "#1a9dff",
      500: "#0080e6",
      600: "#0066b3",
      700: "#004d80",
      800: "#00334d",
      900: "#001a26",
    },
    accent: {
      50: "#fff4e6",
      100: "#ffe8cc",
      200: "#ffd199",
      300: "#ffba66",
      400: "#ffa333",
      500: "#ff8c00",
      600: "#cc7000",
      700: "#995400",
      800: "#663800",
      900: "#331c00",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "500",
        borderRadius: "md",
      },
      variants: {
        primary: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
          },
        },
        secondary: {
          bg: "accent.500",
          color: "white",
          _hover: {
            bg: "accent.600",
          },
        },
      },
    },
    Table: {
      variants: {
        simple: {
          th: {
            backgroundColor: "gray.50",
            color: "gray.700",
            fontWeight: "600",
            textTransform: "uppercase",
            letterSpacing: "wider",
            fontSize: "sm",
          },
          tr: {
            _hover: {
              backgroundColor: "gray.50",
            },
          },
        },
      },
    },
    Heading: {
      baseStyle: {
        fontWeight: "600",
        color: "gray.800",
      },
    },
    Link: {
      baseStyle: {
        fontWeight: "500",
        _hover: {
          textDecoration: "none",
          color: "brand.500",
        },
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: "white",
        color: "gray.800",
      },
    },
  },
});

export default theme;
