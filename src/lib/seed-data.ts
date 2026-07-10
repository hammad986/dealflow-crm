import type { Client, Deal, Activity, FollowUpTask, PipelineStage } from './types';

export const defaultStages: PipelineStage[] = [
  { id: 'new_lead', name: 'New Lead', color: '#71717a', order: 0 },
  { id: 'contacted', name: 'Contacted', color: '#3b82f6', order: 1 },
  { id: 'proposal_sent', name: 'Proposal Sent', color: '#a855f7', order: 2 },
  { id: 'negotiation', name: 'Negotiation', color: '#f59e0b', order: 3 },
  { id: 'won', name: 'Won', color: '#22c55e', order: 4 },
  { id: 'lost', name: 'Lost', color: '#ef4444', order: 5 },
];

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000).toISOString();
const monthsAgo = (n: number) => new Date(now.getTime() - n * 30 * 86400000).toISOString();

export const demoClients: Client[] = [
  { id: 'c1', name: 'Rohan Mehta', company: 'TechNova Solutions', email: 'rohan@technova.in', phone: '+91 98765 43210', leadSource: 'LinkedIn', tags: ['SaaS', 'Enterprise'], notes: 'Looking for CRM integration with their existing ERP system.', createdAt: daysAgo(45) },
  { id: 'c2', name: 'Priya Sharma', company: 'GreenLeaf Organics', email: 'priya@greenleaf.com', phone: '+91 98765 43211', leadSource: 'Referral', tags: ['E-commerce', 'Organic'], notes: 'Wants to scale their online presence. Budget approved.', createdAt: daysAgo(38) },
  { id: 'c3', name: 'Arjun Kapoor', company: 'Kapoor Real Estate', email: 'arjun@kapoorestate.in', phone: '+91 98765 43212', leadSource: 'Cold Outreach', tags: ['Real Estate', 'Premium'], notes: 'High-value client, interested in property listing platform.', createdAt: daysAgo(52) },
  { id: 'c4', name: 'Dr. Sunita Patel', company: 'HealthFirst Clinics', email: 'sunita@healthfirst.in', phone: '+91 98765 43213', leadSource: 'Website', tags: ['Healthcare', 'Clinic'], notes: 'Needs patient management system with appointment booking.', createdAt: daysAgo(30) },
  { id: 'c5', name: 'Vikram Singh', company: 'EduPro Learning', email: 'vikram@edupro.com', phone: '+91 98765 43214', leadSource: 'LinkedIn', tags: ['Education', 'EdTech'], notes: 'Building an LMS platform for K-12 schools.', createdAt: daysAgo(25) },
  { id: 'c6', name: 'Anita Desai', company: 'StyleMart Retail', email: 'anita@stylemart.in', phone: '+91 98765 43215', leadSource: 'Referral', tags: ['Retail', 'Fashion'], notes: 'Omnichannel retail solution. Multiple store locations.', createdAt: daysAgo(41) },
  { id: 'c7', name: 'Rajesh Gupta', company: 'ConsultPro Advisors', email: 'rajesh@consultpro.in', phone: '+91 98765 43216', leadSource: 'WhatsApp', tags: ['Consulting', 'B2B'], notes: 'Needs client portal and project tracking system.', createdAt: daysAgo(35) },
  { id: 'c8', name: 'Meera Reddy', company: 'SpiceRoute Foods', email: 'meera@spiceroute.in', phone: '+91 98765 43217', leadSource: 'Cold Outreach', tags: ['Food', 'D2C'], notes: 'Direct-to-consumer food delivery platform.', createdAt: daysAgo(28) },
  { id: 'c9', name: 'Karan Malhotra', company: 'FinEdge Fintech', email: 'karan@finedge.in', phone: '+91 98765 43218', leadSource: 'Website', tags: ['Fintech', 'Startup'], notes: 'Payment gateway integration and financial dashboard.', createdAt: daysAgo(20) },
  { id: 'c10', name: 'Neha Joshi', company: 'CloudWeave Technologies', email: 'neha@cloudweave.in', phone: '+91 98765 43219', leadSource: 'LinkedIn', tags: ['Cloud', 'SaaS'], notes: 'DevOps consulting and cloud migration services.', createdAt: daysAgo(15) },
];

