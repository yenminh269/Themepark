import { ThemeProvider, createTheme } from '@mui/material/styles';
import RideGallery from './RideGallery';

const theme = createTheme({
  palette: { mode: 'light' },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.2)',
    '0px 1px 5px rgba(0,0,0,0.2)',
    '0px 1px 8px rgba(0,0,0,0.2)',
    // add more as needed up to 24 levels
  ]
});

export default function RideGalleryWrapper() {
  return (
    <ThemeProvider theme={theme}>
      <RideGallery />
    </ThemeProvider>
  );
}
