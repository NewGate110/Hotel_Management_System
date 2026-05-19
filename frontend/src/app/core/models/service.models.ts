// Author: S2401265 Ahmed Aslan Ibrahim
export interface AncillaryServiceDto {
  id: number;
  name: string;
  description: string;
  fee: number;
  unit: string;
}

export interface BookingServiceDto {
  serviceId: number;
  serviceName: string;
  quantity: number;
  serviceDate: string;
  totalFee: number;
}
