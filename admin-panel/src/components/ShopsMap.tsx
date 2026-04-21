import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { BarbershopDTO } from '@/models/models';

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom red marker icon for shops
const shopIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface ShopsMapProps {
  shops: BarbershopDTO[];
}

// Component to fit bounds when shops change
function FitBounds({ shops }: { shops: BarbershopDTO[] }) {
  const map = useMap();

  useEffect(() => {
    if (shops.length > 0) {
      const validShops = shops.filter(s => s.latitude && s.longitude);
      if (validShops.length > 0) {
        const bounds = L.latLngBounds(
          validShops.map(s => [
            parseFloat(s.latitude!.toString()),
            parseFloat(s.longitude!.toString())
          ])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [shops, map]);

  return null;
}

export default function ShopsMap({ shops }: ShopsMapProps) {
  const validShops = shops.filter(s => s.latitude && s.longitude);

  // Default center (Pokhara, Nepal)
  const defaultCenter: [number, number] = [28.2096, 83.9856];
  const center = validShops.length > 0
    ? [
        parseFloat(validShops[0].latitude!.toString()),
        parseFloat(validShops[0].longitude!.toString())
      ] as [number, number]
    : defaultCenter;

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validShops.map((shop) => (
          <Marker
            key={shop.id}
            position={[
              parseFloat(shop.latitude!.toString()),
              parseFloat(shop.longitude!.toString())
            ]}
            icon={shopIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{shop.name}</h3>
                <p className="text-xs text-gray-600 mt-1">{shop.address}</p>
                <p className="text-xs text-gray-500">{shop.city}</p>
                {shop.rating && (
                  <p className="text-xs mt-1">
                    ⭐ {shop.rating.toFixed(1)} ({shop.reviewCount || 0} reviews)
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds shops={validShops} />
      </MapContainer>
    </div>
  );
}
