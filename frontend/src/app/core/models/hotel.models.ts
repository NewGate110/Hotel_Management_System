// Author: S2401265 Ahmed Aslan Ibrahim
export interface HotelSummaryDto {
  id: number;
  name: string;
  city: string;
  country: string;
  imageUrl?: string;
}

export interface HotelDto {
  id: number;
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface UpdateHotelDto {
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export interface CreateHotelDto {
  name: string;
  city: string;
  country: string;
  address: string;
  phone: string;
  email: string;
  imageUrl?: string;
}
