// Author: S2401265 Ahmed Aslan Ibrahim
export interface RoomDto {
  id: number;
  hotelId: number;
  hotelName: string;
  roomNumber: string;
  type: string;
  capacity: number;
  priceOffPeak: number;
  pricePeak: number;
  status: string;
  description: string;
  imageUrl?: string;
  floorNumber: number;
}

export interface RoomSearchResultItem {
  hotelId: number;
  hotelName: string;
  city: string;
  country: string;
  roomId: number;
  roomNumber: string;
  type: string;
  capacity: number;
  floorNumber: number;
  pricePerNight: number;
  description: string;
  imageUrl?: string;
}

export interface RoomSearchResponse {
  results: RoomSearchResultItem[];
  totalCount: number;
}

export interface UpdateRoomPricingDto {
  priceOffPeak: number;
  pricePeak: number;
}
