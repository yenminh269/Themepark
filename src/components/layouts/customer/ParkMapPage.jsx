import  { useState, useEffect } from "react";
import PageFooter from "./PageFooter";
import "./HomePage"
import { api } from "../../../services/api";
import Loading from "../admin/loading/Loading";

export default function ParkMapPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const zoneData = await api.getZoneDetails();
        setZones(zoneData);
      } catch (err) {
        console.error('Failed to load park data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Map zones with their configuration
  const zonesWithConfig = zones.map(zone => ({
    ...zone,
    emoji: "✈️",
    subtitle: "Velocity Valley Zone"
  }));

  const handleItemClick = (item, type) => {
    setSelectedItem({ ...item, itemType: type });
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  if (loading) {
    return (
      <div className="!min-h-screen !flex !items-center !justify-center !bg-gradient-to-b !from-[#EEF5FF] !to-[#B4D4FF]">
        <Loading isLoading={loading} />
      </div>
    );
  }

  const ZoneCard = ({ zone }) => {
    if (!zone) return null;

    return (
      <div className="!bg-white !rounded-xl !shadow-lg !p-6 !border-2 !border-[#176B87] hover:!shadow-2xl !transition-all">
        <div className="!text-center !mb-4">
          <div className="!text-4xl !mb-2">{zone.emoji}</div>
          <h3 className="!text-2xl !font-black !text-[#176B87] !mb-1">{zone.zone_name}</h3>
          <p className="!text-sm !text-gray-600 !italic">({zone.subtitle})</p>
        </div>

        {/* Rides Section */}
        {zone.rides && zone.rides.length > 0 && (
          <div className="!mb-4">
            <h4 className="!text-sm !font-bold !text-[#176B87] !mb-2 !uppercase">🎡 Rides</h4>
            <div className="!space-y-2">
              {zone.rides.map((ride) => (
                <button
                  key={ride.ride_id}
                  onClick={() => handleItemClick(ride, 'ride')}
                  className="!w-full !text-left !px-3 !py-2 !bg-[#EEF5FF] hover:!bg-[#B4D4FF] !rounded-lg !text-sm !transition-colors !border-none !cursor-pointer"
                >
                  <div className="!font-semibold !text-[#176B87]">{ride.name}</div>
                  <div className="!text-xs !text-gray-600">
                    {ride.open_time?.slice(0, 5)} - {ride.close_time?.slice(0, 5)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stores Section */}
        {zone.stores && zone.stores.length > 0 && (
          <div>
            <h4 className="!text-sm !font-bold !text-[#176B87] !mb-2 !uppercase">🏪 Stores</h4>
            <div className="!space-y-2">
              {zone.stores.map((store) => (
                <button
                  key={store.store_id}
                  onClick={() => handleItemClick(store, 'store')}
                  className="!w-full !text-left !px-3 !py-2 !bg-[#91C8E4]/20 hover:!bg-[#91C8E4]/40 !rounded-lg !text-sm !transition-colors !border-none !cursor-pointer"
                >
                  <div className="!font-semibold !text-[#176B87]">{store.name}</div>
                  <div className="!text-xs !text-gray-600 !capitalize">
                    {store.type?.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state if no rides or stores */}
        {(!zone.rides || zone.rides.length === 0) && (!zone.stores || zone.stores.length === 0) && (
          <div className="!text-center !text-gray-500 !italic !py-4">
            No attractions assigned yet
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="!min-h-screen !flex !flex-col !bg-gradient-to-b !from-[#EEF5FF] !to-[#B4D4FF]">
      <main className="!flex-1 !relative">
        <div className="!max-w-6xl !mx-auto !px-6 !py-6">
          {/* Header */}
          <div className="!text-center !mb-12">
            <div className="!inline-block !px-6 !py-3 !bg-[#4682A9] !rounded-full !text-white !font-semibold !mb-6 !shadow-lg">
              Explore the Park
            </div>
            <h3 className="!text-4xl md:!text-5xl !font-black !mb-4 !text-[#176B87]">
              Park Map
            </h3>
            <p className="!text-xl !text-gray-700 !max-w-2xl !mx-auto">
              Navigate through Velocity Valley's five thrilling zones. Click on any attraction to learn more!
            </p>
            <div className="!text-4xl !text-[#176B87]">[ NORTH ] ↑</div>
          </div>

          {/* ASCII-style Map Layout */}
          <div className="!space-y-8">
            {zonesWithConfig.length === 0 ? (
              <div className="!text-center !text-gray-600 !py-12">
                <p className="!text-xl">No zones configured yet. Please check back later!</p>
              </div>
            ) : (
              zonesWithConfig.map((zone, index) => (
                <div key={zone.zone_id}>
                  <div className="!flex !justify-center">
                    <div className={`!w-full ${
                      zone.zone_name === 'MAIN HUB' ? 'md:!w-3/4 !bg-[#91C8E4]/30 !rounded-2xl !p-2' :
                      (index === 0 || index === zonesWithConfig.length - 1) ? 'md:!w-2/3' : ''
                    }`}>
                      <ZoneCard zone={zone} />
                    </div>
                  </div>
                  {index < zonesWithConfig.length - 1 && (
                    <div className="!text-center !text-4xl !text-[#176B87] !my-4">↓</div>
                  )}
                </div>
              ))
            )}

            {/* Exit */}
            {zonesWithConfig.length > 0 && (
              <div className="!text-center !text-2xl !text-[#176B87] !mt-8">
                ↓<br />[ SOUTH EXIT / PARK GATES ]
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="!mt-12 !bg-white !rounded-xl !p-5 !shadow-lg">
            <h3 className="!text-xl !font-bold !text-[#176B87] !mb-4">Map Legend</h3>
            <div className="!grid md:!grid-cols-2 !gap-4 !text-sm">
              <div className="!flex !items-center !gap-2">
                <span className="!text-2xl">🎢</span>
                <span>Rides & Attractions</span>
              </div>
              <div className="!flex !items-center !gap-2">
                <span className="!text-2xl">🏪</span>
                <span>Merchandise Stores</span>
              </div>
              <div className="!flex !items-center !gap-2">
                <span className="!text-2xl">🍧</span>
                <span>Food & Beverage</span>
              </div>
              <div className="!flex !items-center !gap-2">
                <span className="!text-2xl">🏦</span>
                <span>Guest Services</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal for Item Details */}
      {selectedItem && (
        <div
          className="!fixed !inset-0 !bg-black/50 !flex !items-center !justify-center !z-50 !p-4"
          onClick={closeModal}
        >
          <div
            className="!bg-white !rounded-2xl !p-8 !max-w-lg !w-full !shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="!flex !justify-between !items-start !mb-4">
              <h2 className="!text-3xl !font-bold !text-[#176B87]">
                {selectedItem.name}
              </h2>
              <button
                onClick={closeModal}
                className="!text-gray-500 hover:!text-gray-700 !text-3xl !border-none !bg-transparent !cursor-pointer"
              >
                ×
              </button>
            </div>

            {selectedItem.itemType === 'ride' ? (
              <div className="!space-y-3">
                <div>
                  <span className="!font-bold !text-[#176B87]">Description: </span>
                  <span className="!text-gray-700">{selectedItem.description || 'An exciting attraction!'}</span>
                </div>
                <div>
                  <span className="!font-bold !text-[#176B87]">Operating Hours: </span>
                  <span className="!text-gray-700">{selectedItem.open_time.slice(0, 5)} - {selectedItem.close_time.slice(0, 5)}</span>
                </div>
                <div>
                  <span className="!font-bold !text-[#176B87]">Status: </span>
                  <span className={selectedItem.status === 'open' ? '!text-green-600' : selectedItem.status === 'closed' ? '!text-red-600' : '!text-yellow-600'}>
                    {selectedItem.status === 'open' ? '✅ Open' : selectedItem.status === 'maintenance' ? '⚠️ Maintenance' : '🔒 Closed'}
                  </span>
                </div>
                <div>
                  <span className="!font-bold !text-[#176B87]">Capacity: </span>
                  <span className="!text-gray-700">{selectedItem.capacity || 'N/A'} riders</span>
                </div>
              </div>
            ) : (
              <div className="!space-y-3">
                <div>
                  <span className="!font-bold !text-[#176B87]">Type: </span>
                  <span className="!text-gray-700 !capitalize">{selectedItem.type?.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="!font-bold !text-[#176B87]">Description: </span>
                  <span className="!text-gray-700">{selectedItem.description || 'Visit us for great products!'}</span>
                </div>
                <div>
                  <span className="!font-bold !text-[#176B87]">Status: </span>
                  <span className={selectedItem.status === 'open' ? '!text-green-600' : '!text-red-600'}>
                    {selectedItem.status === 'open' ? '✅ Open' : '🔒 Closed'}
                  </span>
                </div>
              </div>
            )}

            <div className="!mt-6 !flex !gap-3">
              {selectedItem.itemType === 'ride' && (
                <a
                  href="/tickets"
                  className="!flex-1 !px-6 !py-3 !bg-[#176B87] !text-white !font-bold !rounded-lg hover:!bg-[#0f4f66] !text-center !no-underline"
                >
                  Get Tickets
                </a>
              )}
              {selectedItem.itemType === 'store' && (
                <a
                  href={`/store/${selectedItem.store_id}`}
                  className="!flex-1 !px-6 !py-3 !bg-[#176B87] !text-white !font-bold !rounded-lg hover:!bg-[#0f4f66] !text-center !no-underline"
                >
                  Visit Store
                </a>
              )}
              <button
                onClick={closeModal}
                className="!px-6 !py-3 !bg-gray-300 !text-gray-700 !font-bold !rounded-lg hover:!bg-gray-400 !border-none !cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <PageFooter />
    </div>
  );
}
