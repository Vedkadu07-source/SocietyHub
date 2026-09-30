export const committeeUser = {
    name: 'Priya Malhotra',
    role: 'Secretary',
    initials: 'PM',
    society: 'Sunrise Heights',
};
export const residentUser = {
    name: 'Arjun Sharma',
    unit: 'A-204',
    initials: 'AS',
    society: 'Sunrise Heights',
};
export const complaints = [
    { id: 'SR-1041', unit: 'B-302', resident: 'Kavita Nair', issue: 'Water leakage in bathroom ceiling', category: 'Plumbing', priority: 'High', status: 'In Progress', date: '28 Sep 2026', response: 'Plumber scheduled for 30 Sep.' },
    { id: 'SR-1040', unit: 'A-104', resident: 'Rahul Mehta', issue: 'Lift malfunction — jerky movement', category: 'Lift', priority: 'Critical', status: 'Open', date: '27 Sep 2026', response: '' },
    { id: 'SR-1039', unit: 'C-501', resident: 'Sunita Rao', issue: 'Street light near parking not working', category: 'Electrical', priority: 'Low', status: 'Resolved', date: '25 Sep 2026', response: 'Replaced bulb on 26 Sep.' },
    { id: 'SR-1038', unit: 'A-201', resident: 'Deepak Kumar', issue: 'Noise complaint — late night music', category: 'Community', priority: 'Medium', status: 'Pending Response', date: '24 Sep 2026', response: 'Notice issued to resident.' },
    { id: 'SR-1037', unit: 'B-405', resident: 'Meena Joshi', issue: 'Terrace garden water seepage', category: 'Civil', priority: 'High', status: 'In Progress', date: '22 Sep 2026', response: 'Civil team inspecting.' },
    { id: 'SR-1036', unit: 'D-101', resident: 'Vikram Singh', issue: 'Security gate remote not working', category: 'Security', priority: 'Medium', status: 'Resolved', date: '20 Sep 2026', response: 'Remote reprogrammed.' },
    { id: 'SR-1035', unit: 'C-203', resident: 'Anjali Gupta', issue: 'Common corridor tiles cracked', category: 'Civil', priority: 'Low', status: 'Open', date: '19 Sep 2026', response: '' },
];
export const residents = [
    { id: 'R001', name: 'Kavita Nair', unit: 'B-302', phone: '+91 98765 43210', maintenance: 3200, status: 'Paid', lastPayment: '01 Sep 2026' },
    { id: 'R002', name: 'Rahul Mehta', unit: 'A-104', phone: '+91 87654 32109', maintenance: 2800, status: 'Paid', lastPayment: '03 Sep 2026' },
    { id: 'R003', name: 'Sunita Rao', unit: 'C-501', phone: '+91 76543 21098', maintenance: 3500, status: 'Pending', lastPayment: '01 Aug 2026' },
    { id: 'R004', name: 'Deepak Kumar', unit: 'A-201', phone: '+91 65432 10987', maintenance: 2800, status: 'Paid', lastPayment: '02 Sep 2026' },
    { id: 'R005', name: 'Meena Joshi', unit: 'B-405', phone: '+91 54321 09876', maintenance: 3200, status: 'Overdue', lastPayment: '01 Jul 2026' },
    { id: 'R006', name: 'Vikram Singh', unit: 'D-101', phone: '+91 43210 98765', maintenance: 2800, status: 'Paid', lastPayment: '04 Sep 2026' },
    { id: 'R007', name: 'Anjali Gupta', unit: 'C-203', phone: '+91 32109 87654', maintenance: 3200, status: 'Pending', lastPayment: '31 Aug 2026' },
    { id: 'R008', name: 'Suresh Pillai', unit: 'D-304', phone: '+91 21098 76543', maintenance: 2800, status: 'Paid', lastPayment: '01 Sep 2026' },
    { id: 'R009', name: 'Priya Bhatia', unit: 'A-402', phone: '+91 10987 65432', maintenance: 3200, status: 'Paid', lastPayment: '05 Sep 2026' },
    { id: 'R010', name: 'Karan Shah', unit: 'B-110', phone: '+91 09876 54321', maintenance: 2800, status: 'Overdue', lastPayment: '28 Jul 2026' },
];
export const notices = [
    { id: 'N001', title: 'Annual General Meeting — October 2026', category: 'Meeting', priority: 'High', date: '26 Sep 2026', preview: 'The Annual General Meeting for FY 2026–27 is scheduled for 12 October 2026 at 6:30 PM in the community hall. All residents are requested to attend.', author: 'Secretary' },
    { id: 'N002', title: 'Diwali Celebration Arrangements', category: 'Event', priority: 'Normal', date: '24 Sep 2026', preview: 'The society Diwali celebration is planned for 20 October. Decoration committee volunteers are requested to register at the office by 5 October.', author: 'Cultural Committee' },
    { id: 'N003', title: 'Water Tank Cleaning — 2 October', category: 'Maintenance', priority: 'Normal', date: '22 Sep 2026', preview: 'Overhead tanks for Wings A and B will be cleaned on 2 October between 9 AM and 2 PM. Water supply will be interrupted. Please store adequately.', author: 'Maintenance Team' },
    { id: 'N004', title: 'Revised Parking Allocation Policy', category: 'Policy', priority: 'High', date: '18 Sep 2026', preview: 'Updated parking rules effective 1 October 2026. Visitor parking is now limited to 4 hours. Residents with two vehicles must register both.', author: 'Committee' },
    { id: 'N005', title: 'October Maintenance Due Reminder', category: 'Finance', priority: 'Urgent', date: '15 Sep 2026', preview: 'September maintenance dues are pending for 23 units. Residents are requested to clear dues before 30 September to avoid a late fee of ₹200.', author: 'Treasurer' },
];
export const transactions = [
    { id: 'TXN-4821', resident: 'Rahul Mehta', unit: 'A-104', category: 'Maintenance', mode: 'UPI', amount: 2800, date: '03 Sep 2026', status: 'Completed' },
    { id: 'TXN-4820', resident: 'Deepak Kumar', unit: 'A-201', category: 'Maintenance', mode: 'Bank Transfer', amount: 2800, date: '02 Sep 2026', status: 'Completed' },
    { id: 'TXN-4819', resident: 'Kavita Nair', unit: 'B-302', category: 'Maintenance', mode: 'UPI', amount: 3200, date: '01 Sep 2026', status: 'Completed' },
    { id: 'TXN-4818', resident: 'Suresh Pillai', unit: 'D-304', category: 'Maintenance', mode: 'Cheque', amount: 2800, date: '01 Sep 2026', status: 'Completed' },
    { id: 'TXN-4817', resident: 'Priya Bhatia', unit: 'A-402', category: 'Maintenance', mode: 'UPI', amount: 3200, date: '05 Sep 2026', status: 'Completed' },
    { id: 'TXN-4816', resident: 'Vikram Singh', unit: 'D-101', category: 'Maintenance', mode: 'Net Banking', amount: 2800, date: '04 Sep 2026', status: 'Completed' },
    { id: 'TXN-4815', resident: 'Meena Joshi', unit: 'B-405', category: 'Penalty', mode: 'Cash', amount: 500, date: '28 Aug 2026', status: 'Completed' },
];
export const activityFeed = [
    { id: 1, action: 'Complaint SR-1041 marked In Progress', time: '2 hrs ago', type: 'complaint' },
    { id: 2, action: 'Notice posted: AGM October 2026', time: '4 hrs ago', type: 'notice' },
    { id: 3, action: '₹3,200 received from Kavita Nair (B-302)', time: 'Yesterday', type: 'payment' },
    { id: 4, action: 'Complaint SR-1039 resolved', time: 'Yesterday', type: 'resolved' },
    { id: 5, action: '₹2,800 received from Rahul Mehta (A-104)', time: '2 days ago', type: 'payment' },
    { id: 6, action: 'New complaint filed by A-201 — Noise', time: '2 days ago', type: 'complaint' },
];
export const monthlyCollection = [
    { month: 'Feb', amount: 1620000 },
    { month: 'Mar', amount: 1840000 },
    { month: 'Apr', amount: 1580000 },
    { month: 'May', amount: 1920000 },
    { month: 'Jun', amount: 1760000 },
    { month: 'Jul', amount: 1540000 },
    { month: 'Aug', amount: 1980000 },
    { month: 'Sep', amount: 1845000 },
];
export const myPayments = [
    { id: 'TXN-4802', month: 'August 2026', amount: 2500, mode: 'UPI', date: '02 Aug 2026', status: 'Paid', receipt: '#REC-0802' },
    { id: 'TXN-4785', month: 'July 2026', amount: 2500, mode: 'UPI', date: '01 Jul 2026', status: 'Paid', receipt: '#REC-0785' },
    { id: 'TXN-4764', month: 'June 2026', amount: 2500, mode: 'Net Banking', date: '03 Jun 2026', status: 'Paid', receipt: '#REC-0764' },
    { id: 'TXN-4741', month: 'May 2026', amount: 2500, mode: 'UPI', date: '02 May 2026', status: 'Paid', receipt: '#REC-0741' },
    { id: 'TXN-4720', month: 'April 2026', amount: 2200, mode: 'Cheque', date: '04 Apr 2026', status: 'Paid', receipt: '#REC-0720' },
];
export const myComplaints = [
    { id: 'SR-1038', issue: 'Noise complaint — late night music from C-502', location: 'Floor 5 Corridor', date: '24 Sep 2026', status: 'Pending Response', response: 'Notice issued to the concerned resident on 25 Sep.' },
    { id: 'SR-1028', issue: 'Lobby intercom not ringing in unit', location: 'Flat A-204', date: '10 Sep 2026', status: 'Resolved', response: 'Wiring fixed on 12 Sep. Please test and confirm.' },
    { id: 'SR-1015', issue: 'Parking spot blocked by unknown vehicle', location: 'Basement P-A12', date: '25 Aug 2026', status: 'Resolved', response: 'Vehicle owner identified and notified. Issue resolved.' },
];