export const demoDeals: Deal[] = [
  // New Lead (3 deals)
  { id: 'd1', clientId: 'c1', title: 'CRM Integration Project', value: 35000, currency: 'INR', stageId: 'new_lead', expectedCloseDate: daysAgo(-30), createdAt: daysAgo(10), stageEnteredAt: daysAgo(10) },
  { id: 'd2', clientId: 'c3', title: 'Property Platform Development', value: 28000, currency: 'INR', stageId: 'new_lead', expectedCloseDate: daysAgo(-45), createdAt: daysAgo(8), stageEnteredAt: daysAgo(8) },
  { id: 'd3', clientId: 'c8', title: 'Food Delivery App', value: 15000, currency: 'INR', stageId: 'new_lead', expectedCloseDate: daysAgo(-20), createdAt: daysAgo(5), stageEnteredAt: daysAgo(5) },
  // Contacted (3 deals)
  { id: 'd4', clientId: 'c2', title: 'E-commerce Platform Upgrade', value: 45000, currency: 'INR', stageId: 'contacted', expectedCloseDate: daysAgo(-25), createdAt: daysAgo(20), stageEnteredAt: daysAgo(12) },
  { id: 'd5', clientId: 'c5', title: 'LMS Platform Build', value: 60000, currency: 'INR', stageId: 'contacted', expectedCloseDate: daysAgo(-60), createdAt: daysAgo(18), stageEnteredAt: daysAgo(8) },
  { id: 'd6', clientId: 'c7', title: 'Client Portal Development', value: 20000, currency: 'INR', stageId: 'contacted', expectedCloseDate: daysAgo(-35), createdAt: daysAgo(15), stageEnteredAt: daysAgo(6) },
  // Proposal Sent (2 deals)
  { id: 'd7', clientId: 'c4', title: 'Patient Management System', value: 95000, currency: 'INR', stageId: 'proposal_sent', expectedCloseDate: daysAgo(-15), createdAt: daysAgo(25), stageEnteredAt: daysAgo(5) },
  { id: 'd8', clientId: 'c6', title: 'Omnichannel Retail Solution', value: 35000, currency: 'INR', stageId: 'proposal_sent', expectedCloseDate: daysAgo(-40), createdAt: daysAgo(30), stageEnteredAt: daysAgo(7) },
  // Negotiation (1 deal)
  { id: 'd9', clientId: 'c10', title: 'Cloud Migration Services', value: 50000, currency: 'INR', stageId: 'negotiation', expectedCloseDate: daysAgo(-10), createdAt: daysAgo(12), stageEnteredAt: daysAgo(3) },
  // Won (4 deals - spread across last 4 months)
  { id: 'd10', clientId: 'c2', title: 'Website Redesign', value: 25000, currency: 'INR', stageId: 'won', expectedCloseDate: daysAgo(-10), createdAt: monthsAgo(3.5), stageEnteredAt: monthsAgo(3), wonAt: monthsAgo(2.8) },
  { id: 'd11', clientId: 'c9', title: 'Payment Dashboard', value: 45000, currency: 'INR', stageId: 'won', expectedCloseDate: daysAgo(-20), createdAt: monthsAgo(2.5), stageEnteredAt: monthsAgo(2.2), wonAt: monthsAgo(2) },
  { id: 'd12', clientId: 'c1', title: 'API Development', value: 60000, currency: 'INR', stageId: 'won', expectedCloseDate: daysAgo(-30), createdAt: monthsAgo(1.8), stageEnteredAt: monthsAgo(1.5), wonAt: monthsAgo(1.2) },
  { id: 'd13', clientId: 'c5', title: 'Mobile App Development', value: 85000, currency: 'INR', stageId: 'won', expectedCloseDate: daysAgo(-15), createdAt: monthsAgo(1.2), stageEnteredAt: monthsAgo(1), wonAt: monthsAgo(0.8) },
  // Lost (1 deal)
  { id: 'd14', clientId: 'c3', title: 'Property Listing Platform', value: 40000, currency: 'INR', stageId: 'lost', expectedCloseDate: daysAgo(-50), createdAt: daysAgo(35), stageEnteredAt: daysAgo(20), lostAt: daysAgo(15), lostReason: 'Budget' },
];

