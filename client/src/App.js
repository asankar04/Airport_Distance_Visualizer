import React, { useEffect, useState } from 'react';
import "./App.css"
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import MapComponent from './MapComponent';

function App() {
    const [AirportQuery, setAirportQuery] = useState('');
    const [AirportQuery2, setAirportQuery2] = useState('');
    const [AirportList, setAirportList] = useState([]);
    const [AirportList2, setAirportList2] = useState([]);
    const [airport1Coords, setairport1Coords] = useState(null);
    const [airport2Coords, setairport2Coords] = useState(null);
    const [distanceStatus, setdistanceStatus] = useState(true);
    const [mapDescription, setmapDescription] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showDropdown2, setShowDropdown2] = useState(false); 
    const [coords1, setcoords1] = useState(false);
    const [coords2, setcoords2] = useState(false);
    const [mapVisible, setmapVisible] = useState(false);

    const zoom = 5;
    
    useEffect(() => {
      const fetchAirports = async() => {
        setcoords1(false);
        setmapVisible(false);
        setmapDescription("Please choose two airports");
        if (AirportQuery.length > 2) {
            try {
              const response = await axios.get(`/api/airports?query=${AirportQuery}`);
              setAirportList(response.data);
              setShowDropdown(true);              
            } catch(e) {
              console.error('Error finding airports: ', e);
            }
        } else {
          setAirportList([]);
          setShowDropdown(false);          
        }        
      }

      const debounceFetchAirport = setTimeout(() => {
        fetchAirports();
      }, 200);

      return () => clearTimeout(debounceFetchAirport); 

    }, [AirportQuery]);

    useEffect(() => {
      const fetchAirports2 = async() => {
        setcoords2(false); 
        setmapVisible(false);
        setmapDescription("Please choose two airports");
        if (AirportQuery2.length > 2) {
            try {
              const response = await axios.get(`/api/airports?query=${AirportQuery2}`);
              setAirportList2(response.data);
              setShowDropdown2(true);              
            } catch(e) {
              console.error('Error finding airports: ', e);
            }
        } else {
          setAirportList2([]);
          setShowDropdown2(false);          
        }        
      }

      const debounceFetchAirport2 = setTimeout(() => {
        fetchAirports2();
      }, 200);

      return () => clearTimeout(debounceFetchAirport2); 

    }, [AirportQuery2]);

    const selectAirport1 = (airport) => {
      setShowDropdown(false);
      setAirportQuery(airport.name);
      setairport1Coords({ lat: airport.latitude, lng: airport.longitude });      
      setcoords1(true);           
    }

    const selectAirport2 = (airport) => {
      setShowDropdown2(false);
      setAirportQuery2(airport.name);      
      setairport2Coords({ lat: airport.latitude, lng: airport.longitude });            
      setcoords2(true);
    }

    const calculateDistance = (coords1, coords2) => {
      const toRadians = (degrees) => degrees * (Math.PI / 180);
  
      const lat1 = coords1.lat;
      const lon1 = coords1.lng;
      const lat2 = coords2.lat;
      const lon2 = coords2.lng;
  
      // Radius of the Earth in miles
      const R = 3958.8;
      const dLat = toRadians(lat2 - lat1);
      const dLon = toRadians(lon2 - lon1);
  
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      
      return distance.toFixed(2);
    };

    const loadMap = async () => {
      try {
        if (coords1 && coords2) {
          const calculatedDistance = calculateDistance(airport1Coords, airport2Coords);
          setmapDescription(`Distance: ${calculatedDistance} miles (${(calculatedDistance * 1.60934).toFixed(2)} km)`);
          setdistanceStatus(true);
          setTimeout(() => {
            setmapVisible(true);
          }, 400);
        }
      } catch (e) {
        console.log(e);
      }
    };
    

    return (
        <div className="App">
          <h1 className='title'> Airport Distance Visualizer </h1>
          <div className='Main'>
            <div className='airport_section'>
              <div className='section'>
                  <h2 className='airport_heading'>Airport 1</h2>
                  <input
                    id='input'
                    className='airport_input' 
                    type="text"  
                    value={AirportQuery} 
                    onChange={(e) => setAirportQuery(e.target.value)} 
                    placeholder='Enter first airport'
                  />
                  {/* Render the list of airports with the mapping function (hi if ur reading this) */}
                  {showDropdown && 
                  (<ul className="airport_list">
                    {AirportList.map(airport => (
                      <li key={airport.id} onClick={() => selectAirport1(airport)}>{airport.name}, {airport.city}</li>
                    ))}
                  </ul>)}
              </div>
              <div className='section'>              
                <h2 className='airport_heading'>Airport 2</h2>
                <input 
                  id='input2'
                  className='airport_input' 
                  type="text"
                  value={AirportQuery2} 
                  onChange={(e) => setAirportQuery2(e.target.value)} 
                  placeholder='Enter second airport'
                  />
                  {/* Render the list of airports (hi again)*/}
                {showDropdown2 && 
                (<ul className="airport_list2">
                  {AirportList2.map(airport => (
                    <li key={airport.id} onClick={() => selectAirport2(airport)}>{airport.name}, {airport.city}</li>
                  ))}
                </ul>)}
              </div>
              <div className='generate_result'>
                  <button className='generate_button' onClick={loadMap}>Generate Distance</button>                  
              </div>
              <p>*Please press again if distance fails to calculate*</p>
            </div>          
            <div className='visualizer'>                
              {/* Leaflet Map Component */}
              {mapVisible && <MapComponent className="map" zoom={zoom} 
                center={[
                  (airport1Coords.lat + airport2Coords.lat) / 2,
                  (airport1Coords.lng + airport2Coords.lng) / 2
                ]} markers={[
                    {position: [airport1Coords.lat, airport1Coords.lng], popupText: AirportQuery},
                    {position: [airport2Coords.lat, airport2Coords.lng], popupText: AirportQuery2}
                ]} pathCoordinates={[
                        [airport1Coords.lat, airport1Coords.lng],
                        [airport2Coords.lat, airport2Coords.lng]
                ]}/>}
              {distanceStatus && <p className='mapDescription'>{mapDescription}</p>}
            </div>
          </div>
        </div>
    );
}

export default App;
