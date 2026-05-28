import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink, RouterLinkActive } from '@angular/router';

import * as L from 'leaflet';
import { Maps } from '../../services/maps';
@Component({
  selector: 'app-recycling-centers',

  standalone: true,

  imports: [CommonModule, RouterLink, RouterLinkActive],

  templateUrl: './recycling-centers.html',

  styleUrl: './recycling-centers.css',
})
export class RecyclingCenters implements OnInit {
  scrollToNearby() {
    const section = document.getElementById('nearby-centers-section');

    section?.scrollIntoView({
      behavior: 'smooth',
    });
  }
  map!: L.Map;

  routeLine!: L.Polyline;

  userMarker!: L.Marker;

  userLat!: number;

  userLng!: number;

  currentFilter = 'All';

  locationStatus = 'GPS Not Enabled';

  allMarkers: any[] = [];

  // ===================================
  // ICONS
  // ===================================

  ewasteIcon = L.icon({
    iconUrl: 'markers/blue-gps.png',

    iconSize: [42, 42],

    iconAnchor: [21, 42],

    popupAnchor: [0, -35],
  });

  organicIcon = L.icon({
    iconUrl: 'markers/red-gps.png',

    iconSize: [42, 42],

    iconAnchor: [21, 42],

    popupAnchor: [0, -35],
  });

  scrapIcon = L.icon({
    iconUrl: 'markers/black-gps.png',

    iconSize: [42, 42],

    iconAnchor: [21, 42],

    popupAnchor: [0, -35],
  });

  plasticIcon = L.icon({
    iconUrl: 'markers/green-gps.png',

    iconSize: [42, 42],

    iconAnchor: [21, 42],

    popupAnchor: [0, -35],
  });

  userLocationIcon = L.icon({
    iconUrl: 'markers/your-location-gps.png',

    iconSize: [52, 52],

    iconAnchor: [26, 52],

    popupAnchor: [0, -45],
  });

  // ===================================
  // CENTER CARDS
  // ===================================

  centers: any[] = [];

  constructor(private mapsService: Maps) {}

  // ===================================
  // INIT
  // ===================================

  ngOnInit() {
    this.mapsService.getCenters().subscribe({
        next: (data) => {
            this.centers = data.map((c: any) => ({
                ...c,
                distance: 'Enable GPS'
            }));
            this.initMap();
        },
        error: (err) => console.error(err)
    });

    navigator.permissions
      .query({
        name: 'geolocation',
      } as PermissionDescriptor)

      .then((permission) => {
        if (permission.state === 'granted') {
          this.locationStatus = 'GPS Enabled';
        }
      });
  }

  // ===================================
  // INIT MAP
  // ===================================

  initMap() {
    this.map = L.map('map').setView([22.9734, 78.6569], 5);

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

      {
        attribution: '© OpenStreetMap',
      },
    ).addTo(this.map);

    // ===================================
    // E-WASTE MARKERS
    // ===================================

    this.addMarker(28.6139, 77.209, 'E-Waste', 'Delhi E-Waste', this.ewasteIcon);

    this.addMarker(26.9124, 75.7873, 'E-Waste', 'Jaipur E-Waste', this.ewasteIcon);

    this.addMarker(17.385, 78.4867, 'E-Waste', 'Hyderabad E-Waste', this.ewasteIcon);

    this.addMarker(21.1458, 79.0882, 'E-Waste', 'Nagpur E-Waste', this.ewasteIcon);

    this.addMarker(30.7333, 76.7794, 'E-Waste', 'Chandigarh E-Waste', this.ewasteIcon);

    this.addMarker(25.5941, 85.1376, 'E-Waste', 'Patna E-Waste', this.ewasteIcon);

    this.addMarker(23.0225, 72.5714, 'E-Waste', 'Ahmedabad E-Waste', this.ewasteIcon);

    this.addMarker(11.0168, 76.9558, 'E-Waste', 'Coimbatore E-Waste', this.ewasteIcon);

    this.addMarker(15.2993, 74.124, 'E-Waste', 'Goa E-Waste', this.ewasteIcon);

    this.addMarker(24.5854, 73.7125, 'E-Waste', 'Udaipur E-Waste', this.ewasteIcon);

    // ===================================
    // PLASTIC MARKERS
    // ===================================

    this.addMarker(19.076, 72.8777, 'Plastic', 'Mumbai Plastic', this.plasticIcon);

    this.addMarker(18.5204, 73.8567, 'Plastic', 'Pune Plastic', this.plasticIcon);

    this.addMarker(12.9716, 77.5946, 'Plastic', 'Bangalore Plastic', this.plasticIcon);

    this.addMarker(9.9312, 76.2673, 'Plastic', 'Kochi Plastic', this.plasticIcon);

    this.addMarker(26.8467, 80.9462, 'Plastic', 'Lucknow Plastic', this.plasticIcon);

    this.addMarker(23.2599, 77.4126, 'Plastic', 'Bhopal Plastic', this.plasticIcon);

    this.addMarker(32.7266, 74.857, 'Plastic', 'Jammu Plastic', this.plasticIcon);

    this.addMarker(27.1767, 78.0081, 'Plastic', 'Agra Plastic', this.plasticIcon);

    this.addMarker(31.1048, 77.1734, 'Plastic', 'Shimla Plastic', this.plasticIcon);

    this.addMarker(16.5062, 80.648, 'Plastic', 'Vijayawada Plastic', this.plasticIcon);

    // ===================================
    // ORGANIC MARKERS
    // ===================================

    this.addMarker(13.0827, 80.2707, 'Organic', 'Chennai Organic', this.organicIcon);

