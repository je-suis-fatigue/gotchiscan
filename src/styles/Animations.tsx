import { keyframes } from "@chakra-ui/react";

const animationKeyframes = keyframes`
  0% { opacity: 0;}
  50% { opacity: 40;}
  100% { opacity: 100;}
`;

export const fadeIn = `${animationKeyframes} 0.3s ease-in`;