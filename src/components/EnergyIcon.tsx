import React from 'react';
    
    interface EnergyIconProps {
      energy: 'fuoco' | 'terra' | 'acqua' | 'elettro' | 'normale' | 'erba' | 'oscurità' | 'lotta' | 'acciaio' | 'psico';
    }
    
    export const EnergyIcon: React.FC<EnergyIconProps> = ({ energy }) => {
      const energyMap = {
        fuoco: '/icons/fuoco.png',
        terra: '/icons/terra.png',
        acqua: '/icons/acqua.png',
        elettro: '/icons/elettro.png',
        normale: '/icons/normale.png',
        erba: '/icons/erba.png',
        oscurità: '/icons/oscurità.png',
        lotta: '/icons/lotta.png',
        acciaio: '/icons/acciaio.png',
        psico: '/icons/psico.png',
      };
      return <img src={energyMap[energy]} alt={energy} className="h-8 w-8 inline" />;
    };
