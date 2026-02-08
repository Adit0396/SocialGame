import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  X,
  Search,
  LogOut,
  Users,
  Camera,
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Bug,
  Send,
  CheckCircle,
  ChevronDown,
  Share2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
} from "lucide-react";

const API_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://socialgame-api.onrender.com/api";

// Image Carousel Component
const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">No image</span>
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <img src={images[0]} alt="Event" className="w-full h-full object-cover" />
    );
  }

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="relative w-full h-full group">
      <img
        src={images[currentIndex]}
        alt={`Event ${currentIndex + 1}`}
        className="w-full h-full object-cover"
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          prevImage();
        }}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          nextImage();
        }}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
      >
        <ChevronRight size={20} />
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-white w-4" : "bg-white/50"}`}
          />
        ))}
      </div>
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-full text-xs">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

// Google Places Autocomplete Component
const PlacesAutocomplete = ({ value, onChange, onPlaceSelect }) => {
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (!window.google || !inputRef.current) return;
    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      { types: ["geocode", "establishment"] },
    );
    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry) {
        const location = {
          address: place.formatted_address || place.name,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        onPlaceSelect(location);
      }
    });
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current,
        );
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
        title: location,
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

// Mini Map Preview
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

  if (!coordinates) return null;

  return (
    <div className="mt-3">
      <p className="text-sm font-semibold text-gray-700 mb-2">
        Location Preview
      </p>
      <div
        ref={mapRef}
        className="w-full h-32 rounded-lg border-2 border-purple-200"
      />
    </div>
  );
};

