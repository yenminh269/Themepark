import { getImageUrl } from "../../../../services/api";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useEffect } from "react";
import Loading from "../loading/Loading";
import { api } from "../../../../services/api";

export default function RideGallery() {
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        setLoading(true);
        const data = await api.getAllRides();
        setRides(data);
      } catch (err) {
        console.log('Failed to load rides. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchRide();
  }, []);

  if (loading) return <Loading isLoading={loading} />;

  return (
    <ImageList
      sx={{
        width: '100%',
        height: 'auto',
        margin: 0,
      }}
      variant="masonry" // dynamic height tiles
      cols={{ xs: 1, sm: 2, md: 3 }} // responsive columns
      gap={16}
    >
      <ImageListItem key="Subheader" cols={3}>
        <ListSubheader component="div" sx={{ color: 'text.primary' }}>
            Rides
        </ListSubheader>
      </ImageListItem>
      {rides.map((ride) => (
        <ImageListItem
          key={ride.photo_path}
          sx={{
            transition: 'transform 0.3s',
            '&:hover': { transform: 'scale(1.05)' },
            cursor: 'pointer',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <img
            src={getImageUrl(ride.photo_path)}
            srcSet={`${getImageUrl(ride.photo_path)}?dpr=2 2x`}
            alt={ride.name}
            loading="lazy"
            style={{ width: '100%', display: 'block', borderRadius: '8px' }}
          />
          <ImageListItemBar
            title={ride.name}
            subtitle={`Open: ${ride.open_time} - Close: ${ride.close_time}`}
            actionIcon={
              <IconButton
                sx={{ color: 'rgba(255, 255, 255, 0.7)' }}
                aria-label={`info about ${ride.description}`}
              >
                <InfoIcon />
              </IconButton>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}
