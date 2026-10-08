import type { Template } from './types'

// {{client}} {{company}} {{email}} {{date}} are filled in when a doc is created; everything stays editable.
export const TEMPLATES: Template[] = [
  {
    kind: 'proposal', title: 'Project Proposal', hint: 'Scope, timeline and price before they say yes',
    body: `# Project Proposal
Prepared for {{client}}, {{company}} on {{date}}.

## The goal
What {{company}} wants to achieve with this project, in two or three sentences.

## What we'll build
- Item one
- Item two
- Item three

## Timeline
- Week 1: discovery and wireframes
- Weeks 2 to 3: design
- Weeks 4 to 6: development
- Week 7: testing and launch

## Investment
Total: ₹______ (excluding GST).
50% to start, 50% before launch.

## Next step
Sign below to accept this proposal. We'll send the service agreement and an onboarding checklist the same day.`,
  },
  {
    kind: 'onboarding', title: 'Client Onboarding', hint: 'What we need from them to start',
    body: `# Welcome to codedemons
Hi {{client}}, we're excited to start. This page is everything we need from you, and how we'll work together.

## What we need from you
- Logo files and brand colours
- Content: text, photos, product details
- Access: domain registrar, hosting, analytics (as needed)
- One person who can give final approvals

## How we work
- One weekly update in your portal
- Feedback within 2 working days keeps the timeline on track
- Two rounds of revisions per design stage are included

## Contacts
codedemons: hello@codedemons.in
{{company}}: {{client}}, {{email}}

By signing, you confirm the details above and that we can begin.`,
  },
  {
    kind: 'contract', title: 'Service Agreement', hint: 'The main contract',
    body: `# Service Agreement
This agreement is made on {{date}} between codedemons ("the Studio") and {{client}} of {{company}} ("the Client").

## 1. Services
The Studio will deliver the work described in the accepted proposal. Anything outside it is a change request, quoted separately.

## 2. Fees and payment
Total fee: ₹______ plus applicable GST.
50% is due before work starts and 50% before launch. Invoices are payable within 7 days.

## 3. Timeline
Dates in the proposal depend on the Client sending content and feedback on time. Delays on either side move the timeline by the same amount.

## 4. Revisions
Two rounds of revisions are included at each design stage. Extra rounds are billed at ₹______ per hour.

## 5. Ownership
On full payment, the Client owns the final designs and content made for them. The Studio keeps ownership of its own tools, frameworks and code libraries, and gives the Client a licence to use them in this project.

## 6. Portfolio
The Studio may show the finished work in its portfolio unless the Client asks otherwise in writing.

## 7. Confidentiality
Both parties keep each other's private information confidential.

## 8. Termination
Either party can end this agreement with 14 days' written notice. Work done up to that date is paid for.

## 9. Liability
The Studio's total liability is limited to the fees paid under this agreement.

## 10. Law
This agreement is governed by the laws of India.`,
  },
  {
    kind: 'nda', title: 'Non-Disclosure Agreement', hint: 'Before they share anything sensitive',
    body: `# Mutual Non-Disclosure Agreement
Made on {{date}} between codedemons and {{client}} of {{company}}.

## 1. Confidential information
Anything one party shares with the other that is marked confidential, or that a reasonable person would treat as confidential: business plans, customer data, code, designs, pricing.

## 2. What each party agrees
- Use the information only for the project
- Not share it with anyone outside the people working on it
- Protect it at least as carefully as their own private information

## 3. Exceptions
Information that is already public, already known, independently created, or that must be disclosed by law.

## 4. Duration
These obligations last for 2 years after the project ends.

## 5. Return of information
On request, each party deletes or returns the other's confidential information.`,
  },
  {
    kind: 'srs', title: 'Software Requirements Specification', hint: 'What exactly we are building',
    body: `# Software Requirements Specification
Project for {{company}}. Version 1.0, {{date}}.

## 1. Purpose
What this product is and the problem it solves.

## 2. Users
- Visitors: who they are and what they come for
- Admins: who manages the content

## 3. Features
- Feature: what it does and who uses it
- Feature: what it does and who uses it

## 4. Pages
- Home
- About
- Contact

## 5. Non-functional requirements
- Loads in under 2.5 seconds on a mid-range phone over 4G
- Works on the latest Chrome, Safari, Firefox and Edge, desktop and mobile
- Meets WCAG 2.1 AA accessibility basics
- HTTPS everywhere, daily backups

## 6. Integrations
Payment gateway, email, analytics, CRM (as applicable).

## 7. Out of scope
Anything not listed above.

## 8. Acceptance
The project is accepted when every feature above works as described. Changes after signing are handled as change requests.`,
  },
  {
    kind: 'maintenance', title: 'Maintenance & License Agreement', hint: 'Monthly plan that keeps the site live',
    body: `# Maintenance & License Agreement
Between codedemons and {{client}} of {{company}}, starting {{date}}.

## 1. What's included
- Hosting, SSL and uptime monitoring
- Security and dependency updates
- Up to ______ hours of small changes per month
- Backups and restore on request

## 2. Fee
₹______ per month, invoiced in advance and payable within 7 days by UPI or online payment.

## 3. License
The website runs under a license from codedemons that stays active while this plan is paid. If a payment is more than 7 days overdue, the website may show a maintenance page until the payment is received. Service resumes automatically once it is paid.

## 4. Term
Month to month. Either party can cancel with 30 days' notice. On cancellation with all dues paid, the Client can buy out the license and receive a deployable copy of the website.`,
  },
  {
    kind: 'handover', title: 'Handover & Acceptance', hint: 'Sign off at launch',
    body: `# Project Handover & Acceptance
Project for {{company}}, delivered on {{date}}.

## Delivered
- Live website at ______
- Admin access handed over to {{email}}
- Training session / walkthrough video

## Checklist
- All pages reviewed and approved
- Forms tested and emails arriving
- Analytics connected
- Domain and SSL working

## Support
30 days of free fixes for bugs from launch. After that, support is covered by the maintenance plan.

By signing, the Client confirms the project was delivered as agreed and accepts it as complete.`,
  },
]

export const fillTemplate = (body: string, c: { name: string; company?: string; email?: string }) =>
  body
    .replaceAll('{{client}}', c.name)
    .replaceAll('{{company}}', c.company || c.name)
    .replaceAll('{{email}}', c.email || '')
    .replaceAll('{{date}}', new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }))

export const BLANK_TEMPLATE: Template = { kind: '', title: 'Blank document', hint: 'Start from scratch', body: '# Title\n\nWrite here.' }
