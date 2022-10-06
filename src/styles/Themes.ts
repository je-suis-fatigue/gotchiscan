import { ComponentStyleConfig, extendTheme } from '@chakra-ui/react';

export const dashThemes = extendTheme({
  // fonts: {
  // },

  textStyles:{
    identifier: {
      textColor: 'mainUi.warm',
      fontWeight: 'bold',
      fontSize: 'x-small',
      textAlign: 'center',
    },
    alternate: {
      textColor: 'mainUi.light',
      fontWeight: 'semibold',
      fontSize: 'sm',
      textAlign: 'center'
    }
  },
  colors: {
    mainUi: {
      warm: "#D57A66",
      dark: "#262322",
      light: "#FCDDF2",
      warmDark: "#2e2726",
      darker: "#131515",
      ggMagenta: "#FA34F3",
      ggIndigo: "#6B25E7"
    },
  },
  components: {
    Text: {
      variants: {
        identifier: {
          textColor: 'mainUi.warm',
          fontWeight: 'bold',
          fontSize: 'x-small',
          textAlign: 'center',
        },
        alternate: {
          textColor: 'mainUi.light',
          fontWeight: 'semibold',
          fontSize: 'sm',
          textAlign: 'center'
        }
      }
    },
    Tooltip: {
      variants: {
        dash: {
          color: 'mainUi.warm',
          fontWeight: 'bold',
          fontSize: 'x-small',
          bg:'mainUi.warmDark',
          textAlign: 'center',
          rounded: 'none',
          border: '1px',
          borderColor: 'mainUi.dark',
          role: 'group'
        }
      }
    },
    Button: {
      variants: {
        dash: {
          color: 'mainUi.warm',
          bg: '',
          _hover: {
            color: 'mainUi.light',
          },
          _focus: {
            borderColor: '',
            boxShadow: ''
          }
        },
        sort: {
          variant: 'dash',
          size:'xs',
          padding:'4px',
          h:'fit-content',
          rounded:'sm',
          border:'1px',
          borderColor:'mainUi.darker',
          _active: {
            color: 'mainUi.light'
          },
          _focus: {
            borderColor: '',
            boxShadow: ''
          }
        }
      }
    }
  }
})

