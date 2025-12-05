import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { eventAPI } from '../services/api';

function Dashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [inviteModal, setInviteModal] = useState({ open: false, eventId: null });
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: null, // Date object
    time: "21:00", // string, e.g. '21:00'
    location: "",
    description: ""
  });
  const [formError, setFormError] = useState("");
  const [showBackAfterCreate, setShowBackAfterCreate] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendeesData, setAttendeesData] = useState(null);
  const [showAttendeesModal, setShowAttendeesModal] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      if (user.role === 'organizer') {
        const data = await eventAPI.getMyOrganized();
        setEvents(data);
      } else {
        const data = await eventAPI.getMyInvited();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  };

  const openInviteModal = (eventId) => {
    setInviteModal({ open: true, eventId });
    setInviteUsername("");
    setInviteMsg("");
    setInviteError("");
  };

  const closeInviteModal = () => {
    setInviteModal({ open: false, eventId: null });
    setInviteUsername("");
    setInviteMsg("");
    setInviteError("");
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setInviteError("");
    setInviteMsg("");
    
    if (!inviteUsername.trim()) {
      setInviteError("Please enter a username.");
      return;
    }

    try {
      await eventAPI.invite(inviteModal.eventId, [inviteUsername.trim()]);
      setInviteMsg(`Invite sent to ${inviteUsername}!`);
      setTimeout(() => {
        closeInviteModal();
        fetchEvents(); // Refresh events to show updated attendee count
      }, 1200);
    } catch (err) {
      setInviteError(err.message || 'Failed to send invite');
    }
  };

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleDateChange = date => {
    setForm({ ...form, date });
  };
  const handleTimeChange = e => {
    setForm({ ...form, time: e.target.value });
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time || !form.location.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setFormError("");

    try {
      // Format date as YYYY-MM-DD for backend
      const formattedDate = form.date.toISOString().split('T')[0];
      
      await eventAPI.create({
        title: form.title,
        date: formattedDate,
        time: form.time,
        location: form.location,
        description: form.description || ""
      });

      // Reset form and refresh events
      setForm({ title: "", date: null, time: "21:00", location: "", description: "" });
      setShowForm(false);
      setShowBackAfterCreate(true);
      await fetchEvents();
    } catch (err) {
      setFormError(err.message || 'Failed to create event');
    }
  };

  const handleViewAttendees = async (eventId) => {
    try {
      const data = await eventAPI.getAttendees(eventId);
      setSelectedEvent(eventId);
      setAttendeesData(data);
      setShowAttendeesModal(true);
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
      alert('Failed to fetch attendees: ' + (err.message || 'Unknown error'));
    }
  };

  const closeAttendeesModal = () => {
    setShowAttendeesModal(false);
    setSelectedEvent(null);
    setAttendeesData(null);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      await eventAPI.delete(eventId);
      await fetchEvents();
    } catch (err) {
      alert('Failed to delete event: ' + (err.message || 'Unknown error'));
    }
  };

    return (
      <div className="dashboard-bg min-vh-100 d-flex align-items-center justify-content-center">
        <div className="dashboard-card card shadow-lg p-4 rounded-5 border-0 w-100" style={{ maxWidth: 480, background: '#fff' }}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold mb-0">Welcome, {user.username}!</h2>
            <button className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold" onClick={onLogout}>Logout</button>
          </div>
          {user.role === 'organizer' && (
            <>
              <button className="btn btn-primary mb-4 rounded-pill px-4 py-2 fs-5 fw-semibold" style={{minWidth: 180}} onClick={() => { setShowForm(f => !f); setShowBackAfterCreate(false); }}>
                {showForm ? "Cancel" : "Create Event"}
              </button>
              {showForm && (
                <form className="card p-4 mb-4 rounded-4 shadow-sm border-0" onSubmit={handleCreateEvent} style={{background: '#f8fafd'}}>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input name="title" className="form-control rounded-3" value={form.title} onChange={handleFormChange} required />
                  </div>
                  <div className="mb-3 row align-items-center">
                    <div className="col">
                      <label className="form-label">Date</label>
                      <DatePicker
                        selected={form.date}
                        onChange={handleDateChange}
                        className="form-control rounded-3"
                        calendarClassName="rounded-4 custom-datepicker"
                        placeholderText="Select date"
                        required
                        dateFormat="yyyy-MM-dd"
                        minDate={new Date()}
                      />
                    </div>
                    <div className="col">
                      <label className="form-label">Time</label>
                      <input
                        name="time"
                        type="time"
                        className="form-control rounded-3"
                        value={form.time}
                        onChange={handleTimeChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input name="location" className="form-control rounded-3" value={form.location} onChange={handleFormChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea name="description" className="form-control rounded-3" value={form.description} onChange={handleFormChange} />
                  </div>
                  {formError && <div className="text-danger mb-2">{formError}</div>}
                  <button className="btn btn-success w-100 rounded-pill fs-5 fw-semibold py-2" type="submit">Create</button>
                </form>
              )}
              {showBackAfterCreate && !showForm && (
                <button className="btn btn-outline-primary mb-4 rounded-pill px-4 py-2 fw-semibold" style={{minWidth: 180}} onClick={() => { setShowForm(true); setShowBackAfterCreate(false); }}>
                  Back to Create Event
                </button>
              )}
              <h5 className="mt-4 mb-3">Upcoming Events</h5>
              {events.length === 0 ? (
                <div className="text-muted rounded-3 p-3 bg-light">No events yet.</div>
              ) : (
                <ul className="list-group mb-3 border-0">
                  {events.map(ev => {
                    const totalInvited = ev.attendees?.length || 0;
                    const totalGoing = ev.rsvps?.going?.length || 0;
                    
                    return (
                      <li key={ev.id} className="list-group-item rounded-4 mb-3 shadow-sm border-0 p-3 position-relative">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="fw-bold fs-5">{ev.title}</div>
                          {user.role === 'organizer' && (
                            <button className="btn btn-outline-primary btn-sm rounded-pill px-3" type="button" title="Invite" onClick={() => openInviteModal(ev.id)}>Invite</button>
                          )}
                        </div>
                        <div className="mb-1"><span className="fw-semibold">date:</span> {ev.date}</div>
                        <div className="mb-1"><span className="fw-semibold">time:</span> {ev.time}</div>
                        <div className="mb-1"><span className="fw-semibold">location:</span> {ev.location}</div>
                        {ev.description && <div className="small text-muted mt-2">{ev.description}</div>}
                        {user.role === 'organizer' && (
                          <div className="mt-3">
                            <div className="mb-2">
                              <span className="badge bg-primary me-2">Invited: {totalInvited}</span>
                              <span className="badge bg-success">Going: {totalGoing}</span>
                            </div>
                            <div className="d-flex gap-2">
                              <button
                                className="btn btn-info btn-sm rounded-pill px-3"
                                type="button"
                                onClick={() => handleViewAttendees(ev.id)}
                                disabled={totalInvited === 0}
                              >
                                {totalInvited > 0 ? 'View Attendees' : 'No Invites Yet'}
                              </button>
                              <button
                                className="btn btn-danger btn-sm rounded-pill px-3"
                                type="button"
                                onClick={() => handleDeleteEvent(ev.id)}
                              >
                                Delete Event
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}

          {/* Invite Modal (always rendered at dashboard level) */}
          {inviteModal.open && (
            <div className="modal-backdrop-custom">
              <div className="modal-dialog-custom card p-4 rounded-4 shadow-lg border-0">
                <h5 className="mb-3">Invite User</h5>
                <form onSubmit={handleSendInvite}>
                  <input
                    type="text"
                    className="form-control mb-2 rounded-3"
                    placeholder="Enter username"
                    value={inviteUsername}
                    onChange={e => setInviteUsername(e.target.value)}
                    autoFocus
                  />
                  {inviteMsg && <div className="text-success mb-2">{inviteMsg}</div>}
                  {inviteError && <div className="text-danger mb-2">{inviteError}</div>}
                  <div className="d-flex gap-2 mt-2">
                    <button type="submit" className="btn btn-primary rounded-pill px-4">Send Invite</button>
                    <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={closeInviteModal}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Attendees Modal */}
          {showAttendeesModal && attendeesData && (
            <div className="modal-backdrop-custom">
              <div className="modal-dialog-custom card p-4 rounded-4 shadow-lg border-0" style={{ maxWidth: 600 }}>
                <h5 className="mb-3">{attendeesData.event_title} - Attendee Details</h5>
                
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
                          <li key={idx} className="list-group-item d-flex justify-content-between align-items-center rounded-3 mb-2">
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
                
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={closeAttendeesModal}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
}

export default Dashboard;
