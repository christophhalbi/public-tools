import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Plus, Trash2, Calculator } from 'lucide-react';

const StromverbrauchTracker = () => {
  const [devices, setDevices] = useState([
    { id: 1, name: 'Kühlschrank 1', power: 150, operatingHours: 24 },
    { id: 2, name: 'Kühlschrank 2', power: 140, operatingHours: 24 },
    { id: 3, name: 'Tiefkühler', power: 200, operatingHours: 24 },
    { id: 8, name: 'WLAN-Router', power: 12, operatingHours: 24 },
    { id: 4, name: 'Fernseher 1', power: 120, operatingHours: 6 },
    { id: 5, name: 'Fernseher 2', power: 80, operatingHours: 4 },
    { id: 6, name: 'Wäschetrockner', power: 2500, operatingHours: 2 },
    { id: 7, name: 'Waschmaschine', power: 2000, operatingHours: 1.5 },
    { id: 10, name: 'Herd und Ofen', power: 3000, operatingHours: 1.5 },
    { id: 9, name: 'Geschirrspüler', power: 1800, operatingHours: 1 }
  ]);

  const [newDevice, setNewDevice] = useState({
    name: '',
    power: '',
    operatingHours: ''
  });

  const addDevice = () => {
    if (newDevice.name && newDevice.power && newDevice.operatingHours) {
      setDevices([...devices, {
        id: Math.max(...devices.map(d => d.id)) + 1,
        name: newDevice.name,
        power: parseFloat(newDevice.power),
        operatingHours: parseFloat(newDevice.operatingHours)
      }]);
      setNewDevice({ name: '', power: '', operatingHours: '' });
    }
  };

  const removeDevice = (id) => {
    setDevices(devices.filter(d => d.id !== id));
  };

  const updateDevice = (id, field, value) => {
    setDevices(devices.map(d => 
      d.id === id ? { ...d, [field]: field === 'name' ? value : parseFloat(value) || 0 } : d
    ));
  };

  const calculateConsumption = (power, hours) => {
    return (power * hours / 1000).toFixed(2); // kWh per day
  };

  const calculateCosts = (power, hours, price) => {
    const consumption = power * hours / 1000;
    return (consumption * price).toFixed(2); // Euro per day
  };

  const totalConsumption = devices.reduce((sum, d) => sum + (d.power * d.operatingHours / 1000), 0);

  const exportToExcel = () => {
    const data = devices.map(device => ({
      'Gerät': device.name,
      'Leistung (Watt)': device.power,
      'Betriebsstunden/Tag': device.operatingHours,
      'Verbrauch (kWh/Tag)': calculateConsumption(device.power, device.operatingHours),
      'Verbrauch (kWh/Monat)': (calculateConsumption(device.power, device.operatingHours) * 30).toFixed(2),
      'Verbrauch (kWh/Jahr)': (calculateConsumption(device.power, device.operatingHours) * 365).toFixed(2)
    }));

    // Add summary
    data.push({});
    data.push({
      'Gerät': 'GESAMT',
      'Leistung (Watt)': devices.reduce((sum, d) => sum + d.power, 0),
      'Betriebsstunden/Tag': '',
      'Verbrauch (kWh/Tag)': totalConsumption.toFixed(2),
      'Verbrauch (kWh/Monat)': (totalConsumption * 30).toFixed(2),
      'Verbrauch (kWh/Jahr)': (totalConsumption * 365).toFixed(2)
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stromverbrauch');

    // Adjust column width
    worksheet['!cols'] = [
      { width: 20 }, // Gerät
      { width: 15 }, // Leistung
      { width: 18 }, // Betriebsstunden
      { width: 18 }, // Verbrauch/Tag
      { width: 20 }, // Verbrauch/Monat
      { width: 18 }  // Verbrauch/Jahr
    ];

    XLSX.writeFile(workbook, 'Stromverbrauch_Haushalt.xlsx');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Stromverbrauch Tracker</h1>
        <p className="text-gray-600">Verwalte und tracke den Stromverbrauch deiner Haushaltsgeräte</p>
      </div>

      {/* Add new device */}
      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Plus className="mr-2" size={20} />
          Neues Gerät hinzufügen
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Gerätename"
            value={newDevice.name}
            onChange={(e) => setNewDevice({...newDevice, name: e.target.value})}
            className="p-2 border rounded-lg"
          />
          <input
            type="number"
            placeholder="Leistung (Watt)"
            value={newDevice.power}
            onChange={(e) => setNewDevice({...newDevice, power: e.target.value})}
            className="p-2 border rounded-lg"
          />
          <input
            type="number"
            step="0.1"
            placeholder="Betriebsstunden/Tag"
            value={newDevice.operatingHours}
            onChange={(e) => setNewDevice({...newDevice, operatingHours: e.target.value})}
            className="p-2 border rounded-lg"
          />
        </div>
        <button
          onClick={addDevice}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
        >
          <Plus className="mr-2" size={16} />
          Gerät hinzufügen
        </button>
      </div>

      {/* Device table */}
      <div className="bg-white border rounded-lg overflow-x-auto mb-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left font-semibold">Gerät</th>
              <th className="p-4 text-right font-semibold">Leistung (W)</th>
              <th className="p-4 text-right font-semibold">Std/Tag</th>
              <th className="p-4 text-right font-semibold">kWh/Tag</th>
              <th className="p-4 text-right font-semibold">kWh/Monat</th>
              <th className="p-4 text-right font-semibold">kWh/Jahr</th>
              <th className="p-4 text-center font-semibold">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {devices.map(device => (
              <tr key={device.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  <input
                    type="text"
                    value={device.name}
                    onChange={(e) => updateDevice(device.id, 'name', e.target.value)}
                    className="w-full p-1 border rounded"
                  />
                </td>
                <td className="p-4 text-right">
                  <input
                    type="number"
                    value={device.power}
                    onChange={(e) => updateDevice(device.id, 'power', e.target.value)}
                    className="w-20 p-1 border rounded text-right"
                  />
                </td>
                <td className="p-4 text-right">
                  <input
                    type="number"
                    step="0.1"
                    value={device.operatingHours}
                    onChange={(e) => updateDevice(device.id, 'operatingHours', e.target.value)}
                    className="w-20 p-1 border rounded text-right"
                  />
                </td>
                <td className="p-4 text-right font-mono">
                  {calculateConsumption(device.power, device.operatingHours)}
                </td>
                <td className="p-4 text-right font-mono">
                  {(calculateConsumption(device.power, device.operatingHours) * 30).toFixed(2)}
                </td>
                <td className="p-4 text-right font-mono">
                  {(calculateConsumption(device.power, device.operatingHours) * 365).toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => removeDevice(device.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-semibold">
            <tr>
              <td className="p-4">GESAMT</td>
              <td className="p-4 text-right">{devices.reduce((sum, d) => sum + d.power, 0)} W</td>
              <td className="p-4"></td>
              <td className="p-4 text-right">{totalConsumption.toFixed(2)} kWh</td>
              <td className="p-4 text-right">{(totalConsumption * 30).toFixed(2)} kWh</td>
              <td className="p-4 text-right">{(totalConsumption * 365).toFixed(2)} kWh</td>
              <td className="p-4"></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Täglicher Verbrauch</h3>
          <p className="text-2xl font-bold text-blue-600">{totalConsumption.toFixed(2)} kWh</p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Monatlicher Verbrauch</h3>
          <p className="text-2xl font-bold text-green-600">{(totalConsumption * 30).toFixed(2)} kWh</p>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800">Jährlicher Verbrauch</h3>
          <p className="text-2xl font-bold text-orange-600">{(totalConsumption * 365).toFixed(2)} kWh</p>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-center">
        <button
          onClick={exportToExcel}
          className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 flex items-center text-lg"
        >
          <Download className="mr-2" size={20} />
          Excel-Datei herunterladen
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Hinweise:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Alle Berechnungen basieren auf den angegebenen Betriebsstunden pro Tag</li>
          <li>Die Excel-Datei enthält alle Verbrauchsdaten ohne Preisangaben</li>
          <li>Verbrauchswerte werden automatisch für Tag, Monat und Jahr berechnet</li>
        </ul>
      </div>
    </div>
  );
};

export default StromverbrauchTracker;
