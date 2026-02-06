import React, { useState, useEffect, useRef } from 'react';
import { Heart, MapPin, Calendar, DollarSign, Plus, X, Search, User, LogOut, LogIn, Users, Camera, Map } from 'lucide-react';
import { API_URL } from './config';

// Google Places Autocomplete Component
const PlacesAutocomplete = ({ value, onChange, onPlaceSelect }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment']
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current.getPlace();
      
      if (place.geometry) {
        const location = {
          address: place.formatted_address || place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        onPlaceSelect(location);
      }
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onPlaceSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
      placeholder="Start typing an address..."
    />
  );
};

// Google Map Component
const GoogleMap = ({ location, coordinates }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (window.google && mapRef.current && coordinates) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: coordinates.lat, lng: coordinates.lng },
        zoom: 15,
      });

      new window.google.maps.Marker({
        position: { lat: coordinates.lat, lng: coordinates.lng },
        map: map,
        title: location
      });
    }
  }, [coordinates, location]);

  if (!coordinates) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
        <MapPin className="mr-2" size={20} />
        <span>{location}</span>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-48 rounded-lg" />;
};

// Mini Map Preview in Create Event Modal
const MiniMapPreview = ({ coordinates }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (window.google && mapRef.current && coordinates) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: coordinates.lat, lng: coordinates.lng },
        zoom: 14,
      });

      new window.google.maps.Marker({
        position: { lat: coordinates.lat, lng: coordinates.lng },
        map: map,
      });
    }
  }, [coordinates]);

  if (!coordinates) {
    return null;
  }

  return (
    <div className="mt-3">
      <p className="text-sm font-semibold text-gray-700 mb-2">Location Preview</p>
      <div ref={mapRef} className="w-full h-32 rounded-lg border-2 border-purple-200" />
    </div>
  );
};

