import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";

function Dashboard({ user, onLogout }) {
  const [events, setEvents] = useState([]);
  const [inviteModal, setInviteModal] = useState({ open: false, eventId: null });
  const [inviteUsername, setInviteUsername] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
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
    // Fetch events organized by the user
    const fetchEvents = async () => {
      try {
        const response = await axios.get('/api/events');
        setEvents(response.data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };

    fetchEvents();
  }, []);

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

  const handleFormChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleDateChange = date => {
    setForm({ ...form, date });
  };
  const handleTimeChange = e => {
    setForm({ ...form, time: e.target.value });
  };

  const handleCreateEvent = e => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.time || !form.location.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setFormError("");
    setEvents([
      ...events,
      {
        ...form,
        id: Date.now(),
        organizer: user.username,
        attendees: [],
      }
    ]);
    setForm({ title: "", date: null, time: "10:00", location: "", description: "" });
    setShowForm(false);
    setShowBackAfterCreate(true);
  };

  const handleViewInvites = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/events/${eventId}/attendees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSelectedEvent(eventId);
      setAttendeesData(response.data);
      setShowAttendeesModal(true);
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
      alert('Failed to fetch attendees: ' + (err.response?.data?.detail || err.message));
    }
  };

  const closeAttendeesModal = () => {
    setShowAttendeesModal(false);
    setSelectedEvent(null);
    setAttendeesData(null);
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
                  {events.map(ev => (
                    <li key={ev.id} className="list-group-item rounded-4 mb-3 shadow-sm border-0 p-3 position-relative">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="fw-bold fs-5">{ev.title}</div>
                        {user.role === 'organizer' && (
                          <button className="btn btn-outline-primary btn-sm rounded-pill px-3" type="button" title="Invite" onClick={() => openInviteModal(ev.id)}>Invite</button>
                        )}
                      </div>
                      <div className="mb-1"><span className="fw-semibold">date:</span> {ev.date instanceof Date ? ev.date.toLocaleDateString() : ev.date}</div>
                      <div className="mb-1"><span className="fw-semibold">time:</span> {ev.time}</div>
                      <div className="mb-1"><span className="fw-semibold">location:</span> {ev.location}</div>
                      {ev.description && <div className="small text-muted mt-2">{ev.description}</div>}
                      {user.role === 'organizer' && (
                        <div className="d-flex gap-2 mt-2">
                          <button
                            className="btn btn-info btn-sm rounded-pill px-3"
                            type="button"
                            onClick={() => handleViewInvites(ev.id)}
                          >
                            View Invites
                          </button>
                          <button
                            className="btn btn-danger btn-sm rounded-pill px-3"
                            type="button"
                            onClick={() => setEvents(events.filter(e => e.id !== ev.id))}
                          >
                            Delete Event
                          </button>
                        </div>
                      )}
                    </li>
                  ))}
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
              <div className="modal-dialog-custom card p-4 rounded-4 shadow-lg border-0" style={{ maxWidth: 500 }}>
                <h5 className="mb-3">{attendeesData.event_title} - Invites</h5>
                <div className="mb-3">
                  <p className="mb-1"><strong>Total Invited:</strong> {attendeesData.total_invited}</p>
                  <p className="mb-1"><strong>Going:</strong> {attendeesData.total_going}</p>
                  <p className="mb-1"><strong>Maybe:</strong> {attendeesData.total_maybe}</p>
                  <p className="mb-1"><strong>Not Going:</strong> {attendeesData.total_not_going}</p>
                </div>
                <div className="mb-3">
                  <h6>Invited Users:</h6>
                  {attendeesData.attendees.length === 0 ? (
                    <p className="text-muted">No users invited yet.</p>
                  ) : (
                    <ul className="list-group">
                      {attendeesData.attendees.map((attendee, idx) => (
                        <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                          <span>{attendee.username}</span>
                          <span className={`badge ${
                            attendee.status === 'going' ? 'bg-success' :
                            attendee.status === 'maybe' ? 'bg-warning' :
                            attendee.status === 'not going' ? 'bg-danger' :
                            'bg-secondary'
                          }`}>
                            {attendee.status}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={closeAttendeesModal}>Close</button>
              </div>
            </div>
          )}

          {selectedEvent && (
        <div>
          <h3>Invites for Event {selectedEvent}</h3>
          <ul>
            {invites.map((invite) => (
              <li key={invite.id}>{invite.email} - {invite.status}</li>
            ))}
          </ul>
        </div>
      )}
        </div>
      </div>
    );
}

export default Dashboard;
