/**
 * FinAuditEase — Authoritative Website Terms and Conditions Data
 * Sabi Africa Innovations Limited
 *
 * Effective Date: 10th October, 2026
 * Last Updated: 10th October, 2026
 */

export interface TermDefinition {
  readonly num: string
  readonly term: string
  readonly definition: string
}

export interface TermSection {
  readonly id: string
  readonly number: number
  readonly title: string
  readonly paragraphs?: readonly string[]
  readonly listType?: 'alpha' | 'decimal'
  readonly listItems?: readonly string[]
  readonly secondaryParagraphs?: readonly string[]
  readonly secondaryListType?: 'alpha' | 'decimal'
  readonly secondaryListItems?: readonly string[]
  readonly tertiaryParagraphs?: readonly string[]
  readonly definitions?: readonly TermDefinition[]
  readonly contactCard?: {
    readonly company: string
    readonly registeredOffice: string
    readonly generalEmail: string
    readonly securityEmail: string
  }
  readonly calloutText?: readonly string[]
}

export const TERMS_SECTIONS: readonly TermSection[] = [
  {
    id: 'section-1',
    number: 1,
    title: 'INTRODUCTION',
    paragraphs: [
      'These Website Terms and Conditions (“Terms”) govern your access to and use of the website operated by Sabi Africa Innovations Limited (“Sabi Africa”, “Company”, “we”, “us” or “our”), including all webpages, forms, content, features, functionalities and other services made available through the website (collectively, the “Website”).',
      'Sabi Africa Innovations Limited is a company incorporated under the laws of the Federal Republic of Nigeria under the Companies and Allied Matters Act 2020 with RC Number 9926908 and registered office at House 8 C Close Ango Beach Estate Abuleoshun, Lagos.',
      'By accessing, browsing or using the Website, you acknowledge that you have read, understood and agreed to be bound by these Terms.',
      'If you do not agree to these Terms, you must discontinue your use of the Website.',
      'These Terms should be read together with Sabi Africa\'s Privacy Policy, Cookie Policy, and any other policies or terms expressly incorporated into these Terms.',
    ],
  },
  {
    id: 'section-2',
    number: 2,
    title: 'DEFINITIONS AND INTERPRETATION',
    paragraphs: ['For the purposes of these Terms:'],
    definitions: [
      {
        num: '2.1',
        term: '“Content”',
        definition:
          'means all information and materials made available through the Website, including text, articles, graphics, images, photographs, videos, audio, documents, reports, designs, software, interfaces, databases, trademarks, logos and other materials.',
      },
      {
        num: '2.2',
        term: '“FinAuditEase”',
        definition:
          'means the audit and accounting workflow technology platform developed, owned, operated or commercialised by Sabi Africa, including its applications, software, features, tools, interfaces, integrations and related services.',
      },
      {
        num: '2.3',
        term: '“Personal Data”',
        definition:
          'has the meaning assigned to it under applicable Nigerian data-protection law.',
      },
      {
        num: '2.4',
        term: '“Third-Party Services”',
        definition:
          'means any website, application, software, platform, API, hosting provider, payment service, analytics service, artificial-intelligence service or other service operated or supplied by a third party.',
      },
      {
        num: '2.5',
        term: '“User”',
        definition:
          'means any person or entity accessing or using the Website.',
      },
      {
        num: '2.6',
        term: '“User Content”',
        definition:
          'means any information, material, communication, enquiry, comment, suggestion, feedback or other content submitted or transmitted by a User through the Website.',
      },
      {
        num: '2.7',
        term: '“you” and “your”',
        definition: 'refer to the User.',
      },
    ],
  },
  {
    id: 'section-3',
    number: 3,
    title: 'ABOUT SABI AFRICA',
    paragraphs: [
      'Sabi Africa Innovations Limited is a technology company that designs, builds and operates digital products and software platforms for businesses. Our first product, FinAuditEase, is a software platform that helps accounting teams and auditors manage audit preparation and document workflows. Sabi Africa provides software only. We do not provide accounting, audit or tax services.',
      'The Website provides information about Sabi Africa, its technology, products, services, developments, partnerships and future offerings.',
      'The Website may permit Users to:',
    ],
    listType: 'alpha',
    listItems: [
      'learn about Sabi Africa and its products;',
      'contact Sabi Africa;',
      'submit enquiries;',
      'subscribe to communications;',
      'join a waitlist;',
      'request early access;',
      'participate in surveys, beta programmes or product research; and',
      'access other features that Sabi Africa may make available from time to time.',
    ],
  },
  {
    id: 'section-4',
    number: 4,
    title: 'ACCEPTANCE OF THESE TERMS',
    paragraphs: [
      'By accessing or using the Website, you represent and warrant that:',
    ],
    listType: 'alpha',
    listItems: [
      'you have read and understood these Terms;',
      'you agree to be legally bound by these Terms;',
      'you will comply with all applicable laws and regulations;',
      'all information supplied by you is accurate, complete and not misleading; and',
      'where you are accessing or using the Website on behalf of a company, organisation or other legal entity, you have authority to bind that entity.',
    ],
    secondaryParagraphs: [
      'Where the Website provides an electronic acceptance mechanism, including a checkbox, button, electronic signature or similar mechanism, your use of that mechanism shall constitute evidence of your acceptance of the relevant terms, subject to applicable law.',
    ],
  },
  {
    id: 'section-5',
    number: 5,
    title: 'ELIGIBILITY',
    paragraphs: [
      'The Website is principally intended for business users, professionals and persons legally capable of entering into binding contractual obligations.',
      'You must be at least 18 years old to use the Website unless otherwise expressly permitted by Sabi Africa in writing and permitted by applicable law.',
      'If you are using the Website on behalf of an organisation, you confirm that you have authority to act on its behalf.',
    ],
  },
  {
    id: 'section-6',
    number: 6,
    title: 'PURPOSE AND NATURE OF THE WEBSITE',
    paragraphs: [
      'The Website is principally an informational and business-development platform.',
      'Nothing on the Website shall be construed as:',
    ],
    listType: 'alpha',
    listItems: [
      'an offer to provide professional audit, accounting, tax, legal, investment or financial services;',
      'a guarantee that a particular product, service or feature will be launched;',
      'a guarantee concerning the performance, availability or functionality of FinAuditEase;',
      'an offer to enter into a SaaS or other commercial agreement unless expressly stated; or',
      'professional advice.',
    ],
    secondaryParagraphs: [
      'Any commercial relationship between Sabi Africa and a customer shall be governed by the applicable written agreement between the parties.',
    ],
  },
  {
    id: 'section-7',
    number: 7,
    title: 'FINAUDITEASE AND OTHER SABI AFRICA PRODUCTS',
    paragraphs: [
      'Information concerning FinAuditEase or any other Sabi Africa product displayed on the Website may relate to products or features that are:',
    ],
    listType: 'alpha',
    listItems: [
      'under development;',
      'undergoing testing;',
      'available through beta or pilot programmes;',
      'available only to selected users; or',
      'subject to future modification.',
    ],
    secondaryParagraphs: [
      'Sabi Africa reserves the right to modify, suspend, withdraw or discontinue any product, feature, functionality or proposed product at any time.',
      'Descriptions of proposed functionality, product roadmaps, launch dates, integrations, pricing or other future developments are indicative only and shall not constitute binding commitments unless expressly agreed in writing.',
      'Where a User registers for or uses FinAuditEase or another Sabi Africa product, the User may be required to accept separate SaaS Terms, Subscription Terms, Service Level Agreement, Acceptable Use Policy, Data Processing Agreement or other product-specific terms.',
      'Where there is any inconsistency between these Website Terms and a specific product agreement, the product agreement shall prevail only in relation to the relevant product or service.',
    ],
  },
  {
    id: 'section-8',
    number: 8,
    title: 'NO PROFESSIONAL ADVICE',
    paragraphs: [
      'Sabi Africa is a technology company.',
      'Sabi Africa does not, merely by operating the Website or providing its software, provide audit, accounting, tax, legal, investment, financial or other professional advice or services.',
      'All information published on the Website is provided for general informational purposes only.',
      'Users should obtain appropriate professional advice before relying upon information contained on the Website for a particular legal, financial, accounting, tax, audit, regulatory or commercial decision.',
      'In particular, Sabi Africa does not represent or warrant that the use of FinAuditEase or any other technology will:',
    ],
    listType: 'alpha',
    listItems: [
      'identify every accounting error;',
      'detect every instance of fraud;',
      'ensure compliance with every applicable law, regulation or professional standard;',
      'replace an auditor\'s or accountant\'s professional judgment;',
      'constitute an audit, assurance engagement or professional accounting service; or',
      'produce any particular financial, audit, tax, regulatory or commercial outcome.',
    ],
    secondaryParagraphs: [
      'Responsibility for professional judgment, review, verification, approval and decision-making remains with the relevant professional, organisation or customer.',
    ],
  },
  {
    id: 'section-9',
    number: 9,
    title: 'PERMITTED USE OF THE WEBSITE',
    paragraphs: [
      'Subject to these Terms, Sabi Africa grants you a limited, revocable, non-exclusive, non-transferable and non-sublicensable right to access and use the Website for lawful purposes.',
      'You agree to use the Website responsibly and in accordance with all applicable laws.',
    ],
  },
  {
    id: 'section-10',
    number: 10,
    title: 'PROHIBITED CONDUCT',
    paragraphs: ['You must not:'],
    listType: 'alpha',
    listItems: [
      'use the Website for any unlawful, fraudulent, deceptive or malicious purpose;',
      'violate any applicable law or regulation;',
      'attempt to obtain unauthorised access to the Website, its servers, systems, databases, networks or security mechanisms;',
      'access or attempt to access another User\'s account, information or data without authorisation;',
      'introduce, transmit or distribute viruses, malware, ransomware, spyware, malicious scripts or other harmful code;',
      'interfere with, disrupt, disable, overburden or impair the Website;',
      'conduct or facilitate denial-of-service attacks or similar attacks;',
      'scrape, crawl, harvest, copy or systematically extract Website Content or data using automated means without Sabi Africa\'s prior written permission;',
      'reverse engineer, decompile, disassemble or attempt to derive source code from software made available through the Website except to the extent expressly permitted by applicable law;',
      'bypass or attempt to bypass authentication, access-control or security measures;',
      'impersonate another person or organisation;',
      'provide false, misleading or fraudulent information;',
      'use the Website to infringe another person\'s intellectual-property, privacy or other legal rights;',
      'transmit spam, unsolicited commercial communications or malicious communications;',
      'use the Website to develop or provide a competing service through unauthorised copying or exploitation of Sabi Africa\'s proprietary materials; or',
      'assist or permit another person to engage in any prohibited conduct.',
    ],
  },
  {
    id: 'section-11',
    number: 11,
    title: 'WEBSITE CONTENT AND ACCURACY',
    paragraphs: [
      'Sabi Africa endeavours to ensure that information published on the Website is reasonably accurate and current.',
      'However, Website Content may contain errors, omissions, typographical errors or information that becomes outdated.',
      'Sabi Africa does not undertake an obligation to update every item of Content immediately.',
      'Sabi Africa reserves the right to correct, amend, update, remove or replace Website Content at any time.',
      'Information concerning future products, features, partnerships, pricing or launch dates may change without notice.',
    ],
  },
  {
    id: 'section-12',
    number: 12,
    title: 'INTELLECTUAL PROPERTY RIGHTS',
    paragraphs: [
      'Unless expressly stated otherwise, all intellectual-property rights in and to the Website and its Content are owned by, controlled by or licensed to Sabi Africa.',
      'This includes, without limitation:',
    ],
    listType: 'alpha',
    listItems: [
      'the Sabi Africa name and brand;',
      'the FinAuditEase name and brand;',
      'trademarks and service marks;',
      'logos;',
      'website design and layout;',
      'text and written materials;',
      'graphics and visual materials;',
      'photographs, videos and audiovisual materials;',
      'software and code;',
      'databases and compilations;',
      'workflows;',
      'user-interface designs;',
      'documentation;',
      'product concepts and presentations; and',
      'other proprietary materials.',
    ],
    secondaryParagraphs: [
      'These rights may be protected under Nigerian and applicable international intellectual-property laws, including the Copyright Act 2022.',
      'Nothing in these Terms transfers any ownership interest in Sabi Africa\'s intellectual property to a User.',
    ],
  },
  {
    id: 'section-13',
    number: 13,
    title: 'LIMITED LICENCE TO ACCESS WEBSITE CONTENT',
    paragraphs: [
      'Where the Website permits you to access, view or download Content, Sabi Africa grants you a limited, revocable, non-exclusive, non-transferable and non-sublicensable licence to do so solely for lawful purposes.',
      'You must not, without Sabi Africa\'s prior written consent:',
    ],
    listType: 'alpha',
    listItems: [
      'reproduce substantial portions of the Content;',
      'modify or adapt the Content;',
      'distribute or commercially exploit the Content;',
      'sell, license or sublicense the Content;',
      'create derivative works from the Content;',
      'remove proprietary notices; or',
      'represent Sabi Africa\'s Content as your own.',
    ],
    secondaryParagraphs: [
      'You may share links to publicly available pages of the Website provided that you do so fairly and lawfully and do not suggest an endorsement or association that does not exist.',
    ],
  },
  {
    id: 'section-14',
    number: 14,
    title: 'TRADEMARKS AND BRANDING',
    paragraphs: [
      'The Sabi Africa and FinAuditEase names, logos, marks, designs and associated branding are proprietary to Sabi Africa or its licensors.',
      'Nothing in these Terms grants you any licence or right to use such trademarks or branding.',
      'You must not:',
    ],
    listType: 'alpha',
    listItems: [
      'use Sabi Africa\'s branding in a manner likely to cause confusion;',
      'register or attempt to register confusingly similar names, domains, social-media handles or marks;',
      'imply that you are endorsed by or affiliated with Sabi Africa without written authorisation; or',
      'use Sabi Africa\'s branding in connection with unlawful, misleading or objectionable material.',
    ],
  },
  {
    id: 'section-15',
    number: 15,
    title: 'USER CONTENT AND FEEDBACK',
    paragraphs: [
      'Where the Website permits you to submit information, comments, suggestions, ideas or feedback, you remain responsible for the content you submit.',
      'You represent that you have all necessary rights and authority to submit such material.',
      'You must not submit:',
    ],
    listType: 'alpha',
    listItems: [
      'confidential information belonging to another person without authority;',
      'trade secrets;',
      'passwords or security credentials;',
      'personal data that you are not authorised to provide;',
      'malicious code; or',
      'material that infringes another person\'s rights.',
    ],
    secondaryParagraphs: [
      'Subject to any separate written agreement between you and Sabi Africa, you grant Sabi Africa a perpetual, worldwide, royalty-free, transferable and sublicensable right to use, reproduce, modify, adapt, publish and otherwise exploit Feedback submitted voluntarily for purposes including product development, improvement, testing, research and commercialisation.',
      'Sabi Africa shall not be required to compensate or credit you for the use of such Feedback.',
      'This clause does not override a separate confidentiality obligation expressly agreed in writing.',
    ],
  },
  {
    id: 'section-16',
    number: 16,
    title: 'WAITLIST, NEWSLETTER AND EARLY ACCESS',
    paragraphs: [
      'Where you join a Sabi Africa waitlist, newsletter or early-access programme, you agree to provide accurate and current information.',
      'Joining a waitlist does not guarantee:',
    ],
    listType: 'alpha',
    listItems: [
      'access to FinAuditEase or any other product;',
      'acceptance into a beta programme;',
      'a particular launch date;',
      'a particular product feature;',
      'a particular price; or',
      'continued availability of any product or programme.',
    ],
    secondaryParagraphs: [
      'Sabi Africa may determine eligibility for early access and may suspend or discontinue any waitlist or early-access programme.',
      'You may opt out of marketing or promotional communications in accordance with applicable law and the instructions contained in the relevant communication.',
    ],
  },
  {
    id: 'section-17',
    number: 17,
    title: 'THIRD-PARTY SERVICES AND LINKS',
    paragraphs: [
      'The Website may contain links to or integrations with Third-Party Services.',
      'Third-Party Services may include payment providers, analytics providers, hosting providers, communication platforms, social-media platforms, artificial-intelligence services and other external technologies.',
      'Sabi Africa does not control and is not responsible for:',
    ],
    listType: 'alpha',
    listItems: [
      'the availability of Third-Party Services;',
      'their content;',
      'their security;',
      'their privacy practices;',
      'their terms and conditions; or',
      'their acts or omissions.',
    ],
    secondaryParagraphs: [
      'Your use of any Third-Party Service is subject to the applicable third party\'s terms and policies.',
      'A link to a third-party website does not constitute an endorsement or recommendation by Sabi Africa.',
    ],
  },
  {
    id: 'section-18',
    number: 18,
    title: 'PERSONAL DATA AND PRIVACY',
    paragraphs: [
      'Sabi Africa may collect and process Personal Data in connection with the Website.',
      'Sabi Africa shall process Personal Data in accordance with applicable data-protection law, including the Nigeria Data Protection Act 2023 (“NDPA”) and applicable regulatory requirements.',
      'Our Privacy Policy explains, among other matters:',
    ],
    listType: 'alpha',
    listItems: [
      'categories of Personal Data collected;',
      'purposes of processing;',
      'applicable lawful bases;',
      'retention;',
      'disclosures and recipients;',
      'international transfers where applicable;',
      'security measures;',
      'data-subject rights; and',
      'how Users may contact Sabi Africa regarding privacy matters.',
    ],
    secondaryParagraphs: [
      'You should read the Privacy Policy before submitting Personal Data through the Website.',
      'Where a business customer uses FinAuditEase to process Personal Data belonging to its customers, employees, suppliers or other persons, the parties\' respective data-protection responsibilities shall be governed by the applicable SaaS Agreement and Data Processing Agreement.',
    ],
  },
  {
    id: 'section-19',
    number: 19,
    title: 'COOKIES AND SIMILAR TECHNOLOGIES',
    paragraphs: [
      'The Website may use cookies and similar technologies for purposes including:',
    ],
    listType: 'alpha',
    listItems: [
      'essential Website functionality;',
      'remembering preferences;',
      'security;',
      'analytics;',
      'performance monitoring;',
      'improving the Website; and',
      'communications or marketing where legally permitted.',
    ],
    secondaryParagraphs: [
      'Where applicable, additional information and choices concerning cookies shall be provided through our Cookie Policy, privacy notice or cookie-management mechanism.',
    ],
  },
  {
    id: 'section-20',
    number: 20,
    title: 'SECURITY AND RESPONSIBLE DISCLOSURE',
    paragraphs: [
      'You must not knowingly compromise, attack, interfere with or attempt to circumvent the security of the Website or Sabi Africa\'s systems.',
      'If you discover a genuine security vulnerability affecting the Website, you should notify Sabi Africa promptly through:',
    ],
    contactCard: {
      company: 'SABI AFRICA INNOVATIONS LIMITED',
      registeredOffice: 'House 8 C close Ango Beach Estate Abuleoshun, Satellite Town Lagos',
      generalEmail: 'letstrystride@gmail.com',
      securityEmail: 'letstrystride@gmail.com',
    },
    secondaryParagraphs: [
      'You must not exploit the vulnerability, access unrelated information, modify or destroy data, or publicly disclose the vulnerability before giving Sabi Africa a reasonable opportunity to investigate and address it, except where disclosure is required by law.',
    ],
  },
  {
    id: 'section-21',
    number: 21,
    title: 'AVAILABILITY OF THE WEBSITE',
    paragraphs: [
      'The Website is provided on an “as available” and “as is” basis.',
      'Sabi Africa may at any time:',
    ],
    listType: 'alpha',
    listItems: [
      'modify the Website;',
      'add or remove functionality;',
      'suspend Website access;',
      'carry out maintenance;',
      'restrict access for security reasons;',
      'discontinue particular features; or',
      'discontinue the Website.',
    ],
    secondaryParagraphs: [
      'Sabi Africa does not guarantee that the Website will:',
    ],
    secondaryListType: 'alpha',
    secondaryListItems: [
      'always be available;',
      'operate without interruption;',
      'be free from errors;',
      'be completely secure;',
      'be free from viruses or harmful components; or',
      'remain unchanged.',
    ],
  },
  {
    id: 'section-22',
    number: 22,
    title: 'DISCLAIMER OF WARRANTIES',
    paragraphs: [
      'To the fullest extent permitted by applicable Nigerian law, Sabi Africa disclaims warranties and representations, whether express, implied or statutory, concerning the Website except to the extent expressly stated in these Terms or required by law.',
      'Without limiting the foregoing, Sabi Africa does not warrant that:',
    ],
    listType: 'alpha',
    listItems: [
      'the Website will satisfy every User\'s requirements;',
      'the Website will be continuously available;',
      'Website Content will always be complete or current;',
      'all defects will immediately be corrected;',
      'the Website will be entirely free of security vulnerabilities; or',
      'use of the Website will produce any particular commercial, financial, accounting, audit, tax or regulatory result.',
    ],
    secondaryParagraphs: [
      'Nothing in these Terms excludes any warranty or liability that cannot lawfully be excluded.',
    ],
  },
  {
    id: 'section-23',
    number: 23,
    title: 'LIMITATION OF LIABILITY',
    paragraphs: [
      'To the fullest extent permitted by applicable law, Sabi Africa shall not be liable for indirect, incidental, special, exemplary or consequential loss arising out of or relating to your access to or use of, or inability to use, the Website.',
      'Sabi Africa shall not be liable to the extent that loss results from:',
    ],
    listType: 'alpha',
    listItems: [
      'your breach of these Terms;',
      'your misuse of the Website;',
      'your failure to maintain appropriate security on your own device or systems;',
      'Third-Party Services;',
      'events beyond Sabi Africa\'s reasonable control; or',
      'your reliance on Website Content without obtaining appropriate professional advice.',
    ],
    secondaryParagraphs: ['Nothing in these Terms shall:'],
    secondaryListType: 'alpha',
    secondaryListItems: [
      'exclude or restrict liability that cannot lawfully be excluded or restricted;',
      'prevent either party from exercising any right or remedy that cannot lawfully be excluded.',
    ],
  },
  {
    id: 'section-24',
    number: 24,
    title: 'INDEMNITY',
    paragraphs: [
      'To the fullest extent permitted by applicable law, you agree to indemnify and hold harmless Sabi Africa, its directors, officers, employees, contractors, affiliates, licensors and service providers from and against claims, liabilities, losses, damages, penalties, costs and reasonable legal expenses arising out of or relating to:',
    ],
    listType: 'alpha',
    listItems: [
      'your breach of these Terms;',
      'your unlawful, fraudulent or negligent use of the Website;',
      'your violation of applicable law;',
      'your infringement of another person\'s rights;',
      'your User Content; or',
      'your violation of any Third-Party Service terms applicable to your conduct.',
    ],
    secondaryParagraphs: [
      'Sabi Africa shall, where reasonably practicable, notify you of a material claim for which indemnification is sought.',
      'Sabi Africa may participate in the defence of such claim and shall not be required to accept a settlement imposing liability or an obligation on Sabi Africa without its prior written consent.',
    ],
  },
  {
    id: 'section-25',
    number: 25,
    title: 'SUSPENSION AND TERMINATION',
    paragraphs: [
      'Sabi Africa may suspend, restrict or terminate your access to the Website where:',
    ],
    listType: 'alpha',
    listItems: [
      'you materially breach these Terms;',
      'your conduct creates a security risk;',
      'your conduct exposes Sabi Africa to legal or regulatory risk;',
      'suspension is reasonably necessary to protect the Website or another User;',
      'required by law or a competent regulatory authority; or',
      'the Website or relevant service is discontinued.',
    ],
    secondaryParagraphs: [
      'Sabi Africa may take such action without prior notice where immediate action is reasonably necessary.',
      'Termination or suspension shall not affect rights and obligations accrued before the effective date of termination.',
    ],
  },
  {
    id: 'section-26',
    number: 26,
    title: 'FORCE MAJEURE',
    paragraphs: [
      'Sabi Africa shall not be liable for delay, interruption or failure to perform an obligation caused by circumstances beyond its reasonable control, including:',
    ],
    listType: 'alpha',
    listItems: [
      'natural disasters;',
      'fire or flood;',
      'war;',
      'terrorism;',
      'civil unrest;',
      'epidemic or pandemic;',
      'governmental action;',
      'regulatory restrictions;',
      'telecommunications failure;',
      'internet infrastructure failure;',
      'prolonged power failure;',
      'cyberattack or major cybersecurity incident;',
      'failure of hosting or cloud-service providers; or',
      'other events beyond Sabi Africa\'s reasonable control.',
    ],
  },
  {
    id: 'section-27',
    number: 27,
    title: 'CHANGES TO THE WEBSITE AND THESE TERMS',
    paragraphs: [
      'Sabi Africa may modify these Terms from time to time to reflect:',
    ],
    listType: 'alpha',
    listItems: [
      'changes to the Website;',
      'changes to our business;',
      'new products or features;',
      'changes in applicable law or regulatory requirements; or',
      'changes in industry practice.',
    ],
    secondaryParagraphs: [
      'The current version shall be published on the Website with an updated “Last Updated” date.',
      'Where an amendment materially affects Users or where applicable law requires additional notice, Sabi Africa may provide such notice through an appropriate communication channel.',
      'Your continued use of the Website after the effective date of an updated version shall constitute acceptance of the revised Terms to the extent permitted by law.',
    ],
  },
  {
    id: 'section-28',
    number: 28,
    title: 'GOVERNING LAW AND DISPUTE RESOLUTION',
    paragraphs: [
      'These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.',
      'If any dispute arises between you and Sabi Africa concerning these Terms or your use of the Website, the parties shall first attempt in good faith to resolve the dispute through negotiation.',
      'The party raising the dispute shall provide written notice setting out the material nature of the dispute.',
      'The parties shall endeavour to resolve the dispute within thirty (30) days of receipt of the notice.',
      'Where the dispute remains unresolved after that period, either party may commence proceedings before a court of competent jurisdiction in Lagos State, Nigeria, subject to applicable law.',
      'Nothing in this clause shall prevent Sabi Africa from seeking urgent interim, injunctive or protective relief from a court of competent jurisdiction where necessary to protect its intellectual property, confidential information, data, systems, security or other legitimate interests.',
    ],
  },
  {
    id: 'section-29',
    number: 29,
    title: 'ASSIGNMENT',
    paragraphs: [
      'You may not assign, transfer, delegate or otherwise dispose of your rights or obligations under these Terms without Sabi Africa\'s prior written consent.',
      'Sabi Africa may assign or transfer its rights and obligations under these Terms in connection with:',
    ],
    listType: 'alpha',
    listItems: [
      'a merger;',
      'acquisition;',
      'corporate restructuring;',
      'sale of all or part of its business or assets;',
      'reorganisation; or',
      'any similar corporate transaction,',
    ],
    secondaryParagraphs: ['subject to applicable law.'],
  },
  {
    id: 'section-30',
    number: 30,
    title: 'NO PARTNERSHIP, AGENCY OR EMPLOYMENT',
    paragraphs: [
      'Nothing contained in these Terms shall create or be construed as creating:',
    ],
    listType: 'alpha',
    listItems: [
      'a partnership;',
      'joint venture;',
      'employment relationship;',
      'fiduciary relationship;',
      'agency relationship; or',
      'franchise relationship',
    ],
    secondaryParagraphs: ['between you and Sabi Africa.'],
  },
  {
    id: 'section-31',
    number: 31,
    title: 'SEVERABILITY',
    paragraphs: [
      'If any provision of these Terms is determined by a court or competent authority to be invalid, unlawful or unenforceable, that provision shall be modified or severed to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.',
    ],
  },
  {
    id: 'section-32',
    number: 32,
    title: 'WAIVER',
    paragraphs: [
      'A failure or delay by Sabi Africa in exercising any right or remedy under these Terms shall not constitute a waiver of that right or remedy.',
      'Any waiver must be expressly made in writing.',
    ],
  },
  {
    id: 'section-33',
    number: 33,
    title: 'ENTIRE AGREEMENT AND ORDER OF PRECEDENCE',
    paragraphs: [
      'These Terms, together with the documents expressly incorporated into them, constitute the agreement between you and Sabi Africa concerning your use of the Website.',
      'Where applicable, the following order of precedence shall apply:',
    ],
    listType: 'decimal',
    listItems: [
      'a separately executed agreement between Sabi Africa and the User;',
      'applicable product-specific terms;',
      'Data Processing Agreement, where applicable;',
      'Privacy Policy and Cookie Policy in matters specifically concerning privacy and cookies; and',
      'these Website Terms.',
    ],
    secondaryParagraphs: [
      'Nothing in these Terms shall override a specific contractual provision expressly agreed between Sabi Africa and a User.',
    ],
  },
  {
    id: 'section-34',
    number: 34,
    title: 'ELECTRONIC COMMUNICATIONS',
    paragraphs: [
      'You consent to receiving communications electronically where permitted by applicable law.',
      'Sabi Africa may communicate with you through email, Website notices, in-platform notifications or other electronic means.',
      'Electronic records, communications, acknowledgements and acceptance mechanisms may be used as evidence of communications and transactions, subject to applicable law.',
    ],
  },
  {
    id: 'section-35',
    number: 35,
    title: 'THIRD-PARTY RIGHTS',
    paragraphs: [
      'Except where expressly stated otherwise, these Terms do not create enforceable rights in favour of any person who is not a party to them.',
    ],
  },
  {
    id: 'section-36',
    number: 36,
    title: 'SURVIVAL',
    paragraphs: [
      'Any provision which by its nature is intended to survive termination or cessation of your use of the Website shall survive, including provisions concerning:',
    ],
    listType: 'alpha',
    listItems: [
      'intellectual property;',
      'User Content and Feedback;',
      'disclaimers;',
      'limitation of liability;',
      'indemnity;',
      'governing law;',
      'dispute resolution; and',
      'any accrued rights or obligations.',
    ],
  },
  {
    id: 'section-37',
    number: 37,
    title: 'CONTACT INFORMATION',
    paragraphs: [
      'For questions, notices or enquiries concerning these Terms, please contact:',
    ],
    contactCard: {
      company: 'SABI AFRICA INNOVATIONS LIMITED',
      registeredOffice: 'House 8 C close Ango Beach Estate Abuleoshun, Satellite Town Lagos',
      generalEmail: 'letstrystride@gmail.com',
      securityEmail: 'letstrystride@gmail.com',
    },
  },
  {
    id: 'section-38',
    number: 38,
    title: 'ACKNOWLEDGEMENT',
    calloutText: [
      'BY ACCESSING OR USING THE WEBSITE, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD AND AGREED TO THESE TERMS.',
      'IF YOU DO NOT AGREE TO THESE TERMS, YOU MUST NOT USE THE WEBSITE.',
    ],
    secondaryParagraphs: [
      'Last Updated: 10th October, 2026',
      '© 2026 SABI AFRICA INNOVATIONS LIMITED. ALL RIGHTS RESERVED.',
    ],
  },
]
