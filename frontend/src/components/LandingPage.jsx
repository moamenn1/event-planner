import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { eventAPI } from '../services/api';

function LandingPage({ user, onLogout, onShowSignUp, onShowSignIn }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, organized, invited
  const [filterStatus, setFilterStatus] = useState("all"); // all, upcoming, past
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: null,
    time: "10:00",
    location: "",
    description: "",
  });
  const [inviteModal, setInviteModal] = useState({ open: false, eventId: null });
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [attendeesData, setAttendeesData] = useState(null);

  // Load events on mount and when tab changes
  useEffect(() => {
    loadEvents();
  }, [activeTab]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      let data;
      if (activeTab === "organized") {
        data = await eventAPI.getMyOrganized();
      } else if (activeTab === "invited") {
        data = await eventAPI.getMyInvited();
      } else {
        data = await eventAPI.getAll();
      }
      setEvents(data);
    } catch (err) {
      console.error("Failed to load events:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId, response) => {
    if (!user) {
      alert("Please sign in to RSVP");
      return;
    }
    try {
      await eventAPI.rsvp(eventId, response);
      // Refresh events to get updated RSVP status
      await loadEvents();
    } catch (err) {
      console.error("Failed to RSVP:", err);
      alert(err.message);
    }
  };

  const getUserRSVP = (event) => {
    if (!user) return null;
    for (const [response, users] of Object.entries(event.rsvps)) {
      if (users.includes(user.username)) return response;
    }
    return null;
  };

  const openInviteModal = (eventId) => {
    setInviteModal({ open: true, eventId });
    setInviteUsername("");
    setInviteMsg("");
  };

  const closeInviteModal = () => {
    setInviteModal({ open: false, eventId: null });
    setInviteUsername("");
    setInviteMsg("");
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteUsername.trim()) {
      setInviteMsg("Please enter a username.");
      return;
    }
    try {
      // Split by comma and trim whitespace
      const usernames = inviteUsername.split(',').map(u => u.trim()).filter(u => u);
      await eventAPI.invite(inviteModal.eventId, usernames);
      setInviteMsg(`Invite sent to ${usernames.join(', ')}!`);
      setTimeout(() => {
        closeInviteModal();
        loadEvents(); // Refresh to show updated counts
      }, 1200);
    } catch (err) {
      console.error("Failed to send invite:", err);
      setInviteMsg(err.message);
    }
  };

  const handleViewAttendees = async (eventId) => {
    try {
      const data = await eventAPI.getAttendees(eventId);
      setAttendeesData(data);
      setShowAttendeesModal(true);
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
      alert('Failed to fetch attendees: ' + (err.message || 'Unknown error'));
    }
  };

  const closeAttendeesModal = () => {
    setShowAttendeesModal(false);
    setAttendeesData(null);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time || !form.location.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    try {
      const eventData = {
        title: form.title,
        date: form.date instanceof Date ? form.date.toISOString().split('T')[0] : form.date,
        time: form.time,
        location: form.location,
        description: form.description,
      };
      await eventAPI.create(eventData);
      setForm({ title: "", date: null, time: "10:00", location: "", description: "" });
      setShowCreateModal(false);
      // Reload events
      await loadEvents();
    } catch (err) {
      console.error("Failed to create event:", err);
      alert(err.message);
    }
  };

  const [deleteModal, setDeleteModal] = useState({ open: false, eventId: null });
  const handleDeleteEvent = (eventId) => {
    setDeleteModal({ open: true, eventId });
  };
  const confirmDeleteEvent = async () => {
    try {
      await eventAPI.delete(deleteModal.eventId);
      setDeleteModal({ open: false, eventId: null });
      // Reload events
      await loadEvents();
    } catch (err) {
      console.error("Failed to delete event:", err);
      alert(err.message);
      setDeleteModal({ open: false, eventId: null });
    }
  };
  const cancelDeleteEvent = () => {
    setDeleteModal({ open: false, eventId: null });
  };

  const isEventPast = (event) => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    const now = new Date();
    // Past means before today (ignore time)
    return eventDate < new Date(now.getFullYear(), now.getMonth(), now.getDate());
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadEvents();
      return;
    }
    try {
      setLoading(true);
      const results = await eventAPI.search(searchTerm);
      setEvents(results);
    } catch (err) {
      console.error("Search failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    // Filter by status
    if (filterStatus === 'past' && !isEventPast(event)) return false;
    if (filterStatus === 'upcoming' && isEventPast(event)) return false;

    return true;
  });

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container-fluid px-4">
          <a className="navbar-brand d-flex align-items-center" href="#">
            <div className="bg-primary text-white rounded-3 p-2 me-2" style={{ width: 40, height: 40 }}>
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z"/>
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
              </svg>
            </div>
            <span className="fw-bold fs-4">EventPlanner</span>
          </a>
          <div className="d-flex gap-2">
            {user ? (
              <>
                <span className="navbar-text me-3">Hi, {user.username}!</span>
                <button className="btn btn-outline-secondary rounded-pill px-3" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-link text-dark text-decoration-none" onClick={onShowSignIn}>Sign In</button>
                <button className="btn btn-primary rounded-pill px-4" onClick={onShowSignUp}>Sign Up</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3" style={{ color: "#5b7fe6" }}>Discover Amazing Events</h1>
          <p className="lead text-muted mb-4">
            Create, organize, and attend events effortlessly. Connect with people<br />
            who share your interests.
          </p>

          {/* Search and Create */}
          <div className="row justify-content-center align-items-center g-3 mb-4">
            <div className="col-md-6">
              <form onSubmit={handleSearch} className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 py-2"
                  placeholder="Search events by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                />
                <button type="submit" className="btn btn-primary">Search</button>
              </form>
            </div>
            <div className="col-auto">
              <div className="dropdown">
                <button className="btn btn-outline-primary rounded-pill px-4 dropdown-toggle" type="button" id="filtersDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                    <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                  </svg>
                  Filters
                </button>
                <ul className="dropdown-menu" aria-labelledby="filtersDropdown">
                  <li><button className={`dropdown-item${filterStatus === 'all' ? ' active' : ''}`} onClick={() => setFilterStatus('all')}>All</button></li>
                  <li><button className={`dropdown-item${filterStatus === 'upcoming' ? ' active' : ''}`} onClick={() => setFilterStatus('upcoming')}>Upcoming</button></li>
                  <li><button className={`dropdown-item${filterStatus === 'past' ? ' active' : ''}`} onClick={() => setFilterStatus('past')}>Past</button></li>
                </ul>
              </div>
            </div>
            {user && user.role === 'organizer' && (
              <div className="col-auto">
                <button className="btn btn-primary rounded-pill px-4" onClick={() => setShowCreateModal(true)}>
                  <span className="fs-5 me-1">+</span> Create Event
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Loading Display */}
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        {!loading && (
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Upcoming Events</h4>
            <div className="btn-group" role="group">
              <button
                className={`btn ${activeTab === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
            {user && user.role === 'organizer' && (
              <button
                className={`btn ${activeTab === 'organized' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('organized')}
              >
                Organized
              </button>
            )}
            {user && (
              <button
                className={`btn ${activeTab === 'invited' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setActiveTab('invited')}
              >
                Invited
              </button>
            )}
          </div>
        </div>
        )}

        {/* Event Cards */}
        {!loading && (
        <div className="row g-4">
          {filteredEvents.map(event => {
            const userRsvp = getUserRSVP(event);
            const isOrganizer = user && event.organizer === user.username;
            const userIsAttendee = user && (userRsvp === 'going' || userRsvp === 'maybe');
            const userIsNotGoing = user && userRsvp === 'pass';
            
            // Debug logging
            if (event.title === 'aaaa' || event.title === 'adada') {
              console.log('Event:', event.title);
              console.log('  event.organizer:', event.organizer);
              console.log('  user.username:', user?.username);
              console.log('  isOrganizer:', isOrganizer);
            }

            return (
              <div className="col-md-6 col-lg-4" key={event.id}>
                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h5 className="card-title fw-bold mb-0">{event.title}</h5>
                      {(isOrganizer || userIsAttendee || userIsNotGoing) && (
                        <span className={`badge ${isOrganizer ? 'bg-primary' : userIsAttendee ? 'bg-info' : 'bg-secondary'} rounded-pill`}>
                          {isOrganizer ? 'organizer' : userIsAttendee ? 'attendee' : 'not going'}
                        </span>
                      )}
                    </div>

                    <div className="text-muted small mb-2">
                      <svg width="14" height="14" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5z"/>
                      </svg>
                      {event.date} • {event.time}
                    </div>

                    <div className="text-muted small mb-2">
                      <svg width="14" height="14" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
                      </svg>
                      {event.location}
                    </div>

                    <div className="text-muted small mb-3">
                      <svg width="14" height="14" fill="currentColor" className="me-2" viewBox="0 0 16 16">
                        <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                        <path fillRule="evenodd" d="M5.216 14A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216z"/>
                        <path d="M4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/>
                      </svg>
                      {event.rsvps?.going?.length || 0} going • {event.attendees?.length || 0} invited
                    </div>

                    {/* RSVP Buttons */}
                    {user && !isOrganizer && (
                      <div className="d-flex gap-2 mt-3">
                        <button
                          className={`btn btn-sm rounded-pill flex-fill ${userRsvp === 'going' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleRSVP(event.id, 'going')}
                        >
                          Going
                        </button>
                        <button
                          className={`btn btn-sm rounded-pill flex-fill ${userRsvp === 'maybe' ? 'btn-primary' : 'btn-outline-primary'}`}
                          onClick={() => handleRSVP(event.id, 'maybe')}
                        >
                          Maybe
                        </button>
                        <button
                          className={`btn btn-sm rounded-pill flex-fill ${userRsvp === 'pass' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                          onClick={() => handleRSVP(event.id, 'pass')}
                        >
                          Pass
                        </button>
                      </div>
                    )}

                    {/* Organizer Actions */}
                    {isOrganizer && (
                      <div className="d-flex flex-column gap-2 mt-3">
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill flex-fill"
                            onClick={() => openInviteModal(event.id)}
                          >
                            Invite
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger rounded-pill flex-fill"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            Cancel
                          </button>
                        </div>
                        <button
                          className="btn btn-sm btn-info rounded-pill w-100"
                          onClick={() => handleViewAttendees(event.id)}
                          disabled={!event.attendees || event.attendees.length === 0}
                        >
                          {event.attendees && event.attendees.length > 0 
                            ? `View Attendees (${event.attendees.length})` 
                            : 'No Attendees Yet'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center text-muted py-5">
            <p className="fs-5">No events found</p>
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCreateModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Create New Event</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleCreateEvent}>
                  <div className="mb-3">
                    <label className="form-label">Event Title</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label className="form-label">Date</label>
                      <DatePicker
                        selected={form.date}
                        onChange={(date) => setForm({ ...form, date })}
                        className="form-control rounded-3"
                        calendarClassName="rounded-4 custom-datepicker"
                        placeholderText="Select date"
                        required
                        dateFormat="MMM dd, yyyy"
                        minDate={new Date()}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Time</label>
                      <input
                        type="time"
                        className="form-control rounded-3"
                        value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control rounded-3"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description (optional)</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="3"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary rounded-pill px-4 flex-fill">Create Event</button>
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModal.open && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeInviteModal}>
          <div className="modal-dialog modal-dialog-centered modal-sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Invite User</h5>
                <button type="button" className="btn-close" onClick={closeInviteModal}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSendInvite}>
                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control rounded-3"
                      placeholder="Enter username"
                      value={inviteUsername}
                      onChange={(e) => setInviteUsername(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {inviteMsg && <div className="text-success mb-2 small">{inviteMsg}</div>}
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary rounded-pill px-4 flex-fill">Send Invite</button>
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={closeInviteModal}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={cancelDeleteEvent}>
          <div className="modal-dialog modal-dialog-centered modal-sm" onClick={e => e.stopPropagation()}>
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Cancel Event</h5>
                <button type="button" className="btn-close" onClick={cancelDeleteEvent}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to cancel this event?</p>
                <div className="d-flex gap-2 mt-3">
                  <button className="btn btn-danger rounded-pill px-4 flex-fill" onClick={confirmDeleteEvent}>Yes, Cancel</button>
                  <button className="btn btn-outline-secondary rounded-pill px-4 flex-fill" onClick={cancelDeleteEvent}>No</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendees Modal */}
      {showAttendeesModal && attendeesData && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={closeAttendeesModal}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{attendeesData.event_title} - Attendee Details</h5>
                <button type="button" className="btn-close" onClick={closeAttendeesModal}></button>
              </div>
              <div className="modal-body">
                {/* Summary Stats */}
                <div className="mb-3 p-3 bg-light rounded-3">
                  <div className="row text-center">
                    <div className="col-3">
                      <div className="fw-bold fs-4">{attendeesData.total_invited}</div>
                      <div className="small text-muted">Invited</div>
                    </div>
                    <div className="col-3">
                      <div className="fw-bold fs-4 text-success">{attendeesData.total_going}</div>
                      <div className="small text-muted">Going</div>
                    </div>
                    <div className="col-3">
                      <div className="fw-bold fs-4 text-warning">{attendeesData.total_maybe}</div>
                      <div className="small text-muted">Maybe</div>
                    </div>
                    <div className="col-3">
                      <div className="fw-bold fs-4 text-danger">{attendeesData.total_not_going}</div>
                      <div className="small text-muted">Not Going</div>
                    </div>
                  </div>
                </div>

                {/* Attendee List */}
                <div className="mb-3">
                  <h6 className="mb-3">Attendee List ({attendeesData.attendees.length} people):</h6>
                  {attendeesData.attendees.length === 0 ? (
                    <p className="text-muted text-center p-3">No users invited yet.</p>
                  ) : (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <ul className="list-group">
                        {attendeesData.attendees.map((attendee, idx) => (
                          <li key={idx} className="list-group-item d-flex justify-content-between align-items-center rounded-3 mb-2 border">
                            <span className="fw-semibold">{attendee.username}</span>
                            <span className={`badge rounded-pill px-3 ${
                              attendee.status === 'going' ? 'bg-success' :
                              attendee.status === 'maybe' ? 'bg-warning text-dark' :
                              attendee.status === 'not going' ? 'bg-danger' :
                              'bg-secondary'
                            }`}>
                              {attendee.status === 'no response' ? 'No Response' : attendee.status.charAt(0).toUpperCase() + attendee.status.slice(1)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4 w-100" onClick={closeAttendeesModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;
