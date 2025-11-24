import { useState, useEffect, useRef } from "react";
import { useToast } from '@chakra-ui/react';
import Input from "../../../input/Input";
import Form from "react-bootstrap/Form";
import { ScaleFade } from '@chakra-ui/react';
import "../Add.css";
import Loading from "../loading/Loading";
import { api } from '../../../../services/api';
import DataTable from '../../../data-table/DataTable';
import '../../../button/CustomButton.css';
import { RiInformation2Line } from "react-icons/ri";

function ZoneAssign() {
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [zoneName, setZoneName] = useState("");
  const [selectedZoneId, setSelectedZoneId] = useState("");
  const [selectedRideIds, setSelectedRideIds] = useState([]);
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);

  const [showZoneForm, setShowZoneForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const zoneFormRef = useRef(null);
  const assignFormRef = useRef(null);
  const [zones, setZones] = useState([]);
  const [rides, setRides] = useState([]);
  const [stores, setStores] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [showAllZones, setShowAllZones] = useState(false);
  const [showAllRides, setShowAllRides] = useState(false);
  const [showAllStores, setShowAllStores] = useState(false);
  const [showAllAssignments, setShowAllAssignments] = useState(false);
  const toast = useToast();

  const ZoneAttr = [
    'Zone ID', 'Zone Name', 'Total Assignments', 'Rides', 'Stores'
  ];
  const zoneKeys = [
    'zone_id', 'zone_name', 'total_assignments', 'ride_count', 'store_count'
  ];

  const RideAttr = [
    'Ride ID', 'Ride Name', 'Capacity', 'Status'
  ];
  const columnRideKeys = [
    'ride_id', 'name', 'capacity', 'status'
  ];

  const StoreAttr = [
    'Store ID', 'Store Name', 'Description'
  ];
  const storeKeys = [
    'store_id', 'name', 'description'
  ];

  const AssignmentAttr = [
    'Zone Name', 'Type', 'Assigned Item', 'Actions'
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  // Smooth scroll when showing zone form (only on small screens)
  useEffect(() => {
    if (showZoneForm && zoneFormRef.current && window.innerWidth < 992) {
      const timer = setTimeout(() => {
        zoneFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showZoneForm]);

  // Smooth scroll when showing assignment form (only on small screens)
  useEffect(() => {
    if (showAssignForm && assignFormRef.current && window.innerWidth < 992) {
      const timer = setTimeout(() => {
        assignFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [showAssignForm]);

  const fetchAllData = async () => {
    setInitialLoading(true);
    try {
      await Promise.all([
        fetchZones(),
        fetchRides(),
        fetchStores(),
        fetchAssignments()
      ]);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchZones = async () => {
    try {
      const data = await api.getAllZones();
      setZones(data);
    } catch (err) {
      console.error('Failed to load zones:', err);
    }
  };

  const fetchRides = async () => {
    try {
      const response = await api.getAllRides();
      setRides(response);
    } catch (err) {
      console.error('Failed to load rides:', err);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await api.getAllStores();
      setStores(response);
    } catch (err) {
      console.error('Failed to load stores:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await api.getAllZoneAssignments();
      setAssignments(response);
    } catch (err) {
      console.error('Failed to load zone assignments:', err);
    }
  };

  const formattedZoneData = zones.map(zoneObj =>
    zoneKeys.map(key => zoneObj[key] ?? '')
  );

  const formattedRideData = rides.map(rideObj =>
    columnRideKeys.map(key => rideObj[key] ?? '')
  );

  const formattedStoreData = stores.map(storeObj =>
    storeKeys.map(key => storeObj[key] ?? '')
  );


  const handleZoneSelect = (zoneId) => {
    setSelectedZoneId(zoneId);
  };

  const handleRideSelect = (rideId) => {
    setSelectedRideIds(prev => {
      if (prev.includes(rideId)) {
        return prev.filter(id => id !== rideId); // Deselect if already selected
      }
      return [...prev, rideId]; // Add to selection
    });
  };

  const handleStoreSelect = (storeId) => {
    setSelectedStoreIds(prev => {
      if (prev.includes(storeId)) {
        return prev.filter(id => id !== storeId); // Deselect if already selected
      }
      return [...prev, storeId]; // Add to selection
    });
  };

  const handleAddZone = () => {
    setShowZoneForm(true);
    setShowAssignForm(false);
  };

  const handleAddAssignment = () => {
    setShowAssignForm(true);
    setShowZoneForm(false);
  };

  const handleRemoveAssignment = async (zoneId, itemId, assignmentType) => {
    try {
      await api.removeZoneAssignment(zoneId, itemId, assignmentType);
      await fetchAssignments();
      await fetchZones();

      toast({
        title: 'Assignment Removed',
        description: 'The zone assignment has been removed successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } catch (err) {
      console.error('Error removing assignment:', err);
      toast({
        title: 'Failed to Remove Assignment',
        description: err.message || 'An error occurred while removing the assignment.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleSubmitZone = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!zoneName) {
      toast({
        title: 'Missing Information',
        description: 'Please enter a zone name!',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    try {
      setSubmitting(true);
      await api.createZone({ zone_name: zoneName });
      await fetchZones();

      toast({
        title: 'Zone Created Successfully',
        description: `Zone "${zoneName}" has been created.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });

      setShowZoneForm(false);
      setZoneName("");
    } catch (err) {
      console.error('Error creating zone:', err);
      toast({
        title: 'Failed to Create Zone',
        description: err.message || 'An error occurred while creating the zone.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();

    if (submitting) return;

    if (!selectedZoneId) {
      toast({
        title: 'Missing Information',
        description: 'Please select a zone!',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    if (selectedRideIds.length === 0 && selectedStoreIds.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please select at least one ride or store!',
        status: 'warning',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    try {
      setSubmitting(true);
      const selectedZone = zones.find(z => z.zone_id === parseInt(selectedZoneId));
      let successCount = 0;
      let failCount = 0;

      // Assign all selected rides
      for (const rideId of selectedRideIds) {
        try {
          await api.assignToZone({
            zone_id: selectedZoneId,
            ride_id: rideId,
            store_id: null,
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to assign ride ${rideId}:`, err);
          failCount++;
        }
      }

      // Assign all selected stores
      for (const storeId of selectedStoreIds) {
        try {
          await api.assignToZone({
            zone_id: selectedZoneId,
            ride_id: null,
            store_id: storeId,
          });
          successCount++;
        } catch (err) {
          console.error(`Failed to assign store ${storeId}:`, err);
          failCount++;
        }
      }

      await fetchAssignments();
      await fetchZones();

      if (successCount > 0) {
        toast({
          title: 'Assignments Created Successfully',
          description: `${successCount} item(s) assigned to ${selectedZone?.zone_name}${failCount > 0 ? `. ${failCount} failed.` : ''}`,
          status: failCount > 0 ? 'warning' : 'success',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      }

      if (failCount === 0) {
        setShowAssignForm(false);
        setSelectedZoneId("");
        setSelectedRideIds([]);
        setSelectedStoreIds([]);
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      toast({
        title: 'Failed to Create Assignment',
        description: err.message || 'An error occurred while creating the assignment.',
        status: 'error',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseZoneForm = () => {
    setShowZoneForm(false);
    setZoneName("");
  };

  const handleCloseAssignForm = () => {
    setShowAssignForm(false);
    setSelectedZoneId("");
    setSelectedRideIds([]);
    setSelectedStoreIds([]);
  };

  if (initialLoading) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold !text-[#4B5945]">Zone Management</h2>
        <div className="flex gap-2">
          {!showZoneForm && !showAssignForm && (
            <>
              <button
                onClick={handleAddZone}
                className="btn-custom !bg-[#66785F] rounded"
              > + Create New Zone
              </button>
              <button
                onClick={handleAddAssignment}
                className="btn-custom !bg-[#66785F] rounded"
              >+ Assign to Zone
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-wrap gap-4">
        {/* Left Side - Tables */}
        <div className="flex flex-col gap-4 flex-1 min-w-[400px]">
          {/* Zone Assignments Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-xl font-semibold mb-3 !text-[#3A6F43]">
              Zone Assignments ({assignments.length})
            </h3>
            {assignments.length === 0 ? (
              <div className="text-center py-8 !text-[#66785F]">
                <p>No zone assignments yet.</p>
                <p className="text-sm mt-2">Click "Assign to Zone" to add one.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full border-collapse border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        {AssignmentAttr.map((header, idx) => (
                          <th key={idx} className="border border-gray-300 py-2 text-center text-sm font-semibold">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(showAllAssignments ? assignments : assignments.slice(0, 7)).map((assignObj, rowIdx) => (
                        <tr key={rowIdx} className="hover:bg-gray-50">
                          <td className="text-center border border-gray-300  py-2 text-sm">{assignObj.zone_name}</td>
                          <td className="text-center border border-gray-300 py-2 text-sm">
                            {assignObj.assignment_type === 'Ride' ? 'Ride' : ' Store'}
                          </td>
                          <td className="text-center border border-gray-300 py-2 text-sm">
                            {assignObj.ride_name || assignObj.store_name}
                          </td>
                          <td className="text-center border border-gray-300  py-2 text-sm">
                            <button
                              onClick={() => handleRemoveAssignment(
                                assignObj.zone_id,
                                assignObj.assignment_type === 'Ride' ? assignObj.ride_id : assignObj.store_id,
                                assignObj.assignment_type
                              )}
                              className="px-3 py-1 !bg-red-500 text-white rounded hover:bg-red-700 transition-colors text-xs"
                            > Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {assignments.length > 7 && (
                  <div className="text-center mt-3">
                    <button onClick={() => setShowAllAssignments(!showAllAssignments)}
                      className="!px-5 !py-3 !bg-[#819A91] !text-white !rounded-lg font-bold border-none" >
                      {showAllAssignments ? 'Show Less' : `Show More (${assignments.length - 7} more)`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Zones Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h4 className="text-xl font-semibold !text-[#3A6F43]">Zones ({zones.length})</h4>
            <DataTable
              title=""
              columns={ZoneAttr}
              data={showAllZones ? formattedZoneData : formattedZoneData.slice(0, 7)}
              onRowSelect={handleZoneSelect}
            />
            {zones.length > 7 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAllZones(!showAllZones)}
                  className="!px-6 !py-3 !bg-[#819A91] !text-white !rounded-lg font-bold border-none">
                  {showAllZones ? 'Show Less' : `Show More (${zones.length - 7} more)`}
                </button>
              </div>
            )}
          </div>

          {/* Rides Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h4 className="text-xl font-semibold !text-[#3A6F43]">Available Rides ({rides.length})</h4>
            <DataTable
              title=""
              columns={RideAttr}
              data={showAllRides ? formattedRideData : formattedRideData.slice(0, 7)}
              onRowSelect={handleRideSelect}
            />
            {rides.length > 7 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAllRides(!showAllRides)}
                 className="!px-6 !py-3 !bg-[#819A91] !text-white !rounded-lg font-bold border-none">
                  {showAllRides ? 'Show Less' : `Show More (${rides.length - 7} more)`}
                </button>
              </div>
            )}
          </div>

          {/* Stores Table */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h4 className="text-xl font-semibold !text-[#3A6F43]">Available Stores ({stores.length})</h4>
            <DataTable
              title=""
              columns={StoreAttr}
              data={showAllStores ? formattedStoreData : formattedStoreData.slice(0, 7)}
              onRowSelect={handleStoreSelect}
            />
            {stores.length > 7 && (
              <div className="text-center">
                <button
                  onClick={() => setShowAllStores(!showAllStores)}
                className="!px-6 !py-3 !bg-[#819A91] !text-white !rounded-lg font-bold border-none">
                  {showAllStores ? 'Show Less' : `Show More (${stores.length - 7} more)`}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Forms */}
        {showZoneForm && (
          <div className="w-full md:w-[400px]" id="zone-form" ref={zoneFormRef}>
            <ScaleFade initialScale={0.9} in={showZoneForm}>
              <div className="rounded-lg p-4 shadow-lg  sticky top-4">
                <Form onSubmit={handleSubmitZone} className="space-y-4">
                  <Input
                    type="text"
                    label="Zone Name"
                    className="custom-input"
                    labelClassName="custom-form-label"
                    value={zoneName}
                    placeholder="e.g., North Section, East Wing"
                    onChange={(e) => setZoneName(e.target.value)}
                  />
                  <div className="flex gap-2 mt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="!bg-[#66785F] btn-custom flex-1 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Creating...' : 'Create New Zone'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseZoneForm}
                      disabled={submitting}
                      className="px-4 py-2 border !border-[#66785F] rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                  </div>
                </Form>
              </div>
            </ScaleFade>
          </div>
        )}

        {showAssignForm && (
          <div className="w-full md:w-[550px]" id="assignment-form" ref={assignFormRef} >
            <ScaleFade initialScale={0.9} in={showAssignForm}>
              <div className="rounded-lg p-4 shadow-[0_6px_12px_rgba(0,0,0,.15)] sticky top-4">
                <p className="flex mb-4 p-3 bg-blue-50 rounded">
                  <RiInformation2Line className="!mr-2 mt-1" /> Click on a zone, then select multiple rides and/or stores from their tables.                 </p>

                <Form onSubmit={handleSubmitAssignment} className="space-y-4" >
                  <Input
                    type="number"
                    label="Zone ID"
                    className="custom-input"
                    labelClassName="custom-form-label"
                    value={selectedZoneId}
                    placeholder="Click a zone to select"
                    readOnly
                  />

                  <div>
                    <label className="custom-form-label">Selected Rides ({selectedRideIds.length})</label>
                    {selectedRideIds.length > 0 ? (
                      <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-300 max-h-32 overflow-y-auto">
                        {selectedRideIds.map(rideId => {
                          const ride = rides.find(r => r.ride_id === rideId);
                          return (
                            <div key={rideId} className="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded">
                              <span className="text-sm pb-0">{ride?.name || `Ride ${rideId}`}</span>
                              <button
                                type="button"
                                onClick={() => handleRideSelect(rideId)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-md !text-gray-500 mt-2">Click rides in the table below to select</p>
                    )}
                  </div>

                  <div>
                    <label className="custom-form-label">Selected Stores ({selectedStoreIds.length})</label>
                    {selectedStoreIds.length > 0 ? (
                      <div className=" p-2 bg-gray-50 rounded border border-gray-300 max-h-32 overflow-y-auto">
                        {selectedStoreIds.map(storeId => {
                          const store = stores.find(s => s.store_id === storeId);
                          return (
                            <div key={storeId} className="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded">
                              <span className="text-sm pb-0">{store?.name || `Store ${storeId}`}</span>
                              <button
                                type="button"
                                onClick={() => handleStoreSelect(storeId)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Remove
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-md !text-gray-500 mt-2">Click stores in the table below to select</p>
                    )}
                  </div>

                  <div className="flex gap-2 !mt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="!bg-[#66785F] btn-custom flex-1"
                    >{submitting ? 'Assigning...' : 'Assign To Zone'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseAssignForm}
                      disabled={submitting}
                      className="px-4 py-2 border !border-[#66785F] rounded"
                    >Cancel
                    </button>
                  </div>
                </Form>
              </div>
            </ScaleFade>
          </div>
        )}
      </div>
    </div>
  );
}

export default ZoneAssign;