const App = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEventDetailModal, setShowEventDetailModal] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [showBugDashboard, setShowBugDashboard] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showUnregisterModal, setShowUnregisterModal] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [bugs, setBugs] = useState([]);
  const [eventToUnregister, setEventToUnregister] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [signupStep, setSignupStep] = useState(1);
  const [likedEvents, setLikedEvents] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  
  const profileDropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    cost: "",
    time: "",
    sportType: "",
    images: [],
    description: "",
    maxAttendees: "",
    coordinates: null,
  });

  const [authFormData, setAuthFormData] = useState({
    email: "",
    password: "",
    username: "",
    name: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    username: "",
    location: null,
    interests: [],
  });

  const [profileFormData, setProfileFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
    favoriteSports: [],
    interests: [],
    location: null,
  });

  const [bugReportData, setBugReportData] = useState({
    title: "",
    description: "",
    screenshots: [],
  });

  const sportTypes = [
    "All",
    "My Events",
    "Volleyball",
    "Basketball",
    "Soccer",
    "Tennis",
    "Yoga",
    "Running",
    "Cycling",
    "Swimming",
    "Other",
  ];

  const getSportEmoji = (sport) => {
    const emojiMap = {
      Volleyball: "🏐",
      Basketball: "🏀",
      Soccer: "⚽",
      Tennis: "🎾",
      Yoga: "🧘",
      Running: "🏃",
      Cycling: "🚴",
      Swimming: "🏊",
      Other: "🎯",
      "My Events": "✨",
      All: "🎯",
    };
    return emojiMap[sport] || "🎯";
  };

  // Check if user needs to complete profile - SHOW EVERY LOGIN
  useEffect(() => {
    if (currentUser && !currentUser.profileComplete) {
      setShowProfilePrompt(true);
    }
  }, [currentUser]);

  useEffect(() => {
    if (!window.google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""}&libraries=places`;
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
      fetchEvents();
      fetchBugs();
    } else {
      setLoading(false);
    }
  }, [token]);

  // Handle shared event links - open event modal from URL
  useEffect(() => {
    const path = window.location.pathname;
    const eventIdMatch = path.match(/\/event\/([a-zA-Z0-9]+)/);
    
    if (eventIdMatch) {
      const eventId = eventIdMatch[1];
      
      if (token && events.length > 0) {
        // User is logged in, find and open event
        const event = events.find(e => e._id === eventId);
        
        if (event) {
          setSelectedEvent(event);
          setShowEventDetailModal(true);
          // Clean URL without reload
          window.history.replaceState({}, '', '/');
        }
      } else if (!token) {
        // User not logged in, store event ID for after login
        sessionStorage.setItem('pendingEventId', eventId);
      }
    }
  }, [token, events]);

  // Open pending event after login
  useEffect(() => {
    if (token && events.length > 0) {
      const pendingEventId = sessionStorage.getItem('pendingEventId');
      if (pendingEventId) {
        const event = events.find(e => e._id === pendingEventId);
        if (event) {
          setSelectedEvent(event);
          setShowEventDetailModal(true);
          sessionStorage.removeItem('pendingEventId');
          window.history.replaceState({}, '', '/');
        }
      }
    }
  }, [token, events]);

  useEffect(() => {
    let filtered = events;
    
    // Filter by "My Events" (registered events)
    if (selectedSport === "My Events" && currentUser) {
      filtered = filtered.filter((event) =>
        event.attendees?.some((a) => a._id === currentUser._id)
      );
    } else if (selectedSport !== "All" && selectedSport !== "My Events") {
      filtered = filtered.filter((event) => event.sportType === selectedSport);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    setFilteredEvents(filtered);
  }, [events, searchQuery, selectedSport, currentUser]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const user = await response.json();
        setCurrentUser(user);
      } else {
        localStorage.removeItem("token");
        setToken(null);
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEvents(data);
      setFilteredEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBugs = async () => {
    try {
      const response = await fetch(`${API_URL}/bugs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBugs(data);
      }
    } catch (error) {
      console.error("Error fetching bugs:", error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const endpoint = authMode === "login" ? "login" : "register";
    setIsSubmitting(true);

    try {
      // Use signupData for registration, authFormData for login
      const requestData = authMode === "register" ? signupData : authFormData;
      
      const response = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }
      localStorage.setItem("token", data.token);

      setToken(data.token);
      setCurrentUser(data.user);

      // Reset forms
      setAuthFormData({
        email: "",
        password: "",
        username: "",
        name: "",
      });
      
      setSignupData({
        name: "",
        email: "",
        password: "",
        username: "",
        location: null,
        interests: [],
      });
      
      setSignupStep(1);

      const eventsResponse = await fetch(`${API_URL}/events`, {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      });

      if (!eventsResponse.ok) {
        throw new Error("Failed to fetch events");
      }

      const eventsData = await eventsResponse.json();
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (error) {
      console.error("Auth error:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setCurrentUser(null);
    setEvents([]);
    setFilteredEvents([]);
  };

  const handleLike = async (eventId) => {
    const newLiked = new Set(likedEvents);
    const isLiked = newLiked.has(eventId);

    try {
      const response = await fetch(`${API_URL}/events/${eventId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment: !isLiked }),
      });

      if (response.ok) {
        const updatedEvent = await response.json();
        setEvents(events.map((e) => (e._id === eventId ? updatedEvent : e)));
        if (isLiked) {
          newLiked.delete(eventId);
        } else {
          newLiked.add(eventId);
        }
        setLikedEvents(newLiked);
      }
    } catch (error) {
      console.error("Error liking event:", error);
    }
  };

  const handleRegisterForEvent = async (eventId) => {
    if (!token) {
      alert("Please login to register for events");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/events/${eventId}/register`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok) {
        setEvents(events.map((e) => (e._id === eventId ? data : e)));
        if (selectedEvent && selectedEvent._id === eventId) {
          setSelectedEvent(data);
        }
        alert("Successfully registered for event!");
      } else {
        alert(data.message || "Failed to register");
      }
    } catch (error) {
      console.error("Error registering:", error);
      alert("Failed to register for event");
    }
  };

  const handleUnregisterForEvent = async (eventId) => {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/unregister`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();

      if (response.ok) {
        setEvents(events.map((e) => (e._id === eventId ? data : e)));
        if (selectedEvent && selectedEvent._id === eventId) {
          setSelectedEvent(data);
        }
        setShowUnregisterModal(false);
        setEventToUnregister(null);
        alert("Successfully unregistered from event!");
      } else {
        alert(data.message || "Failed to unregister");
      }
    } catch (error) {
      console.error("Error unregistering:", error);
      alert("Failed to unregister from event");
    }
  };

  const openUnregisterModal = (event) => {
    setEventToUnregister(event);
    setShowUnregisterModal(true);
  };

  const confirmUnregister = () => {
    if (eventToUnregister) {
      handleUnregisterForEvent(eventToUnregister._id);
    }
  };

  const handleImageUpload = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append("image", file);

    try {
      const response = await fetch(`${API_URL}/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
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

    const remainingSlots = 5 - formData.images.length;
    if (files.length > remainingSlots) {
      alert(
        `You can only upload ${remainingSlots} more image(s). Maximum is 5 images total.`,
      );
      return;
    }

    setUploadingImages(true);

    const formDataUpload = new FormData();
    files.forEach((file) => {
      formDataUpload.append("eventImages", file);
    });

    try {
      const response = await fetch(`${API_URL}/upload-multiple`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (response.ok) {
        const results = await response.json();
        const urls = results.map((r) => r.url);
        setFormData({
          ...formData,
          images: [...formData.images, ...urls].slice(0, 5),
        });
      } else {
        const error = await response.json();
        alert(error.message || "Failed to upload images");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload images");
    }

    setUploadingImages(false);
  };

  const handleBugScreenshotUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = 3 - bugReportData.screenshots.length;
    if (files.length > remainingSlots) {
      alert(
        `You can only upload ${remainingSlots} more screenshot(s). Maximum is 3 screenshots total.`,
      );
      return;
    }

    const formDataUpload = new FormData();
    files.forEach((file) => {
      formDataUpload.append("eventImages", file);
    });

    try {
      const response = await fetch(`${API_URL}/upload-multiple`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload,
      });

      if (response.ok) {
        const results = await response.json();
        const urls = results.map((r) => r.url);
        setBugReportData({
          ...bugReportData,
          screenshots: [...bugReportData.screenshots, ...urls].slice(0, 3),
        });
      } else {
        alert("Failed to upload screenshots");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload screenshots");
    }
  };

  const handlePlaceSelect = (location) => {
    setFormData({
      ...formData,
      location: location.address,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
    });
  };

  const handleLocationChange = (value) => {
    setFormData({
      ...formData,
      location: value,
    });
  };

  const resetForm = () => {
    setFormData({
      title: "",
      location: "",
      cost: "",
      time: "",
      sportType: "",
      description: "",
      maxAttendees: "",
      images: [],
      coordinates: null,
    });
    setEditingEvent(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert("Please login to create events");
      return;
    }

    if (formData.images.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }

    setIsSubmitting(true);

    const eventData = {
      ...formData,
      cost: parseFloat(formData.cost) || 0,
      maxAttendees: formData.maxAttendees
        ? parseInt(formData.maxAttendees)
        : null,
    };

    try {
      const url = editingEvent
        ? `${API_URL}/events/${editingEvent._id}`
        : `${API_URL}/events`;
      const method = editingEvent ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      if (response.ok) {
        const savedEvent = await response.json();

        if (editingEvent) {
          setEvents(
            events.map((e) => (e._id === savedEvent._id ? savedEvent : e)),
          );
          if (selectedEvent && selectedEvent._id === savedEvent._id) {
            setSelectedEvent(savedEvent);
          }
          alert("Event updated successfully!");
        } else {
          setEvents([savedEvent, ...events]);
          alert("Event created successfully!");
        }

        setShowModal(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`${API_URL}/events/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setEvents(events.filter((e) => e._id !== eventId));
        setShowEventDetailModal(false);
        alert("Event deleted successfully!");
      } else {
        alert("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      location: event.location,
      cost: event.cost.toString(),
      time: new Date(event.time).toISOString().slice(0, 16),
      sportType: event.sportType,
      description: event.description,
      maxAttendees: event.maxAttendees ? event.maxAttendees.toString() : "",
      images: event.images || [],
      coordinates: event.coordinates || null,
    });
    setShowEventDetailModal(false);
    setShowModal(true);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/users/${currentUser._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileFormData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setCurrentUser(updatedUser);
        setShowProfileModal(false);
        alert("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBugReport = async (e) => {
    e.preventDefault();

    const bugReport = {
      ...bugReportData,
      userEmail: currentUser?.email || "Anonymous",
      userName: currentUser?.name || "Anonymous",
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    try {
      const response = await fetch(`${API_URL}/bugs`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bugReport),
      });

      if (response.ok) {
        alert("Bug report submitted successfully! Thank you for helping us improve SocialGame.");
        setBugReportData({ title: "", description: "", screenshots: [] });
        setShowBugReportModal(false);
        fetchBugs(); // Refresh bug list
      } else {
        alert("Failed to submit bug report. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting bug report:", error);
      alert("Failed to submit bug report. Please try again.");
    }
  };

  const handleBugStatusChange = async (bugId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/bugs/${bugId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBugs(); // Refresh bug list
      }
    } catch (error) {
      console.error("Error updating bug status:", error);
    }
  };

  const handleShareEvent = async (eventId, eventTitle) => {
    const shareUrl = `${window.location.origin}/event/${eventId}`;
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast("Link copied to clipboard!");
      } catch (err2) {
        console.error("Fallback copy failed:", err2);
        showToast("Failed to copy link");
      }
      document.body.removeChild(textArea);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const openProfileEditor = () => {
    setProfileFormData({
      name: currentUser.name || "",
      bio: currentUser.bio || "",
      avatar: currentUser.avatar || "",
      favoriteSports: currentUser.favoriteSports || [],
      interests: currentUser.interests || [],
      location: currentUser.location || null,
    });
    setShowProfileModal(true);
  };

  const openEventDetail = (event) => {
    if (!token) {
      alert("Please login to view event details");
      return;
    }
    setSelectedEvent(event);
    setShowEventDetailModal(true);
  };

  const openCreateEventModal = () => {
    if (!token) {
      alert("Please login to create events");
      return;
    }
    resetForm();
    setShowModal(true);
  };

  const isRegisteredForEvent = (event) => {
    return (
      currentUser && event.attendees?.some((a) => a._id === currentUser._id)
    );
  };

  const isEventCreator = (event) => {
    return (
      currentUser && event.creator && event.creator._id === currentUser._id
    );
  };

  // LOGIN WALL - Require login for everything
if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
        {authMode === "register" ? (
          /* MULTI-STEP SIGNUP */
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-gray-600">Step {signupStep} of 3</p>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-center mb-8">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      signupStep >= step
                        ? "bg-purple-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-16 h-1 ${
                        signupStep > step ? "bg-purple-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            <form onSubmit={handleAuth} autoComplete="off">
              {/* STEP 1: Basic Info */}
              {signupStep === 1 && (
                <div className="space-y-4">
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Full Name"
                    value={signupData.name}
                    onChange={(e) =>
                      setSignupData({ ...signupData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Username"
                    value={signupData.username}
                    onChange={(e) =>
                      setSignupData({ ...signupData, username: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    placeholder="Email"
                    value={signupData.email}
                    onChange={(e) =>
                      setSignupData({ ...signupData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="password"
                    required
                    autoComplete="off"
                    placeholder="Password (min 6 characters)"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
              )}

              {/* STEP 2: Location */}
              {signupStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-purple-700">
                      <MapPin size={20} />
                      <span className="font-semibold">Why we need your location</span>
                    </div>
                    <p className="text-sm text-purple-600 mt-2">
                      We'll show you events happening near you so you can easily join
                      activities in your area!
                    </p>
                  </div>

                  <PlacesAutocomplete
                    value={signupData.location?.address || ""}
                    onChange={(value) =>
                      setSignupData({
                        ...signupData,
                        location: { ...signupData.location, address: value },
                      })
                    }
                    onPlaceSelect={(location) => {
                      setSignupData({
                        ...signupData,
                        location: {
                          address: location.address,
                          coordinates: {
                            lat: location.lat,
                            lng: location.lng,
                          },
                        },
                      });
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSignupData({
                        ...signupData,
                        location: { address: "Prefer not to say", coordinates: null },
                      });
                      setSignupStep(3);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Skip for now
                  </button>
                </div>
              )}

              {/* STEP 3: Interests */}
              {signupStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-purple-700">
                      <Sparkles size={20} />
                      <span className="font-semibold">Pick your favorite sports</span>
                    </div>
                    <p className="text-sm text-purple-600 mt-2">
                      We'll recommend events based on your interests!
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Volleyball",
                      "Basketball",
                      "Soccer",
                      "Tennis",
                      "Yoga",
                      "Running",
                      "Cycling",
                      "Swimming",
                    ].map((sport) => (
                      <button
                        key={sport}
                        type="button"
                        onClick={() => {
                          const newInterests = signupData.interests.includes(sport)
                            ? signupData.interests.filter((s) => s !== sport)
                            : [...signupData.interests, sport];
                          setSignupData({ ...signupData, interests: newInterests });
                        }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          signupData.interests.includes(sport)
                            ? "border-purple-600 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300"
                        }`}
                      >
                        <div className="text-3xl mb-2">{getSportEmoji(sport)}</div>
                        <div className="font-semibold text-sm">{sport}</div>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSignupData({ ...signupData, interests: [] });
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {signupData.interests.length > 0 ? "Clear selection" : "Skip for now"}
                  </button>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {signupStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setSignupStep(signupStep - 1)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    Back
                  </button>
                )}

                {signupStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setSignupStep(signupStep + 1)}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Next
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating Account..." : "Create Account"}
                  </button>
                )}
              </div>
            </form>

            <p className="text-center mt-4 text-gray-600">
              Already have an account?
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setSignupStep(1);
                  setSignupData({
                    name: "",
                    email: "",
                    password: "",
                    username: "",
                    location: null,
                    interests: [],
                  });
                }}
                className="ml-2 text-purple-600 font-semibold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        ) : (
          /* LOGIN FORM */
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                SocialGame
              </h1>
              <p className="text-gray-600">
                Please login to view and join social sports events
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4" autoComplete="off">
              <input
                type="email"
                name="email"
                required
                placeholder="Email"
                autoComplete="off"
                value={authFormData.email}
                onChange={(e) =>
                  setAuthFormData({ ...authFormData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />

              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                autoComplete="current-password"
                value={authFormData.password}
                onChange={(e) =>
                  setAuthFormData({ ...authFormData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Please wait..." : "Login"}
              </button>
            </form>

            <p className="text-center mt-4 text-gray-600">
              Don't have an account?
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className="ml-2 text-purple-600 font-semibold hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SocialGame
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Find & Join Social Sports Events
              </p>
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
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
              <button
                onClick={() => setShowBugDashboard(true)}
                className="bg-blue-500 text-white px-4 py-3 rounded-full font-semibold hover:bg-blue-600 transition-all flex items-center gap-2"
                title="View All Bugs"
              >
                <Bug size={20} />
                <span className="hidden md:inline">Bugs ({bugs.length})</span>
              </button>

              <button
                onClick={() => setShowBugReportModal(true)}
                className="bg-orange-500 text-white px-4 py-3 rounded-full font-semibold hover:bg-orange-600 transition-all flex items-center gap-2"
                title="Report a Bug"
              >
                <Bug size={20} />
                <span className="hidden md:inline">Report Bug</span>
              </button>

              <button
                onClick={openCreateEventModal}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus size={20} />
                Create Event
              </button>

              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="bg-white border-2 border-purple-600 rounded-full hover:bg-purple-50 transition-all flex items-center gap-1 pr-3 pl-2 py-2"
                  title={currentUser?.name}
                >
                  <img
                    src={currentUser?.avatar}
                    alt={currentUser?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <ChevronDown size={16} className="text-purple-600" />
                </button>

                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50">
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        openProfileEditor();
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700"
                    >
                      <Edit size={18} className="text-purple-600" />
                      <span className="font-medium">Edit Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileDropdown(false);
                        handleLogout();
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700 border-t border-gray-100"
                    >
                      <LogOut size={18} className="text-red-500" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {sportTypes.map((sport) => (
              <button
                key={sport}
                onClick={() => setSelectedSport(sport)}
                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                  selectedSport === sport
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {sport}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              {selectedSport === "My Events"
                ? "You haven't registered for any events yet. Browse all events to find something interesting!"
                : "No events found. Create one to get started!"}
            </p>
            {selectedSport === "My Events" && (
              <button
                onClick={() => setSelectedSport("All")}
                className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
              >
                Browse All Events
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer relative"
                onClick={() => openEventDetail(event)}
              >
                <div className="relative h-56 overflow-hidden bg-gray-100">
                  <ImageCarousel images={event.images} />

                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-purple-600 z-10">
                    {event.sportType}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLike(event._id);
                    }}
                    className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-sm transition-all z-10 ${
                      likedEvents.has(event._id)
                        ? "bg-pink-500 text-white"
                        : "bg-white/90 text-gray-600 hover:bg-pink-500 hover:text-white"
                    }`}
                  >
                    <Heart
                      size={18}
                      fill={
                        likedEvents.has(event._id) ? "currentColor" : "none"
                      }
                    />
                  </button>

                  {event.creator && (
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 flex items-center gap-2 z-10">
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
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-2 flex-1">
                      {event.title}
                    </h3>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShareEvent(event._id, event.title);
                        }}
                        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
                        title="Share event"
                      >
                        <Share2 size={16} />
                      </button>
                      {isEventCreator(event) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event._id);
                          }}
                          className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                          title="Delete Event"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin
                        size={16}
                        className="text-purple-600 flex-shrink-0"
                      />
                      <span className="text-sm truncate">{event.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar
                        size={16}
                        className="text-purple-600 flex-shrink-0"
                      />
                      <span className="text-sm">
                        {new Date(event.time).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <Users
                        size={16}
                        className="text-purple-600 flex-shrink-0"
                      />
                      <span className="text-sm">
                        {event.attendees?.length || 0}
                        {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}{" "}
                        attending
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-green-600" />
                        <span className="font-bold text-lg text-gray-800">
                          {event.cost === 0 ? "Free" : `$${event.cost}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-500">
                        <Heart size={16} />
                        <span className="text-sm">{event.likes}</span>
                      </div>
                    </div>
                  </div>

                  {isRegisteredForEvent(event) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openUnregisterModal(event);
                      }}
                      className="w-full mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all duration-300 flex items-center justify-center gap-2 group"
                    >
                      <CheckCircle size={20} className="group-hover:scale-110 transition-transform" />
                      <span className="group-hover:hidden">Registered</span>
                      <span className="hidden group-hover:inline">Click to Unregister</span>
                    </button>
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

      {/* Bug Report Modal */}
      {showBugReportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <Bug className="text-orange-500" size={32} />
                <h2 className="text-2xl font-bold text-gray-800">
                  Report a Bug
                </h2>
              </div>
              <button
                onClick={() => setShowBugReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleBugReport} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Bug Title *
                </label>
                <input
                  type="text"
                  required
                  value={bugReportData.title}
                  onChange={(e) =>
                    setBugReportData({
                      ...bugReportData,
                      title: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  placeholder="Brief description of the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={bugReportData.description}
                  onChange={(e) =>
                    setBugReportData({
                      ...bugReportData,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                  rows="5"
                  placeholder="Please describe the bug in detail. Include steps to reproduce if possible..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Camera size={16} />
                  Screenshots (Optional, max 3)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBugScreenshotUpload}
                  disabled={bugReportData.screenshots.length >= 3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bugReportData.screenshots.length} / 3 screenshots uploaded
                </p>

                {bugReportData.screenshots.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {bugReportData.screenshots.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Screenshot ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setBugReportData({
                              ...bugReportData,
                              screenshots: bugReportData.screenshots.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Note:</strong> Your bug report will include your email
                  ({currentUser?.email}) so we can follow up if needed.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBugReportModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <Send size={18} />
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Detail Modal - CONTINUED... */}
      {showEventDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8">
            <div className="relative h-64">
              <ImageCarousel images={selectedEvent.images} />
              <button
                onClick={() => setShowEventDetailModal(false)}
                className="absolute top-4 right-4 p-2 bg-white rounded-full hover:bg-gray-100 z-10"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {selectedEvent.title}
                  </h2>
                  <span className="inline-block bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {selectedEvent.sportType}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-gray-800">
                    {selectedEvent.cost === 0
                      ? "Free"
                      : `$${selectedEvent.cost}`}
                  </div>
                  <div className="flex items-center gap-1 text-gray-500 justify-end mt-1">
                    <Heart size={16} />
                    <span className="text-sm">{selectedEvent.likes} likes</span>
                  </div>
                </div>
              </div>

              {/* Share button - visible for everyone */}
              <div className="mb-4">
                <button
                  onClick={() => handleShareEvent(selectedEvent._id, selectedEvent.title)}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Share2 size={18} />
                  Share Event Link
                </button>
              </div>

              {isEventCreator(selectedEvent) && (
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={() => handleEditEvent(selectedEvent)}
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Edit size={18} />
                    Edit Event
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent._id)}
                    className="flex-1 bg-red-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18} />
                    Delete Event
                  </button>
                </div>
              )}

              <p className="text-gray-700 mb-6">{selectedEvent.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Calendar className="text-purple-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Date & Time</p>
                    <p className="font-semibold">
                      {new Date(selectedEvent.time).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="text-purple-600" size={24} />
                  <div>
                    <p className="text-sm text-gray-600">Attendees</p>
                    <p className="font-semibold">
                      {selectedEvent.attendees?.length || 0}{" "}
                      {selectedEvent.maxAttendees
                        ? `/ ${selectedEvent.maxAttendees}`
                        : ""}{" "}
                      registered
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
                <GoogleMap
                  location={selectedEvent.location}
                  coordinates={selectedEvent.coordinates}
                />
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
                      <p className="font-semibold">
                        {selectedEvent.creator.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        @{selectedEvent.creator.username}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-bold mb-3">
                  Attendees ({selectedEvent.attendees?.length || 0}
                  {selectedEvent.maxAttendees ? ` / ${selectedEvent.maxAttendees}` : ""})
                </h3>
                {selectedEvent.attendees && selectedEvent.attendees.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.attendees.map((attendee) => (
                      <div
                        key={attendee._id}
                        className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-full"
                      >
                        <img
                          src={attendee.avatar}
                          alt={attendee.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-sm">{attendee.username}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No one has registered yet. Be the first!</p>
                )}
              </div>

              {/* Registration/Unregistration for everyone including creators */}
              {isRegisteredForEvent(selectedEvent) ? (
                <button
                  onClick={() => openUnregisterModal(selectedEvent)}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-xl font-semibold hover:from-orange-500 hover:to-red-500 transition-all flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  Unregister from Event
                </button>
              ) : !isEventCreator(selectedEvent) && (
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto my-8 p-6">
            <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b">
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
                    className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 cursor-pointer"
                    onClick={() =>
                      document.getElementById("profile-avatar-upload").click()
                    }
                  />
                  <label className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full cursor-pointer hover:bg-purple-700 transition-colors">
                    <Camera size={16} />
                    <input
                      id="profile-avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                      disabled={uploadingAvatar}
                    />
                  </label>
                </div>
                {uploadingAvatar && (
                  <p className="text-sm text-gray-600 mt-2">Uploading...</p>
                )}
              </div>

              <input
                type="text"
                placeholder="Name"
                value={profileFormData.name}
                onChange={(e) =>
                  setProfileFormData({
                    ...profileFormData,
                    name: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
              />

              <textarea
                placeholder="Bio"
                value={profileFormData.bio}
                onChange={(e) =>
                  setProfileFormData({
                    ...profileFormData,
                    bio: e.target.value,
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                rows="3"
              />

              {/* Location Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-1" />
                  Location
                </label>
                <PlacesAutocomplete
                  value={profileFormData.location?.address || ""}
                  onChange={(value) =>
                    setProfileFormData({
                      ...profileFormData,
                      location: { ...profileFormData.location, address: value },
                    })
                  }
                  onPlaceSelect={(location) => {
                    setProfileFormData({
                      ...profileFormData,
                      location: {
                        address: location.address,
                        coordinates: {
                          lat: location.lat,
                          lng: location.lng,
                        },
                      },
                    });
                  }}
                />
              </div>

              {/* Interests Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Sparkles size={16} className="inline mr-1" />
                  Interests
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Volleyball",
                    "Basketball",
                    "Soccer",
                    "Tennis",
                    "Yoga",
                    "Running",
                    "Cycling",
                    "Swimming",
                  ].map((sport) => (
                    <button
                      key={sport}
                      type="button"
                      onClick={() => {
                        const newInterests = profileFormData.interests?.includes(sport)
                          ? profileFormData.interests.filter((s) => s !== sport)
                          : [...(profileFormData.interests || []), sport];
                        setProfileFormData({
                          ...profileFormData,
                          interests: newInterests,
                        });
                      }}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        profileFormData.interests?.includes(sport)
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      {getSportEmoji(sport)} {sport}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 border-t">
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingAvatar}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create/Edit Event Modal - TRUNCATED FOR SPACE */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
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
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
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
                    onChange={(e) =>
                      setFormData({ ...formData, cost: e.target.value })
                    }
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
                    onChange={(e) =>
                      setFormData({ ...formData, maxAttendees: e.target.value })
                    }
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
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, sportType: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="">Select a sport</option>
                  {sportTypes
                    .filter((s) => s !== "All")
                    .map((sport) => (
                      <option key={sport} value={sport}>
                        {sport}
                      </option>
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
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  rows="3"
                  placeholder="Describe your event..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Camera size={16} />
                  Upload Event Images (Maximum 5)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleEventImageUpload}
                  disabled={uploadingImages || formData.images.length >= 5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.images.length} / 5 images uploaded
                </p>
                {uploadingImages && (
                  <p className="text-sm text-gray-600 mt-2">
                    Uploading images...
                  </p>
                )}

                {formData.images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              images: formData.images.filter(
                                (_, i) => i !== index,
                              ),
                            })
                          }
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
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
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || uploadingImages}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? editingEvent
                      ? "Updating..."
                      : "Creating..."
                    : editingEvent
                      ? "Update Event"
                      : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unregister Confirmation Modal */}
      {showUnregisterModal && eventToUnregister && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Confirm Unregister</h2>
              <button
                onClick={() => {
                  setShowUnregisterModal(false);
                  setEventToUnregister(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to unregister from this event?
              </p>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h3 className="font-bold text-lg text-purple-900 mb-2">
                  {eventToUnregister.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar size={16} className="text-purple-600" />
                  <span>
                    {new Date(eventToUnregister.time).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={16} className="text-purple-600" />
                  <span className="truncate">{eventToUnregister.location}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowUnregisterModal(false);
                  setEventToUnregister(null);
                }}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUnregister}
                className="flex-1 px-6 py-3 bg-yellow-500 text-white rounded-xl font-semibold hover:bg-yellow-600 transition-all"
              >
                Yes, Unregister
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px] animate-bounce-in">
            <CheckCircle size={24} className="flex-shrink-0" />
            <span className="font-semibold flex-1">{toast}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-green-700 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Profile Completion Prompt for Existing Users */}
      {showProfilePrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                ✨ Complete Your Profile
              </h2>
              <button
                onClick={() => setShowProfilePrompt(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 font-semibold mb-2">
                  🎉 New features available!
                </p>
                <p className="text-blue-700 text-sm">
                  Add your location and interests to get personalized event
                  recommendations!
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <MapPin className="text-purple-600" size={24} />
                  <div>
                    <p className="font-semibold">Add Location</p>
                    <p className="text-sm text-gray-600">See events near you</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Sparkles className="text-purple-600" size={24} />
                  <div>
                    <p className="font-semibold">Pick Interests</p>
                    <p className="text-sm text-gray-600">
                      Get personalized recommendations
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowProfilePrompt(false);
                    setShowProfileModal(true);
                  }}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Complete Profile
                </button>
                <button
                  onClick={() => setShowProfilePrompt(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bug Dashboard Modal */}
      {showBugDashboard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="sticky top-0 bg-white border-b p-6 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  🐛 Bug Reports ({bugs.length})
                </h2>
                <button
                  onClick={() => setShowBugDashboard(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pending Bugs */}
                <div>
                  <h3 className="font-bold text-lg mb-3 text-orange-600 flex items-center gap-2">
                    <span className="bg-orange-100 px-3 py-1 rounded-full text-sm">
                      Pending ({bugs.filter(b => b.status === 'pending').length})
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {bugs.filter(b => b.status === 'pending').map((bug) => (
                      <div
                        key={bug._id}
                        className="bg-orange-50 border border-orange-200 rounded-xl p-4"
                      >
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {bug.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {bug.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span>{bug.userName || 'Anonymous'}</span>
                          <span>•</span>
                          <span>{new Date(bug.timestamp).toLocaleDateString()}</span>
                        </div>
                        {bug.screenshots && bug.screenshots.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {bug.screenshots.map((screenshot, idx) => (
                              <img
                                key={idx}
                                src={screenshot}
                                alt="Bug screenshot"
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => handleBugStatusChange(bug._id, 'working')}
                          className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all"
                        >
                          Mark as In Progress
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* In Progress Bugs */}
                <div>
                  <h3 className="font-bold text-lg mb-3 text-blue-600 flex items-center gap-2">
                    <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">
                      In Progress ({bugs.filter(b => b.status === 'working').length})
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {bugs.filter(b => b.status === 'working').map((bug) => (
                      <div
                        key={bug._id}
                        className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                      >
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {bug.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {bug.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span>{bug.userName || 'Anonymous'}</span>
                          <span>•</span>
                          <span>{new Date(bug.timestamp).toLocaleDateString()}</span>
                        </div>
                        {bug.screenshots && bug.screenshots.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {bug.screenshots.map((screenshot, idx) => (
                              <img
                                key={idx}
                                src={screenshot}
                                alt="Bug screenshot"
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleBugStatusChange(bug._id, 'pending')}
                            className="flex-1 bg-orange-500 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all"
                          >
                            Back to Pending
                          </button>
                          <button
                            onClick={() => handleBugStatusChange(bug._id, 'resolved')}
                            className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-green-600 transition-all"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resolved Bugs */}
                <div>
                  <h3 className="font-bold text-lg mb-3 text-green-600 flex items-center gap-2">
                    <span className="bg-green-100 px-3 py-1 rounded-full text-sm">
                      Resolved ({bugs.filter(b => b.status === 'resolved').length})
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {bugs.filter(b => b.status === 'resolved').map((bug) => (
                      <div
                        key={bug._id}
                        className="bg-green-50 border border-green-200 rounded-xl p-4"
                      >
                        <h4 className="font-semibold text-gray-800 mb-2">
                          {bug.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {bug.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <span>{bug.userName || 'Anonymous'}</span>
                          <span>•</span>
                          <span>{new Date(bug.timestamp).toLocaleDateString()}</span>
                        </div>
                        {bug.screenshots && bug.screenshots.length > 0 && (
                          <div className="flex gap-2 mb-3">
                            {bug.screenshots.map((screenshot, idx) => (
                              <img
                                key={idx}
                                src={screenshot}
                                alt="Bug screenshot"
                                className="w-16 h-16 object-cover rounded border"
                              />
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => handleBugStatusChange(bug._id, 'working')}
                          className="w-full bg-blue-500 text-white py-2 px-3 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-all"
                        >
                          Reopen
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {bugs.length === 0 && (
                <div className="text-center py-12">
                  <Bug size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg">No bugs reported yet!</p>
                  <p className="text-gray-400 text-sm mt-2">
                    When users report bugs, they'll appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
