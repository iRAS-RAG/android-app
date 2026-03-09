// types/tank.ts
export interface FishTank {
  id: string;
  name: string;
  farmName: string;
  cameraUrl: string | null;
}

export interface TankListResponse {
  data: FishTank[];
  meta: {
    totalItems: number;
    page: number;
    pageSize: number;
  };
}
