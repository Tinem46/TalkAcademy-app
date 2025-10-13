import { ImageSourcePropType } from 'react-native';

// Định nghĩa các loại mascot có sẵn
export type MascotType = 
  | 'default' 
  | 'logoFB' 
  | 'longlanh' 
  | 'omg' 
  | 'talking' 
  | 'logoDoc' 
  | 'logoNgang' 
  | 'talkademy';

// Định nghĩa cấu hình cho từng mascot
export interface MascotConfig {
  source: ImageSourcePropType;
  name: string;
  description?: string;
  defaultSize?: {
    width: number;
    height: number;
  };
  defaultPosition?: {
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  };
  recommendedBubbleColor?: {
    bgColor: string;
    borderColor: string;
  };
}

// Danh sách các mascot có sẵn
export const MASCOT_ASSETS: Record<MascotType, MascotConfig> = {
  default: {
    source: require('@/assets/Mascot/mascot Talkademy-01.png'),
    name: 'Mascot Mặc Định',
    description: 'Mascot chính của ứng dụng',
    defaultSize: { width: 300, height: 300 },
    defaultPosition: { left: 8, bottom: 200 },
    recommendedBubbleColor: {
      bgColor: '#E8F4FD',
      borderColor: '#64B5F6'
    }
  },
  logoFB: {
    source: require('@/assets/Mascot/Asset1logoFB.png'),
    name: 'Logo Facebook',
    description: 'Mascot với logo Facebook',
    defaultSize: { width: 250, height: 250 },
    defaultPosition: { left: 10, bottom: 180 },
    recommendedBubbleColor: {
      bgColor: '#E3F2FD',
      borderColor: '#1976D2'
    }
  },
  longlanh: {
    source: require('@/assets/Mascot/Asset 1longlanh.png'),
    name: 'Mascot Long Lanh',
    description: 'Mascot với ánh mắt long lanh',
    defaultSize: { width: 280, height: 280 },
    defaultPosition: { left: 5, bottom: 190 },
    recommendedBubbleColor: {
      bgColor: '#FFF3E0',
      borderColor: '#FF9800'
    }
  },
  omg: {
    source: require('@/assets/Mascot/Asset 2omg.png'),
    name: 'Mascot OMG',
    description: 'Mascot biểu cảm ngạc nhiên',
    defaultSize: { width: 260, height: 260 },
    defaultPosition: { left: 12, bottom: 200 },
    recommendedBubbleColor: {
      bgColor: '#E8F5E8',
      borderColor: '#4CAF50'
    }
  },
  talking: {
    source: require('@/assets/Mascot/Asset 3talking.png'),
    name: 'Mascot Đang Nói',
    description: 'Mascot trong trạng thái đang nói',
    defaultSize: { width: 270, height: 270 },
    defaultPosition: { left: 8, bottom: 195 },
    recommendedBubbleColor: {
      bgColor: '#F3E5F5',
      borderColor: '#9C27B0'
    }
  },
  logoDoc: {
    source: require('@/assets/Mascot/logo.png'),
    name: 'Logo Dọc',
    description: 'Logo ứng dụng định dạng dọc',
    defaultSize: { width: 200, height: 300 },
    defaultPosition: { left: 15, bottom: 150 },
    recommendedBubbleColor: {
      bgColor: '#E1F5FE',
      borderColor: '#03A9F4'
    }
  },
  logoNgang: {
    source: require('@/assets/Mascot/exe logo ngang-01.png'),
    name: 'Logo Ngang',
    description: 'Logo ứng dụng định dạng ngang',
    defaultSize: { width: 300, height: 150 },
    defaultPosition: { left: 5, bottom: 220 },
    recommendedBubbleColor: {
      bgColor: '#E8F4FD',
      borderColor: '#2196F3'
    }
  },
  talkademy: {
    source: require('@/assets/Mascot/mascot Talkademy-01.png'),
    name: 'Talkademy Mascot',
    description: 'Mascot chính thức của Talkademy',
    defaultSize: { width: 300, height: 300 },
    defaultPosition: { left: 8, bottom: 200 },
    recommendedBubbleColor: {
      bgColor: '#E8F4FD',
      borderColor: '#64B5F6'
    }
  }
};

// Hook để quản lý mascot
export const useMascotManager = () => {
  // Lấy danh sách tất cả mascot
  const getAllMascots = (): MascotConfig[] => {
    return Object.values(MASCOT_ASSETS);
  };

  // Lấy mascot theo type
  const getMascotByType = (type: MascotType): MascotConfig => {
    return MASCOT_ASSETS[type];
  };

  // Lấy mascot ngẫu nhiên
  const getRandomMascot = (): { type: MascotType; config: MascotConfig } => {
    const types = Object.keys(MASCOT_ASSETS) as MascotType[];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return {
      type: randomType,
      config: MASCOT_ASSETS[randomType]
    };
  };

  // Lấy mascot theo tên
  const getMascotByName = (name: string): { type: MascotType; config: MascotConfig } | null => {
    const entry = Object.entries(MASCOT_ASSETS).find(
      ([_, config]) => config.name.toLowerCase().includes(name.toLowerCase())
    );
    
    if (entry) {
      return {
        type: entry[0] as MascotType,
        config: entry[1]
      };
    }
    
    return null;
  };

  return {
    getAllMascots,
    getMascotByType,
    getRandomMascot,
    getMascotByName,
    MASCOT_ASSETS
  };
};

// Export default object chứa tất cả các function và constants
const MascotManager = {
  MASCOT_ASSETS,
  useMascotManager,
};

export default MascotManager;