export const demoActivities: Activity[] = [
  { id: 'a1', clientId: 'c1', type: 'call', content: 'Initial discovery call - discussed CRM requirements', createdAt: daysAgo(2) },
  { id: 'a2', clientId: 'c1', dealId: 'd1', type: 'email', content: 'Sent technical proposal document', createdAt: daysAgo(1) },
  { id: 'a3', clientId: 'c2', type: 'meeting', content: 'Quarterly review meeting with marketing team', createdAt: daysAgo(3) },
  { id: 'a4', clientId: 'c2', dealId: 'd10', type: 'stage_change', content: 'Moved to Won', createdAt: monthsAgo(2.8) },
  { id: 'a5', clientId: 'c3', type: 'call', content: 'Follow-up call about property platform timeline', createdAt: daysAgo(1) },
  { id: 'a6', clientId: 'c3', type: 'note', content: 'Client mentioned budget constraints for Q1', createdAt: daysAgo(4) },
  { id: 'a7', clientId: 'c4', type: 'email', content: 'Sent HIPAA compliance documentation', createdAt: daysAgo(2) },
  { id: 'a8', clientId: 'c4', dealId: 'd7', type: 'meeting', content: 'Demo of patient management features', createdAt: daysAgo(5) },
  { id: 'a9', clientId: 'c5', type: 'call', content: 'Discussed LMS features for K-12 segment', createdAt: daysAgo(1) },
  { id: 'a10', clientId: 'c5', dealId: 'd13', type: 'stage_change', content: 'Moved to Won', createdAt: monthsAgo(0.8) },
  { id: 'a11', clientId: 'c6', type: 'email', content: 'Sent omnichannel retail proposal', createdAt: daysAgo(3) },
  { id: 'a12', clientId: 'c7', type: 'meeting', content: 'Project kickoff meeting', createdAt: daysAgo(6) },
  { id: 'a13', clientId: 'c8', type: 'call', content: 'Discussed food delivery app features', createdAt: daysAgo(2) },
  { id: 'a14', clientId: 'c9', type: 'email', content: 'Sent payment dashboard mockups', createdAt: daysAgo(1) },
  { id: 'a15', clientId: 'c9', dealId: 'd11', type: 'stage_change', content: 'Moved to Won', createdAt: monthsAgo(2) },
  { id: 'a16', clientId: 'c10', type: 'call', content: 'Technical architecture discussion', createdAt: daysAgo(1) },
  { id: 'a17', clientId: 'c1', dealId: 'd12', type: 'stage_change', content: 'Moved to Won', createdAt: monthsAgo(1.2) },
  { id: 'a18', clientId: 'c2', dealId: 'd4', type: 'stage_change', content: 'Moved to Contacted', createdAt: daysAgo(12) },
  { id: 'a19', clientId: 'c5', dealId: 'd5', type: 'stage_change', content: 'Moved to Contacted', createdAt: daysAgo(8) },
  { id: 'a20', clientId: 'c4', dealId: 'd7', type: 'stage_change', content: 'Moved to Proposal Sent', createdAt: daysAgo(5) },
  { id: 'a21', clientId: 'c3', dealId: 'd14', type: 'stage_change', content: 'Moved to Lost', createdAt: daysAgo(15) },
  { id: 'a22', clientId: 'c6', dealId: 'd8', type: 'stage_change', content: 'Moved to Proposal Sent', createdAt: daysAgo(7) },
  { id: 'a23', clientId: 'c7', dealId: 'd6', type: 'stage_change', content: 'Moved to Contacted', createdAt: daysAgo(6) },
  { id: 'a24', clientId: 'c10', dealId: 'd9', type: 'stage_change', content: 'Moved to Negotiation', createdAt: daysAgo(3) },
  { id: 'a25', clientId: 'c8', dealId: 'd3', type: 'note', content: 'Client wants AI-based recommendations feature', createdAt: daysAgo(2) },
];

export const demoTasks: FollowUpTask[] = [
  // 2 overdue
  { id: 't1', clientId: 'c1', title: 'Send updated CRM proposal', dueDate: daysAgo(2).split('T')[0], completed: false, createdAt: daysAgo(5) },
  { id: 't2', clientId: 'c3', title: 'Follow up on property platform budget', dueDate: daysAgo(1).split('T')[0], completed: false, createdAt: daysAgo(4) },
  // 2 due today
  { id: 't3', clientId: 'c4', title: 'Schedule HIPAA compliance demo', dueDate: new Date().toISOString().split('T')[0], completed: false, createdAt: daysAgo(2) },
  { id: 't4', clientId: 'c5', title: 'Share LMS feature checklist', dueDate: new Date().toISOString().split('T')[0], completed: false, createdAt: daysAgo(3) },
  // 4 upcoming
  { id: 't5', clientId: 'c2', title: 'Review e-commerce design mockups', dueDate: daysAgo(-2).split('T')[0], completed: false, createdAt: daysAgo(1) },
  { id: 't6', clientId: 'c6', title: 'Prepare omnichannel integration plan', dueDate: daysAgo(-3).split('T')[0], completed: false, createdAt: daysAgo(1) },
  { id: 't7', clientId: 'c9', title: 'Send payment gateway documentation', dueDate: daysAgo(-5).split('T')[0], completed: false, createdAt: daysAgo(2) },
  { id: 't8', clientId: 'c10', title: 'Finalize cloud migration timeline', dueDate: daysAgo(-7).split('T')[0], completed: false, createdAt: daysAgo(3) },
];