    this.addMarker(8.5241, 76.9366, 'Organic', 'Trivandrum Organic', this.organicIcon);

    this.addMarker(10.8505, 76.2711, 'Organic', 'Kerala Organic', this.organicIcon);

    this.addMarker(17.6868, 83.2185, 'Organic', 'Vizag Organic', this.organicIcon);

    this.addMarker(11.2588, 75.7804, 'Organic', 'Kozhikode Organic', this.organicIcon);

    this.addMarker(14.4673, 78.8242, 'Organic', 'Kadapa Organic', this.organicIcon);

    this.addMarker(18.1124, 79.0193, 'Organic', 'Warangal Organic', this.organicIcon);

    this.addMarker(15.8281, 78.0373, 'Organic', 'Kurnool Organic', this.organicIcon);

    this.addMarker(13.6288, 79.4192, 'Organic', 'Tirupati Organic', this.organicIcon);

    this.addMarker(11.6643, 78.146, 'Organic', 'Salem Organic', this.organicIcon);

    // ===================================
    // SCRAP MARKERS
    // ===================================

    this.addMarker(22.5726, 88.3639, 'Scrap', 'Kolkata Scrap', this.scrapIcon);

    this.addMarker(25.3176, 82.9739, 'Scrap', 'Varanasi Scrap', this.scrapIcon);

    this.addMarker(23.3441, 85.3096, 'Scrap', 'Ranchi Scrap', this.scrapIcon);

    this.addMarker(26.1445, 91.7362, 'Scrap', 'Guwahati Scrap', this.scrapIcon);

    this.addMarker(20.2961, 85.8245, 'Scrap', 'Bhubaneswar Scrap', this.scrapIcon);

    this.addMarker(24.817, 93.9368, 'Scrap', 'Imphal Scrap', this.scrapIcon);

    this.addMarker(27.0844, 93.6053, 'Scrap', 'Itanagar Scrap', this.scrapIcon);

    this.addMarker(25.5788, 91.8933, 'Scrap', 'Shillong Scrap', this.scrapIcon);

    this.addMarker(23.8315, 91.2868, 'Scrap', 'Agartala Scrap', this.scrapIcon);

    this.addMarker(25.6747, 94.11, 'Scrap', 'Kohima Scrap', this.scrapIcon);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 500);
  }

  // ===================================
  // ADD MARKER
  // ===================================

  addMarker(lat: number, lng: number, type: string, popup: string, icon: L.Icon) {
    const marker = L.marker(
      [lat, lng],

      {
        icon: icon,
      },
    )

      .addTo(this.map)

      .bindPopup(popup);

    this.allMarkers.push({
      marker,
      type,
      lat,
      lng,
      popup,
    });
  }

  // ===================================
  // FILTER MARKERS
  // ===================================

  filterMarkers(type: string) {
    this.currentFilter = type;

    // REMOVE ROUTE

    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
    }

    this.allMarkers.forEach((item) => {
      if (type === 'All' || item.type === type) {
        item.marker.addTo(this.map);
      } else {
        this.map.removeLayer(item.marker);
      }
    });

    if (this.userMarker) {
      this.userMarker.addTo(this.map);
    }
  }

  // ===================================
  // GET USER LOCATION
  // ===================================

  getUserLocation() {
    navigator.geolocation.getCurrentPosition((position) => {
      this.userLat = position.coords.latitude;

      this.userLng = position.coords.longitude;

      this.locationStatus = 'GPS Enabled';

      this.map.setView([this.userLat, this.userLng], 7);

      if (this.userMarker) {
        this.map.removeLayer(this.userMarker);
      }

      this.userMarker = L.marker(
        [this.userLat, this.userLng],

        {
          icon: this.userLocationIcon,
        },
      )

        .addTo(this.map)

        .bindPopup('Your Location')

        .openPopup();

      // CALCULATE DISTANCES

      this.centers.forEach((center) => {
        const distance = this.calculateDistance(
          this.userLat,
          this.userLng,

          center.lat,
          center.lng,
        );

        center.distance = `${distance.toFixed(1)} km away`;
      });
    });
  }

  // ===================================
  // DISTANCE FORMULA
  // ===================================

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;

    const dLat = this.toRad(lat2 - lat1);

    const dLon = this.toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
      2 *
      Math.atan2(
        Math.sqrt(a),

        Math.sqrt(1 - a),
      );

    return R * c;
  }

  toRad(value: number) {
    return (value * Math.PI) / 180;
  }

  // ===================================
  // OPEN DIRECTIONS
  // ===================================

  openDirections(center: any) {
    if (!this.userLat || !this.userLng) {
      alert('Enable GPS First');

      return;
    }

    // REMOVE OLD ROUTE

    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
    }

    // HIDE ALL MARKERS

    this.allMarkers.forEach((item) => {
      this.map.removeLayer(item.marker);
    });

    // FIND TARGET MARKER

    const targetMarker = this.allMarkers.find(
      (item) => item.lat === center.lat && item.lng === center.lng,
    );

    // SHOW TARGET MARKER

    if (targetMarker) {
      targetMarker.marker
        .addTo(this.map)

        .openPopup();
    }

    // SHOW USER MARKER

    this.userMarker.addTo(this.map);

    // DRAW ROUTE

    this.routeLine = L.polyline(
      [
        [this.userLat, this.userLng],

        [center.lat, center.lng],
      ],

      {
        color: '#67e8a5',

        weight: 5,

        opacity: 1,
      },
    ).addTo(this.map);

    // ZOOM TO ROUTE

    this.map.fitBounds(
      this.routeLine.getBounds(),

      {
        padding: [80, 80],
      },
    );
  }
}
