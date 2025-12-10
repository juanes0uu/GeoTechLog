import React, { useState, useEffect } from 'react';
import { 
  Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip,
  Box, CircularProgress, Alert, Button,
  IconButton, Tooltip, Avatar
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CircleIcon from '@mui/icons-material/Circle';

interface VisitorInfo {
  userId: string;
  name: string;
  email: string;
  dbUserId?: string;
  positions: [number, number][];
  lastUpdate: Date;
  active: boolean;
}

interface UserStatusPanelProps {
  visitors: Record<string, VisitorInfo>;
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  onSelectVisitor?: (userId: string) => void;
  selectedUserId?: string;
}

const UserStatusPanel: React.FC<UserStatusPanelProps> = ({
  visitors,
  loading = false,
  error = '',
  onRefresh,
  onSelectVisitor,
  selectedUserId
}) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Formatear fecha
  const formatFecha = (fecha: Date) => {
    return fecha.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Calcular tiempo desde última actualización
  const getTimeSinceUpdate = (lastUpdate: Date) => {
    const diffMs = new Date().getTime() - lastUpdate.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
      return `Hace ${diffSec} seg`;
    } else if (diffSec < 3600) {
      return `Hace ${Math.floor(diffSec / 60)} min`;
    } else {
      return `Hace ${Math.floor(diffSec / 3600)} horas`;
    }
  };

  // Obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Contar usuarios activos
  const activeCount = Object.values(visitors).filter(v => v.active).length;

  // Actualizar timestamp cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading && Object.keys(visitors).length === 0) {
    return (
      <Paper sx={{ 
        height: '100%',
        display: 'flex', 
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden'
      }}>
        <Box sx={{ p: 3, textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <CircularProgress size={40} />
          <Typography sx={{ mt: 2, color: 'text.secondary' }}>
            Cargando visitantes...
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 2,
      overflow: 'hidden',
      boxShadow: 2
    }}>
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        bgcolor: '#1976d2', 
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          <PersonIcon />
          <Typography variant="h6" fontWeight="bold">
            Visitantes Conectados
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Chip 
            label={`${activeCount}/${Object.keys(visitors).length}`}
            size="small"
            sx={{ 
              color: 'white', 
              bgcolor: 'rgba(255,255,255,0.3)',
              fontWeight: 'bold'
            }}
          />
          <Tooltip title="Actualizar">
            <IconButton 
              size="small" 
              onClick={onRefresh}
              disabled={loading}
              sx={{ color: 'white' }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Contenido */}
      <Box sx={{ 
        p: 2, 
        flex: 1, 
        overflow: 'auto',
        bgcolor: '#fafafa'
      }}>
        {error ? (
          <Alert 
            severity="error"
            sx={{ mb: 2 }}
            action={
              <Button size="small" onClick={onRefresh} color="inherit">
                Reintentar
              </Button>
            }
          >
            {error}
          </Alert>
        ) : Object.keys(visitors).length === 0 ? (
          <Box textAlign="center" py={4}>
            <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography color="text.secondary">
              No hay visitantes conectados
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Los visitantes aparecerán aquí cuando inicien sesión
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell width="40px"></TableCell>
                  <TableCell><strong>Visitante</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Puntos</strong></TableCell>
                  <TableCell width="80px"><strong>Acciones</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.entries(visitors).map(([userId, visitor]) => (
                  <TableRow 
                    key={userId}
                    sx={{ 
                      bgcolor: selectedUserId === userId ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' },
                      cursor: 'pointer'
                    }}
                    onClick={() => onSelectVisitor && onSelectVisitor(userId)}
                  >
                    <TableCell>
                      <Avatar 
                        sx={{ 
                          width: 32, 
                          height: 32,
                          bgcolor: visitor.active ? '#4caf50' : '#f44336',
                          fontSize: '0.8rem'
                        }}
                      >
                        {getInitials(visitor.name)}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {visitor.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {visitor.email || 'Sin email'}
                        </Typography>
                        {visitor.dbUserId && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            ID: {visitor.dbUserId}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <CircleIcon 
                          sx={{ 
                            fontSize: 10,
                            color: visitor.active ? '#4caf50' : '#f44336'
                          }} 
                        />
                        <Typography variant="body2">
                          {visitor.active ? '🟢 Conectado' : '🔴 Desconectado'}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {getTimeSinceUpdate(visitor.lastUpdate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={visitor.positions.length}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Ver en mapa">
                        <IconButton 
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectVisitor && onSelectVisitor(userId);
                          }}
                          color={selectedUserId === userId ? "primary" : "default"}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Última ubicación">
                        <IconButton 
                          size="small"
                          disabled={visitor.positions.length === 0}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Aquí podrías centrar el mapa en la última ubicación
                          }}
                        >
                          <LocationOnIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ 
        p: 1.5, 
        bgcolor: 'grey.100', 
        borderTop: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="caption" color="text.secondary">
          Actualizado: {formatFecha(lastUpdate)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {activeCount} activos
        </Typography>
      </Box>
    </Paper>
  );
};

export default UserStatusPanel;