const App = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [likedEvents, setLikedEvents] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    cost: '',
    time: '',
    sportType: '',
    images: [],
    description: '',
    maxAttendees: '',
    coordinates: null
  });
  
  const [authFormData, setAuthFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: ''
  });
  
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    bio: '',
    avatar: '',
    favoriteSports: []
  });

  const sportTypes = ['All', 'Volleyball', 'Basketball', 'Soccer', 'Tennis', 'Yoga', 'Running', 'Cycling', 'Swimming', 'Other'];

  // Load Google Maps
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''}&libraries=places`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    }
    fetchEvents();
  }, [token]);

  useEffect(() => {
    let filtered = events;

    if (selectedSport !== 'All') {
      filtered = filtered.filter(event => event.sportType === selectedSport);
    }

    if (searchQuery) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedSport]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      } else {
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch(`${API_URL}/events`, { headers });
      const data = await response.json();
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = authMode === 'login' ? 'login' : 'register';
    
    try {
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authFormData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setCurrentUser(data.user);
        setShowAuthModal(false);
        setAuthFormData({ email: '', password: '', username: '', name: '' });
        fetchEvents();
      } else {
        alert(data.message || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setCurrentUser(null);
    fetchEvents();
  };

  const handleLike = async (eventId) => {
    const newLiked = new Set(likedEvents);
    const isLiked = newLiked.has(eventId);
    
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment: !isLiked })
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(events.map(e => e._id === eventId ? updatedEvent : e));
        
        if (isLiked) {
          newLiked.delete(eventId);
        } else {
          newLiked.add(eventId);
        }
        setLikedEvents(newLiked);
      }
    } catch (error) {
      console.error('Error liking event:', error);
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    if (!token) {
      alert('Please login to register for events');
      setShowAuthModal(true);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        setEvents(events.map(e => e._id === eventId ? data : e));
        if (selectedEvent && selectedEvent._id === eventId) {
          setSelectedEvent(data);
        }
        alert('Successfully registered for event!');
      } else {
        alert(data.message || 'Failed to register');
      }
    } catch (error) {
      console.error('Error registering:', error);
      alert('Failed to register for event');
    }
  };

  const handleImageUpload = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
      return null;
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    const url = await handleImageUpload(file);
    if (url) {
      setProfileFormData({ ...profileFormData, avatar: url });
    }
    setUploadingAvatar(false);
  };

  const handleEventImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    
    // Upload images using the correct endpoint
    const formDataUpload = new FormData();
    files.forEach(file => {
      formDataUpload.append('eventImages', file);
    });

    try {
      const response = await fetch(`${API_URL}/upload-multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataUpload
      });

      if (response.ok) {
        const results = await response.json();
        const urls = results.map(r => r.url);
        setFormData({
          ...formData,
          images: [...formData.images, ...urls]
        });
      } else {
        alert('Failed to upload images');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload images');
    }

    setUploadingImages(false);
  };

  const handlePlaceSelect = (location) => {
    setFormData({
      ...formData,
      location: location.address,
      coordinates: {
        lat: location.lat,
        lng: location.lng
      }
    });
  };

  const handleLocationChange = (value) => {
    setFormData({
      ...formData,
      location: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      alert('Please login to create events');
      setShowAuthModal(true);
      return;
    }

    const eventData = {
      ...formData,
      cost: parseFloat(formData.cost) || 0,
      maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null
    };

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      if (response.ok) {
        const newEvent = await response.json();
        setEvents([newEvent, ...events]);
        setShowModal(false);
        setFormData({
          title: '',
          location: '',
          cost: '',
          time: '',
          sportType: '',
          description: '',
          maxAttendees: '',
          images: [],
          coordinates: null
        });
      } else {
        alert('Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event');
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/users/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profileFormData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        setShowProfileModal(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const openProfileEditor = () => {
    setProfileFormData({
      name: currentUser.name || '',
      bio: currentUser.bio || '',
      avatar: currentUser.avatar || '',
      favoriteSports: currentUser.favoriteSports || []
    });
    setShowProfileModal(true);
  };

  const openEventDetail = (event) => {
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  const isRegisteredForEvent = (event) => {
    return currentUser && event.attendees?.some(a => a._id === currentUser._id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SportMeet
              </h1>
              <p className="text-gray-600 text-sm mt-1">Find & Join Social Sports Events</p>
            </div>
            
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {currentUser ? (
                <>
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Create Event
                  </button>
                  <button
                    onClick={openProfileEditor}
                    className="bg-white border-2 border-purple-600 p-2 rounded-full hover:bg-purple-50 transition-all"
                    title={currentUser.name}
                  >
                    <img 
                      src={currentUser.avatar} 
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </button>
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 text-gray-700 px-4 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all flex items-center gap-2"
                  >
                    <LogOut size={20} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
                >
                  <LogIn size={20} />
                  Login
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {sportTypes.map(sport => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  selectedSport === sport
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Events Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No events found. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => openEventDetail(event)}
              >
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <img
                    src={event.images[0] || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-purple-600">
                    {event.sportType}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(event._id);
                    }}
                    className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm transition-all ${
                      likedEvents.has(event._id)
                        ? 'bg-pink-500 text-white'
                        : 'bg-white/90 text-gray-600 hover:bg-pink-500 hover:text-white'
                    }`}
                  >
                    <Heart size={18} fill={likedEvents.has(event._id) ? 'currentColor' : 'none'} />
                  </button>
                  
                  {event.creator && (
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-2">
                      <img 
                        src={event.creator.avatar} 
                        alt={event.creator.username}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      {event.creator.username}
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {event.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={16} className="text-purple-600 flex-shrink-0" />
                      <span className="text-sm truncate">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar size={16} className="text-purple-600 flex-shrink-0" />
                      <span className="text-sm">
                        {new Date(event.time).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={16} className="text-purple-600 flex-shrink-0" />
                        <span className="text-sm">
                          {event.attendees.length} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} attending
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-green-600" />
                        <span className="font-bold text-lg text-gray-800">
                          {event.cost === 0 ? 'Free' : `$${event.cost}`}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 text-gray-500">
                        <Heart size={16} />
                        <span className="text-sm">{event.likes}</span>
                      </div>
                    </div>
                  </div>

                  {isRegisteredForEvent(event) ? (
                    <div className="w-full mt-4 bg-green-100 border border-green-300 text-green-700 py-3 rounded-xl font-semibold text-center">
                      ✓ Registered
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegisterForEvent(event._id);
                      }}
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                    >
                      Register for Event
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Event Detail Modal */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedEvent.images[0] || 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800'}
                alt={selectedEvent.title}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setShowEventDetailModal(false)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{selectedEvent.title}</h2>
                  <span className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedEvent.sportType}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-800">
                    {selectedEvent.cost === 0 ? 'Free' : `$${selectedEvent.cost}`}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 justify-end mt-1">
                    <Heart size={16} />
                    <span className="text-sm">{selectedEvent.likes} likes</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{selectedEvent.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-purple-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold">
                      {new Date(selectedEvent.time).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="text-purple-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Attendees</p>
                    <p className="font-semibold">
                      {selectedEvent.attendees?.length || 0} 
                      {selectedEvent.maxAttendees ? ` / ${selectedEvent.maxAttendees}` : ''} registered
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  <MapPin className="text-purple-600" size={20} />
                  Location
                </h3>
                <p className="text-gray-700 mb-3">{selectedEvent.location}</p>
                <GoogleMap location={selectedEvent.location} coordinates={selectedEvent.coordinates} />
              </div>

              {selectedEvent.creator && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-bold mb-3">Organizer</h3>
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedEvent.creator.avatar} 
                      alt={selectedEvent.creator.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-semibold">{selectedEvent.creator.name}</p>
                      <p className="text-sm text-gray-600">@{selectedEvent.creator.username}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">Attendees</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.attendees.map(attendee => (
                      <div key={attendee._id} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full">
                        <img 
                          src={attendee.avatar} 
                          alt={attendee.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm">{attendee.username}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isRegisteredForEvent(selectedEvent) ? (
                <div className="w-full bg-green-100 border border-green-300 text-green-700 py-3 rounded-xl font-semibold text-center">
                  ✓ You're Registered
                </div>
              ) : (
                <button
                  onClick={() => handleRegisterForEvent(selectedEvent._id)}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Register for This Event
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </h2>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'register' && (
                <>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={authFormData.name}
                    onChange={(e) => setAuthFormData({...authFormData, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Username"
                    value={authFormData.username}
                    onChange={(e) => setAuthFormData({...authFormData, username: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </>
              )}
              
              <input
                type="email"
                required
                placeholder="Email"
                value={authFormData.email}
                onChange={(e) => setAuthFormData({...authFormData, email: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              
              <input
                type="password"
                required
                placeholder="Password"
                value={authFormData.password}
                onChange={(e) => setAuthFormData({...authFormData, password: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </button>
            </form>

            <p className="text-center mt-4 text-gray-600">
              {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                className="ml-2 text-purple-600 font-semibold hover:underline"
              >
                {authMode === 'login' ? 'Sign Up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Edit Profile</h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <img 
                    src={profileFormData.avatar} 
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-200"
                  />
                  <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                    <Camera size={16} />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
                {uploadingAvatar && <p className="text-sm text-gray-600 mt-2">Uploading...</p>}
              </div>

              <input
                type="text"
                placeholder="Name"
                value={profileFormData.name}
                onChange={(e) => setProfileFormData({...profileFormData, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />
              
              <textarea
                placeholder="Bio"
                value={profileFormData.bio}
                onChange={(e) => setProfileFormData({...profileFormData, bio: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                rows="3"
              />

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Update Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Create New Event</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="e.g., Beach Volleyball Tournament"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-purple-600" />
                  Location * (Type to search or enter manually)
                </label>
                <PlacesAutocomplete
                  value={formData.location}
                  onChange={handleLocationChange}
                  onPlaceSelect={handlePlaceSelect}
                />
                <MiniMapPreview coordinates={formData.coordinates} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cost ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Attendees
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxAttendees}
                    onChange={(e) => setFormData({...formData, maxAttendees: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({...formData, time: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Sport Type *
                </label>
                <select
                  required
                  value={formData.sportType}
                  onChange={(e) => setFormData({...formData, sportType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select a sport</option>
                  {sportTypes.filter(s => s !== 'All').map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  rows="3"
                  placeholder="Describe your event..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Camera size={16} />
                  Upload Event Images (Up to 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEventImageUpload}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  disabled={uploadingImages}
                />
                {uploadingImages && <p className="text-sm text-gray-600 mt-2">Uploading images...</p>}
                
                {formData.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setFormData({
                            ...formData,
                            images: formData.images.filter((_, i) => i !== index)
                          })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all"
                  disabled={uploadingImages}
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
