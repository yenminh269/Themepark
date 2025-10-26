import { getImageUrl } from "../../../../services/api";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

export default function Ride(props) {
  // Define colors for each status
  const statusColors = {
    open: 'success',
    maintenance: 'warning',
    closed: 'error'
  };

  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component="img"
          height="140"
          image={getImageUrl(props.photo_path)}
          alt={props.name || 'Ride photo'}
        />
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <Typography gutterBottom variant="h5">
              {props.name}
            </Typography>
            {props.status && (
              <Chip
                label={props.status}
                color={statusColors[props.status.toLowerCase()] || 'default'}
                size="small"
              />
            )}
          </Stack>
          <Typography variant="body2" color="text.secondary" mb={0.5}>
            {props.description}
          </Typography>
          {props.price && <Typography variant="body2">Price: ${props.price}</Typography>}
          {props.open_time && <Typography variant="body2">Open: {props.open_time}</Typography>}
          {props.close_time && <Typography variant="body2">Close: {props.close_time}</Typography>}
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
