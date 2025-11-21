import { getImageUrl } from "../../../services/api";
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../admin/loading/Loading";
import { api } from "../../../services/api";

export default function RideGallery() {
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState([]);
  const navigate = useNavigate();

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

  // Only show first 5 rides
  const displayedRides = rides.slice(0, 4);

  return (
    <div>
      <ImageList
        sx={{
          width: '100%',
          height: 'auto',
          margin: 0,
        }}
        cols={2} // Fixed 2 columns per row on all screen sizes
        gap={16}
      >
        {displayedRides.map((ride) => (
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
              style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '8px' }}
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

      {/* See More Button - only show if there are more than 5 rides */}
      {rides.length > 5 && (
        <div className="!text-center !mt-6">
          <button
            onClick={() => navigate('/tickets')}
            className="!px-8 !py-3 !rounded-xl !text-lg !font-bold !bg-[#749BC2] !text-white hover:!shadow-2xl hover:!scale-105 !transition-all !border-none !shadow-lg"
          >
            See More Rides & Get Tickets
          </button>
        </div>
      )}
    </div>
  );
}
