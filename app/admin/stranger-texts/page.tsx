'use client';

import { useEffect, useState } from 'react';

interface Contact {
  id: string;
  phone: string;
  name: string | null;
  status: string;
  subscription_status: string;
  onboarding_step: string | null;
  current_pairing_id: string | null;
  trial_ends_at: string | null;
  signed_up_at: string;
  last_message_at: string | null;
}

interface Pairing {
  id: string;
  contact_a_id: string;
  contact_b_id: string;
  week_start: string;
  status: string;
  contact_a_consent: boolean | null;
  contact_b_consent: boolean | null;
  created_at: string;
  contact_a?: { name: string | null; phone: string };
  contact_b?: { name: string | null; phone: string };
}

interface MessageLog {
  id: string;
  direction: string;
  message_text: string;
  message_type: string;
  created_at: string;
  dry_run: boolean;
}

interface AIDecision {
  id: string;
  decision_type: string;
  input_text: string;
  result: Record<string, unknown>;
  action_taken: string;
  created_at: string;
}

export default function StrangerTextsAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Expandable sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    pairings: true,
    contacts: true,
    quickActions: false,
  });

  // Expanded contact for details
  const [expandedContact, setExpandedContact] = useState<string | null>(null);
  const [contactMessages, setContactMessages] = useState<MessageLog[]>([]);
  const [contactDecisions, setContactDecisions] = useState<AIDecision[]>([]);

  // Filters
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [contactsRes, pairingsRes] = await Promise.all([
      fetch('/api/admin/stranger-texts?action=list_contacts'),
      fetch('/api/admin/stranger-texts?action=get_pairings'),
    ]);
    const contactsData = await contactsRes.json();
    const pairingsData = await pairingsRes.json();
    setContacts(contactsData.contacts || []);
    setPairings(pairingsData.pairings || []);
    setLoading(false);
  }

  async function toggleContactDetails(contact: Contact) {
    if (expandedContact === contact.id) {
      setExpandedContact(null);
      return;
    }

    setExpandedContact(contact.id);
    const [messagesRes, decisionsRes] = await Promise.all([
      fetch(`/api/admin/stranger-texts?action=get_messages&contact_id=${contact.id}`),
      fetch(`/api/admin/stranger-texts?action=get_decisions&contact_id=${contact.id}`),
    ]);
    const messagesData = await messagesRes.json();
    const decisionsData = await decisionsRes.json();
    setContactMessages(messagesData.messages || []);
    setContactDecisions(decisionsData.decisions || []);
  }

  async function performAction(action: string, contactId: string, params: Record<string, string> = {}) {
    setActionLoading(`${action}-${contactId}`);
    const queryParams = new URLSearchParams({ action, contact_id: contactId, ...params });
    const res = await fetch(`/api/admin/stranger-texts?${queryParams}`);
    const data = await res.json();
    if (!data.success) alert(`Action failed: ${data.error}`);
    await fetchData();
    setActionLoading(null);
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = !searchFilter ||
      c.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.phone.includes(searchFilter);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activePairings = pairings.filter(p => p.status === 'active');

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-700',
      trial: 'bg-blue-100 text-blue-700',
      onboarding: 'bg-yellow-100 text-yellow-700',
      waitlist: 'bg-purple-100 text-purple-700',
      new: 'bg-gray-100 text-gray-700',
      trial_expired: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const SectionHeader = ({ title, section, count }: { title: string; section: string; count?: number }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-t-xl border border-gray-200 transition-colors"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-gray-900">{title}</span>
        {count !== undefined && (
          <span className="px-2 py-0.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-full">{count}</span>
        )}
      </div>
      <svg
        className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections[section] ? 'rotate-180' : ''}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stranger Texts Admin</h1>
          <p className="text-sm text-gray-500">Manage pairings, contacts, and prompts</p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh All'}
        </button>
      </div>

      <div className="space-y-4">
        {/* Active Pairings Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <SectionHeader title="Active Pairings" section="pairings" count={activePairings.length} />
          {expandedSections.pairings && (
            <div className="border border-t-0 border-gray-200 rounded-b-xl">
              {activePairings.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No active pairings</div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {activePairings.map(pairing => (
                    <div key={pairing.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-pink-400 flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                              {pairing.contact_a?.name?.[0] || '?'}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                              {pairing.contact_b?.name?.[0] || '?'}
                            </div>
                          </div>
                          <div>
                            <span className="font-medium">{pairing.contact_a?.name || 'Unknown'}</span>
                            <span className="text-gray-400 mx-1">&</span>
                            <span className="font-medium">{pairing.contact_b?.name || 'Unknown'}</span>
                            <span className="text-gray-400 text-sm ml-2">• {formatDate(pairing.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => performAction('send_next_prompt', pairing.contact_a_id)}
                            disabled={actionLoading === `send_next_prompt-${pairing.contact_a_id}`}
                            className="px-3 py-1.5 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
                          >
                            {actionLoading === `send_next_prompt-${pairing.contact_a_id}` ? '...' : 'Send Prompt'}
                          </button>
                          <button
                            onClick={() => performAction('end_pairing', pairing.contact_a_id)}
                            disabled={actionLoading === `end_pairing-${pairing.contact_a_id}`}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 disabled:opacity-50"
                          >
                            End
                          </button>
                        </div>
                      </div>
                      {(pairing.contact_a_consent !== null || pairing.contact_b_consent !== null) && (
                        <div className="mt-2 text-sm text-gray-500">
                          Consent: {pairing.contact_a?.name}: {pairing.contact_a_consent === null ? '⏳' : pairing.contact_a_consent ? '✅' : '❌'} | {pairing.contact_b?.name}: {pairing.contact_b_consent === null ? '⏳' : pairing.contact_b_consent ? '✅' : '❌'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <SectionHeader title="Quick Actions" section="quickActions" />
          {expandedSections.quickActions && (
            <div className="border border-t-0 border-gray-200 rounded-b-xl p-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    const res = await fetch('/api/cron/send-prompt');
                    const data = await res.json();
                    alert(`Sent ${data.promptsSent || 0} prompts to ${data.pairingsProcessed || 0} pairings`);
                    await fetchData();
                  }}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
                >
                  Run: Send All Prompts
                </button>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/cron/week-end-check');
                    const data = await res.json();
                    alert(`Asked consent for ${data.consentAsked || 0} pairings`);
                    await fetchData();
                  }}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600"
                >
                  Run: Week End Check
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contacts Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <SectionHeader title="All Contacts" section="contacts" count={contacts.length} />
          {expandedSections.contacts && (
            <div className="border border-t-0 border-gray-200 rounded-b-xl">
              {/* Filters */}
              <div className="p-3 bg-gray-50 border-b border-gray-200 flex gap-3">
                <input
                  type="text"
                  placeholder="Search name or phone..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="waitlist">Waitlist</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                </select>
              </div>

              {/* Contacts List */}
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {filteredContacts.map(contact => (
                  <div key={contact.id}>
                    {/* Contact Row */}
                    <div
                      className={`p-3 hover:bg-gray-50 cursor-pointer ${expandedContact === contact.id ? 'bg-blue-50' : ''}`}
                      onClick={() => toggleContactDetails(contact)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg
                            className={`w-4 h-4 text-gray-400 transition-transform ${expandedContact === contact.id ? 'rotate-90' : ''}`}
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-medium">
                            {contact.name?.[0] || '?'}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{contact.name || 'Unknown'}</span>
                            <span className="text-gray-400 text-sm ml-2">{contact.phone}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(contact.status)}`}>
                            {contact.status}
                          </span>
                          {contact.current_pairing_id && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-purple-100 text-purple-700">paired</span>
                          )}
                          {(contact.status === 'trial' || contact.status === 'active') && !contact.current_pairing_id && (
                            <button
                              onClick={() => performAction('create_pairing', contact.id)}
                              disabled={!!actionLoading}
                              className="px-2 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
                            >
                              Pair
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm('Reset this user?')) performAction('reset_user', contact.id);
                            }}
                            disabled={!!actionLoading}
                            className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200 disabled:opacity-50"
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Contact Details */}
                    {expandedContact === contact.id && (
                      <div className="bg-gray-50 border-t border-gray-200 p-4">
                        <div className="grid grid-cols-3 gap-4">
                          {/* Info */}
                          <div className="space-y-2">
                            <h4 className="font-medium text-gray-700 text-sm">Details</h4>
                            <div className="text-sm space-y-1">
                              <p><span className="text-gray-500">Status:</span> {contact.status}</p>
                              <p><span className="text-gray-500">Subscription:</span> {contact.subscription_status || 'none'}</p>
                              <p><span className="text-gray-500">Onboarding:</span> {contact.onboarding_step || 'N/A'}</p>
                              <p><span className="text-gray-500">Trial ends:</span> {contact.trial_ends_at ? formatDate(contact.trial_ends_at) : 'N/A'}</p>
                              <p><span className="text-gray-500">Signed up:</span> {formatDate(contact.signed_up_at)}</p>
                            </div>
                            <div className="flex flex-wrap gap-1 pt-2">
                              <button
                                onClick={() => performAction('set_status', contact.id, { status: 'trial' })}
                                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                              >
                                Set Trial
                              </button>
                              <button
                                onClick={() => performAction('set_status', contact.id, { status: 'active' })}
                                className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                              >
                                Set Active
                              </button>
                              {contact.current_pairing_id && (
                                <>
                                  <button
                                    onClick={() => performAction('send_next_prompt', contact.id)}
                                    className="px-2 py-1 text-xs bg-orange-500 text-white rounded hover:bg-orange-600"
                                  >
                                    Send Prompt
                                  </button>
                                  <button
                                    onClick={() => performAction('end_pairing', contact.id)}
                                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                  >
                                    End Pairing
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Messages */}
                          <div>
                            <h4 className="font-medium text-gray-700 text-sm mb-2">Recent Messages</h4>
                            <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                              {contactMessages.length === 0 ? (
                                <p className="text-gray-400">No messages</p>
                              ) : (
                                contactMessages.slice(0, 10).map(msg => (
                                  <div
                                    key={msg.id}
                                    className={`p-2 rounded ${msg.direction === 'inbound' ? 'bg-white' : 'bg-blue-100'}`}
                                  >
                                    <div className="text-gray-400 text-[10px]">
                                      {msg.direction === 'inbound' ? '←' : '→'} {msg.message_type} • {formatDate(msg.created_at)}
                                      {msg.dry_run && <span className="text-orange-500 ml-1">[DRY]</span>}
                                    </div>
                                    <div className="text-gray-700 truncate">{msg.message_text}</div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          {/* AI Decisions */}
                          <div>
                            <h4 className="font-medium text-gray-700 text-sm mb-2">AI Decisions</h4>
                            <div className="max-h-48 overflow-y-auto space-y-1 text-xs">
                              {contactDecisions.length === 0 ? (
                                <p className="text-gray-400">No decisions</p>
                              ) : (
                                contactDecisions.slice(0, 10).map(dec => (
                                  <div key={dec.id} className="p-2 bg-white rounded">
                                    <div className="flex justify-between text-[10px]">
                                      <span className="text-purple-600 font-medium">{dec.decision_type}</span>
                                      <span className="text-gray-400">{formatDate(dec.created_at)}</span>
                                    </div>
                                    <div className="text-green-600">{dec.action_taken}</div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
