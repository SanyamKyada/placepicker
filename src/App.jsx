import { useCallback, useEffect, useRef, useState } from 'react';

import Places from './components/Places.jsx';
import { AVAILABLE_PLACES } from './data.js';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import { sortPlacesByDistance } from './loc.js';

const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
const storedPlaces = storedIds.map((id) =>
  AVAILABLE_PLACES.find((place) => place.id === id)
);

function App() {

  const selectedPlace = useRef();
  const [modalIsOpen, setIsModalIsOpen] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [pickedPlaces, setPickedPlaces] = useState(storedPlaces);

  useEffect(() => { // This function will be executed only after this App component is executed
    navigator.geolocation.getCurrentPosition((position) => {
      const sortedPlaces = sortPlacesByDistance(
        AVAILABLE_PLACES,
        position.coords.latitude,
        position.coords.longitude);

      setAvailablePlaces(sortedPlaces);
    });
  }, []); // This array contains the dependecies. Here as there are no dependencies, this function will be executed only once no matter how many times App components gets executed.
  // All the things(used inside useEffect) that cause this component execute again are dependencies for this useEffect. It can be ref/state, function/context 

  function handleStartRemovePlace(id) {
    setIsModalIsOpen(true);
    selectedPlace.current = id;
  }

  function handleStopRemovePlace() {
    setIsModalIsOpen(false);
  }

  function handleSelectPlace(id) {
    setPickedPlaces((prevPickedPlaces) => {
      if (prevPickedPlaces.some((place) => place.id === id)) {
        return prevPickedPlaces;
      }
      const place = AVAILABLE_PLACES.find((place) => place.id === id);
      return [place, ...prevPickedPlaces];
    });

    const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
    if (storedIds.indexOf(id) === -1) {
      localStorage.setItem(
        'selectedPlaces',
        JSON.stringify([id, ...storedIds])
      );
    }
  }

  // This useCallback hook stores this function internally and does not recreate it when this App components runs again untill any dependencies value changes.
  // Which is very important when we are using this handleRemovePlace function into the useEffect inside the DeleteConfirmation component
  // It will prevent the infinite loop
  const handleRemovePlace = useCallback(function handleRemovePlace() {
      setPickedPlaces((prevPickedPlaces) =>
        prevPickedPlaces.filter((place) => place.id !== selectedPlace.current)
      );
      setIsModalIsOpen(false);

      const storedIds = JSON.parse(localStorage.getItem('selectedPlaces')) || [];
      localStorage.setItem('selectedPlaces', JSON.stringify(storedIds.filter((id) => id != selectedPlace.current)));
    }, []);

  return (
    <>
      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt="Stylized globe" />
        <h1>PlacePicker</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        <Places
          title="I'd like to visit ..."
          fallbackText={'Select the places you would like to visit below.'}
          places={pickedPlaces}
          onSelectPlace={handleStartRemovePlace}
        />
        <Places
          title="Available Places"
          places={availablePlaces}
          fallbackText={"Sorting places by distance"}
          onSelectPlace={handleSelectPlace}
        />
      </main>
    </>
  );
}

export default App;
