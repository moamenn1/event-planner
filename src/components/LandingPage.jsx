import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function LandingPage({ user, onLogout, onShowSignUp, onShowSignIn }) {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Tech Conference 2024",
      date: "Dec 28, 2024",
      time: "10:00 AM",
      location: "San Francisco, CA",
      organizer: "john_organizer",
      attendees: 124,
      rsvps: { going: [], maybe: [], pass: [] },
    },
    {
      id: 2,
      title: "Design Meetup",
      date: "Jan 5, 2025",
      time: "6:00 PM",
      location: "New York, NY",
      organizer: "jane_designer",
      attendees: 45,
      rsvps: { going: [], maybe: [], pass: [] },
    },
    {
      id: 3,
      title: "Startup Networking",
      date: "Jan 12, 2025",
      time: "7:00 PM",
      location: "Austin, TX",
      organizer: "alex_startup",
      attendees: 89,
      rsvps: { going: [], maybe: [], pass: [] },
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // all, organized, invited
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

  const handleRSVP = (eventId, response) => {
    if (!user) {
      alert("Please sign in to RSVP");
      return;
    }
    setEvents(events.map(event => {
      if (event.id === eventId) {
        const newRsvps = { ...event.rsvps };
        // Remove user from all RSVP lists
        Object.keys(newRsvps).forEach(key => {
          newRsvps[key] = newRsvps[key].filter(u => u !== user.username);
        });
        // Add to selected response
        newRsvps[response].push(user.username);
        return { ...event, rsvps: newRsvps };
      }
      return event;
    }));
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

  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteUsername.trim()) {
      setInviteMsg("Please enter a username.");
      return;
    }
    // Mock: Add invite to event (not persisted)
    setInviteMsg(`Invite sent to ${inviteUsername}!`);
    setTimeout(closeInviteModal, 1200);
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time || !form.location.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    const newEvent = {
      id: Date.now(),
      title: form.title,
      date: form.date instanceof Date ? form.date.toLocaleDateString() : form.date,
      time: form.time,
      location: form.location,
      description: form.description,
      organizer: user.username,
      attendees: 0,
      rsvps: { going: [], maybe: [], pass: [] },
    };
    setEvents([...events, newEvent]);
    setForm({ title: "", date: null, time: "10:00", location: "", description: "" });
    setShowCreateModal(false);
  };

  const [deleteModal, setDeleteModal] = useState({ open: false, eventId: null });
  const handleDeleteEvent = (eventId) => {
    setDeleteModal({ open: true, eventId });
  };
  const confirmDeleteEvent = () => {
    setEvents(events.filter(e => e.id !== deleteModal.eventId));
    setDeleteModal({ open: false, eventId: null });
  };
  const cancelDeleteEvent = () => {
    setDeleteModal({ open: false, eventId: null });
  };

  const filteredEvents = events.filter(event => {
    // Filter by search term
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          event.location.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    // Filter by tab
    if (!user) return activeTab === "all";
    if (activeTab === "organized") {
      return event.organizer === user.username;
    } else if (activeTab === "invited") {
      return getUserRSVP(event) !== null;
    }
    return true; // all
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
              <div className="input-group shadow-sm">
                <span className="input-group-text bg-white border-end-0">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                  </svg>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 py-2"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-auto">
              <button className="btn btn-outline-primary rounded-pill px-4">
                <svg width="16" height="16" fill="currentColor" className="me-1" viewBox="0 0 16 16">
                  <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/>
                </svg>
                Filters
              </button>
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

        {/* Tabs */}
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

        {/* Event Cards */}
        <div className="row g-4">
          {filteredEvents.map(event => {
            const userRsvp = getUserRSVP(event);
            const isOrganizer = user && event.organizer === user.username;
            const userIsAttendee = user && (userRsvp === 'going' || userRsvp === 'maybe');
            const userIsNotGoing = user && userRsvp === 'pass';

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
                      {event.attendees} attending
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
                      <div className="d-flex gap-2 mt-3">
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
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
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
    </div>
  );
}

export default LandingPage;
