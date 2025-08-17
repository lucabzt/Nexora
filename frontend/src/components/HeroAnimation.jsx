import { Box, createStyles, keyframes, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';



// Define the keyframes for our animations
const orbit = keyframes({
  '0%': { transform: 'rotate(0deg) translateX(120px) rotate(0deg)' },
  '100%': { transform: 'rotate(360deg) translateX(120px) rotate(-360deg)' },
});

const orbit2 = keyframes({
  '0%': { transform: 'rotate(0deg) translateX(80px) rotate(0deg)' },
  '100%': { transform: 'rotate(-360deg) translateX(80px) rotate(360deg)' },
});

const orbit3 = keyframes({
  '0%': { transform: 'rotate(0deg) translateX(160px) rotate(0deg)' },
  '100%': { transform: 'rotate(360deg) translateX(160px) rotate(-360deg)' },
});

const pulseGlow = keyframes({
  '0%, 100%': { boxShadow: '0 0 20px 5px rgba(0, 199, 181, 0.4)' },
  '50%': { boxShadow: '0 0 35px 12px rgba(0, 199, 181, 0.2)' },
});


// Define the styles for the animation elements
const useStyles = createStyles((theme) => ({

  container: {
    position: 'relative',
    width: 350,
    height: 350,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    [theme.fn.smallerThan('lg')]: {
      width: 300,
      height: 300,
    },
    [theme.fn.smallerThan('sm')]: {
      width: 250,
      height: 250,
    },
  },

  centralCore: {
    width: 70,
    height: 70,
    borderRadius: '50%',
    background: theme.fn.linearGradient(45, theme.colors.teal[7], theme.colors.cyan[6]),
    animation: `${pulseGlow} ${useMediaQuery('(max-width: 768px)') ? '12s' : '4s'} ease-in-out infinite`,
    position: 'relative',
    zIndex: 1,
  },
  
  // Base style for the invisible path the satellites will follow
  orbitPath: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 1,
    height: 1,
    borderRadius: '50%',
  },

  // The visible satellite dot
  satellite: {
    position: 'absolute',
    top: -6,
    left: -6,
    width: 12,
    height: 12,
    borderRadius: '50%',
    background: theme.colors.cyan[4],
  },
  
  // Specific animation assignments for each path
  path1: {
    animation: `${orbit} ${useMediaQuery('(max-width: 768px)') ? '30s' : '10s'} linear infinite`,
  },
  path2: {
    animation: `${orbit2} ${useMediaQuery('(max-width: 768px)') ? '20s' : '8s'} linear infinite`,
  },
  path3: {
    animation: `${orbit3} ${useMediaQuery('(max-width: 768px)') ? '40s' : '15s'} linear infinite`,
  },
}));

export function HeroAnimation() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { classes } = useStyles({ isMobile });
  const theme = useMantineTheme();


  return (
    <Box className={classes.container}>
      <Box className={classes.centralCore} />

      <Box className={`${classes.orbitPath} ${classes.path1}`}>
        <Box className={classes.satellite} />
      </Box>

      <Box className={`${classes.orbitPath} ${classes.path2}`}>
        <Box className={classes.satellite} style={{ width: 8, height: 8, top: -4, left: -4, background: '#fff' }} />
      </Box>

      <Box className={`${classes.orbitPath} ${classes.path3}`}>
        <Box className={classes.satellite} style={{ width: 16, height: 16, top: -8, left: -8, background: theme.colors.teal[3] }} />
      </Box>
    </Box>
  );
}

export default HeroAnimation;