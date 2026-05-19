// Author: S2401265 Ahmed Aslan Ibrahim
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';
import { RoomSearchComponent } from './room-search.component';
import { HotelsApiService } from '../../../core/services/hotels-api.service';
import { RoomsApiService } from '../../../core/services/rooms-api.service';

describe('RoomSearchComponent', () => {
  let component: RoomSearchComponent;
  let fixture: ComponentFixture<RoomSearchComponent>;
  let hotelsSpy: any;
  let roomsSpy: any;

  beforeEach(async () => {
    hotelsSpy = { getAll: vi.fn().mockReturnValue(of([])) };
    roomsSpy = { searchRooms: vi.fn().mockReturnValue(of({ results: [], totalCount: 0 })) };

    await TestBed.configureTestingModule({
      imports: [RoomSearchComponent, NoopAnimationsModule],
      providers: [
        provideNativeDateAdapter(),
        { provide: HotelsApiService, useValue: hotelsSpy },
        { provide: RoomsApiService, useValue: roomsSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('search() sets dateError when checkOut is not after checkIn', () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    component.searchForm.patchValue({ checkIn: today, checkOut: yesterday });
    component.search();

    expect(component.dateError()).toBeTruthy();
  });

  it('search() calls roomsApi.searchRooms with form values', () => {
    const checkIn = new Date();
    const checkOut = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    component.searchForm.patchValue({ checkIn, checkOut });

    component.search();

    expect(roomsSpy.searchRooms).toHaveBeenCalled();
  });

  it('clearFilters() resets hotelName, roomType, minPrice, maxPrice to null', () => {
    component.searchForm.patchValue({ hotelName: 'Grand Plaza', roomType: 'Deluxe', minPrice: 100, maxPrice: 500 });
    component.clearFilters();

    const v = component.searchForm.getRawValue();
    expect(v.hotelName).toBeNull();
    expect(v.roomType).toBeNull();
    expect(v.minPrice).toBeNull();
    expect(v.maxPrice).toBeNull();
  });
});
