const fs = require('fs');
const path = require('path');

const localesDir = path.resolve('src/i18n/locales');
const languages = ['en', 'yo', 'ig', 'ha', 'pcm'];

const data = {};
for (const lang of languages) {
  const filePath = path.join(localesDir, `${lang}.json`);
  data[lang] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const translations = {
  engagements: {
    statusActive: {
      en: "Active",
      yo: "Tí ń Lọ Lọ́wọ́",
      ig: "Na-arụ Ọrụ",
      ha: "Mai Aiki",
      pcm: "Active"
    },
    statusCompleted: {
      en: "Completed",
      yo: "Ti Parí",
      ig: "Emechara",
      ha: "An Kammala",
      pcm: "Completed"
    },
    statusArchived: {
      en: "Archived",
      yo: "Ti Pa Mọ́",
      ig: "Echekwara",
      ha: "An Ajiye",
      pcm: "Archived"
    },
    memberName: {
      en: "Member Name",
      yo: "Orúkọ Ọmọ Ẹgbẹ́",
      ig: "Aha Onye Otu",
      ha: "Sunan Memba",
      pcm: "Member Name"
    },
    corporateEmail: {
      en: "Corporate Email",
      yo: "Ímeèlì Ilé-iṣẹ́",
      ig: "Ozi Ịntanetị Ụlọ Ọrụ",
      ha: "Imel ɗin Kamfani",
      pcm: "Company Email"
    },
    role: {
      en: "Role",
      yo: "Ipa",
      ig: "Ọrụ",
      ha: "Matsayi",
      pcm: "Role"
    }
  },
  auditRequests: {
    priorityCritical: {
      en: "Critical",
      yo: "Pàjáwìrì",
      ig: "Dị Oke Mkpa",
      ha: "Mai Muhimmanci Sosai",
      pcm: "Critical"
    },
    priorityHigh: {
      en: "High",
      yo: "Gíga",
      ig: "Dị Mkpa",
      ha: "Babba",
      pcm: "High"
    },
    priorityMedium: {
      en: "Medium",
      yo: "Àárín",
      ig: "Ọkara",
      ha: "Matsakaici",
      pcm: "Medium"
    },
    priorityLow: {
      en: "Low",
      yo: "Kékeré",
      ig: "Dị Ala",
      ha: "Ƙanƙanta",
      pcm: "Low"
    },
    viewDetails: {
      en: "View Request",
      yo: "Wo Ìbéèrè",
      ig: "Lee Arịrịọ",
      ha: "Duba Buƙata",
      pcm: "View Request"
    },
    completedEngagementNotice: {
      en: "This request is part of a completed engagement and is now permanent read-only.",
      yo: "Ìbéèrè yìí jẹ́ apá kan iṣẹ́ àyẹ̀wò tí a ti parí, ó sì wà ní ipò wíwò nìkan báyìí.",
      ig: "Arịrịọ a bụ akụkụ nke ọrụ nyocha emechara ma dị ugbu a maka naanị ọgụgụ.",
      ha: "Wannan buƙatar tana cikin aikin binciken da aka kammala kuma yanzu na karantawa ne kawai.",
      pcm: "This request dey inside engagement wey don finish and e dey permanent read-only."
    },
    goToReview: {
      en: "Go to Review Workspace",
      yo: "Lọ sí Gbọ̀ngàn Àyẹ̀wò",
      ig: "Gaa n'Ebe Nyocha",
      ha: "Je zuwa Wurin Bita",
      pcm: "Go to Review Workspace"
    },
    returnToList: {
      en: "Return to Audit Requests",
      yo: "Padà sí Àwọn Ìbéèrè Àyẹ̀wò",
      ig: "Laghachi na Arịrịọ Nnyocha",
      ha: "Koma zuwa Buƙatun Bincike",
      pcm: "Return to Audit Requests"
    }
  },
  roles: {
    default: {
      en: "Team Member",
      yo: "Ọmọ Ẹgbẹ́",
      ig: "Onye Otu",
      ha: "Memba",
      pcm: "Team Member"
    }
  },
  common: {
    optional: {
      en: "Optional",
      yo: "Kò pọn dandan",
      ig: "Nhọrọ",
      ha: "Na Zaɓi",
      pcm: "Optional"
    },
    processing: {
      en: "Processing...",
      yo: "Ń ṣiṣẹ́ lọ́wọ́...",
      ig: "Na-arụ ọrụ...",
      ha: "Yana aiki...",
      pcm: "Processing..."
    },
    error: {
      en: "Error",
      yo: "Àṣìṣe",
      ig: "Mmehie",
      ha: "Kuskure",
      pcm: "Error"
    },
    overdue: {
      en: "Overdue",
      yo: "Ti kọjá àkókò",
      ig: "Oge agafeela",
      ha: "Lokaci ya wuce",
      pcm: "Overdue"
    },
    submitting: {
      en: "Submitting...",
      yo: "Ń fi sílẹ̀...",
      ig: "Na-enyefe...",
      ha: "Ana miƙawa...",
      pcm: "Submitting..."
    },
    allStatuses: {
      en: "All Statuses",
      yo: "Gbogbo Ipò",
      ig: "Ọnọdụ Niile",
      ha: "Duk Matsayoyi",
      pcm: "All Statuses"
    },
    saving: {
      en: "Saving...",
      yo: "Ń fi pamọ́...",
      ig: "Na-echekwa...",
      ha: "Ana adanawa...",
      pcm: "Saving..."
    },
    backToQueue: {
      en: "Back to Queue",
      yo: "Padà sí Àtòjọ",
      ig: "Laghachi na Ahịrị",
      ha: "Koma kan Layi",
      pcm: "Back to Queue"
    },
    noSearchResults: {
      en: "No Matching Results",
      yo: "Kò sí àbájáde tó bá a mu",
      ig: "Enweghị nsonaazụ kwekọrọ",
      ha: "Babu sakamako mai dacewa",
      pcm: "No Matching Results"
    },
    noSearchResultsDesc: {
      en: "No records match your current search query. Try modifying your search terms.",
      yo: "Kò sí àkọsílẹ̀ tó bá àwárí rẹ mu. Gbìyànjú láti yí ọ̀rọ̀ àwárí rẹ padà.",
      ig: "Enweghị ndekọ kwekọrọ na nchọta gị. Nwalee ịgbanwe okwu nchọta gị.",
      ha: "Babu bayanan da suka dace da bincikenka. Gwada canza kalmomin bincike.",
      pcm: "No record match your search. Try change the words you dey search."
    },
    print: {
      en: "Print / PDF",
      yo: "Tẹ̀ ẹ́ Jáde / PDF",
      ig: "Bipụta / PDF",
      ha: "Buga / PDF",
      pcm: "Print / PDF"
    },
    completion: {
      en: "Completion",
      yo: "Ìparí",
      ig: "Mmecha",
      ha: "Kammalawa",
      pcm: "Completion"
    },
    readiness: {
      en: "Readiness",
      yo: "Ìmúrasílẹ̀",
      ig: "Nkwadebe",
      ha: "Shiri",
      pcm: "Readiness"
    },
    preview: {
      en: "Preview",
      yo: "Wò Tẹ́lẹ̀",
      ig: "Nlele Mbụ",
      ha: "Rigaya Duba",
      pcm: "Preview"
    },
    forward: {
      en: "Forward",
      yo: "Firanṣẹ́ síwájú",
      ig: "Ziga n'Ihu",
      ha: "Aika Gaba",
      pcm: "Forward"
    },
    resetFilters: {
      en: "Reset Filters",
      yo: "Tún Àwọn Asẹ́ Ṣètò",
      ig: "Tọgharịa Ihe Nzacha",
      ha: "Sake Saita Matattara",
      pcm: "Reset Filters"
    },
    createdLabel: {
      en: "Created:",
      yo: "Ọjọ́ Ìṣẹ̀dá:",
      ig: "Emepụtara:",
      ha: "An Ƙirƙira:",
      pcm: "Created:"
    },
    tryAgain: {
      en: "Try Again",
      yo: "Gbìyànjú Lẹ́ẹ̀kansi",
      ig: "Nwaa Ọzọ",
      ha: "Sake Gwada",
      pcm: "Try Again"
    },
    preparing: {
      en: "Preparing...",
      yo: "Ń gbáradì...",
      ig: "Na-akwadebe...",
      ha: "Ana shiryawa...",
      pcm: "Preparing..."
    }
  },
  checklists: {
    naReasonRequired: {
      en: "A mandatory reason is required when marking an item Not Applicable.",
      yo: "Ìdí tó dunjú pọn dandan nígbà tí a bá ń sọ pé ohun kan kò kan ilé-iṣẹ́.",
      ig: "Ihe kpatara ya dị mkpa mgbe ị na-egosi na ihe adịghị emetụta ya.",
      ha: "Dole ne a bayar da dalili idan aka sa alamar Ba Ya Aiki.",
      pcm: "You must put reason if you mark any item Not Applicable."
    },
    periodLockedNotice: {
      en: "This period is locked. Edits are disabled.",
      yo: "A ti tì àkókò yìí pa. A ti dẹ́kun àwọn àtúnṣe.",
      ig: "Akpọchiela oge a. Agbanyụrụ ndezi.",
      ha: "An kulle wannan lokacin. An kashe damar yin gyara.",
      pcm: "This period don lock. Edit no dey allowed."
    },
    categoryCash: {
      en: "Category A: Cash & Bank",
      yo: "Ìpín A: Owó Lọ́wọ́ & Bánkì",
      ig: "Ngalaba A: Ego dị n'Aka na Ụlọ Akụ",
      ha: "Rukuni A: Kuɗi da Banki",
      pcm: "Category A: Cash and Bank"
    },
    categoryReceivables: {
      en: "Category B: Receivables",
      yo: "Ìpín B: Owó tí a ń retí",
      ig: "Ngalaba B: Ego A Na-echere",
      ha: "Rukuni B: Karɓar Kuɗi",
      pcm: "Category B: Receivables"
    },
    categoryPayables: {
      en: "Category C: Payables",
      yo: "Ìpín C: Gbèsè tí a gbọdọ̀ san",
      ig: "Ngalaba C: Ego A Ga-akwụ",
      ha: "Rukuni C: Biyan Kuɗi",
      pcm: "Category C: Payables"
    },
    categoryAccrualsAssets: {
      en: "Category D: Accruals & Assets",
      yo: "Ìpín D: Ìṣirò tí kò tíì san & Àwọn Ohun Ìní",
      ig: "Ngalaba D: Ego Ndị A Na-akwụbeghị na Ngwongwo",
      ha: "Rukuni D: Kuɗin da Ba a Biya ba da Kaddarori",
      pcm: "Category D: Accruals and Assets"
    },
    categoryTaxPayroll: {
      en: "Category E: Tax & Payroll",
      yo: "Ìpín E: Owó Orí & Owó Oṣù",
      ig: "Ngalaba E: Ụtụ Isi na Ụgwọ Ọrụ",
      ha: "Rukuni E: Haraji da Albashi",
      pcm: "Category E: Tax and Payroll"
    },
    categoryFinancing: {
      en: "Category E: Financing & Intercompany",
      yo: "Ìpín E: Ìṣúná Owó & Àjọṣepọ̀ Ilé-iṣẹ́",
      ig: "Ngalaba E: Ego na Mmekọrịta Ụlọ Ọrụ",
      ha: "Rukuni E: Kuɗi da Mu'amalar Kamfanoni",
      pcm: "Category E: Financing and Intercompany"
    },
    categoryReviewLock: {
      en: "Category F: Review & Lock",
      yo: "Ìpín F: Àyẹ̀wò & Títì Pa",
      ig: "Ngalaba F: Nnyocha na Mkpọchi",
      ha: "Rukuni F: Bita da Kullewa",
      pcm: "Category F: Review and Lock"
    },
    periodLockedHeading: {
      en: "Period Locked & Signed Off",
      yo: "Àkókò Ti Tì Pa & Ti Fọwọ́ Sí",
      ig: "Oge A Kpọchiri Akpọchi na Kwadoro",
      ha: "An Kulle Lokacin kuma An Sa Hannu",
      pcm: "Period Locked and Signed Off"
    },
    periodLockedByDetails: {
      en: "Period locked by supervisor. Verification records are immutable.",
      yo: "Alábòójútó ti tì àkókò yìí pa. Àkọsílẹ̀ àyẹ̀wò kò ṣe é yí padà.",
      ig: "Onye nlekọta kpọchiri oge a. Ihe ndekọ nkwenye anaghị agbanwe agbanwe.",
      ha: "Mai kula ya kulle lokacin. Bayanan tantancewa ba sa canzawa.",
      pcm: "Supervisor don lock this period. Verification records dey immutable."
    },
    submittedForReviewTitle: {
      en: "Submitted for Review",
      yo: "Ti Fisilẹ̀ fún Àyẹ̀wò",
      ig: "Enyefere maka Nnyocha",
      ha: "An Miƙa don Bita",
      pcm: "Submitted for Review"
    },
    category: {
      en: "Category",
      yo: "Ìpín",
      ig: "Udi",
      ha: "Rukuni",
      pcm: "Category"
    },
    openDedicatedWeekly: {
      en: "Open Dedicated Weekly Workspace",
      yo: "Ṣí Gbọ̀ngàn Iṣẹ́ Ọ̀sọ̀ọ̀sẹ̀",
      ig: "Mepee Ebe Ọrụ Pụrụ Iche nke Izu",
      ha: "Bude Wurin Aiki na Mako-mako",
      pcm: "Open Dedicated Weekly Workspace"
    },
    submitForReview: {
      en: "Submit for Review",
      yo: "Fisilẹ̀ fún Àyẹ̀wò",
      ig: "Nyefee maka Nnyocha",
      ha: "Miƙa don Bita",
      pcm: "Submit for Review"
    },
    selectReportingWeek: {
      en: "Select Reporting Week",
      yo: "Yan Ọ̀sẹ̀ Ìròyìn",
      ig: "Họrọ Izu Ndekọ",
      ha: "Zaɓi Makon Rahoto",
      pcm: "Select Reporting Week"
    },
    currentWeek: {
      en: "Current",
      yo: "Lọ́wọ́lọ́wọ́",
      ig: "Ugbu a",
      ha: "Na Yanzu",
      pcm: "Current"
    },
    completedItems: {
      en: "Completed Items",
      yo: "Àwọn Ohun tó ti Parí",
      ig: "Ihe Ndị Emechara",
      ha: "Abubuwan da aka Kammala",
      pcm: "Completed Items"
    },
    inProgressItems: {
      en: "Awaiting Verification",
      yo: "Ń Dúró de Ìfọwọ́sí",
      ig: "Na-eche Nkwenye",
      ha: "Yana Jiran Tabbatarwa",
      pcm: "Awaiting Verification"
    },
    missingEvidence: {
      en: "Missing Evidence",
      yo: "Ẹ̀rí tí Kò Sí",
      ig: "Ihe Akaebe Na-efu",
      ha: "Shaidar da ta Bace",
      pcm: "Missing Evidence"
    },
    signOffStatus: {
      en: "Supervisor Status",
      yo: "Ipò Alábòójútó",
      ig: "Ọnọdụ Onye Nlekọta",
      ha: "Matsayin Mai Kula",
      pcm: "Supervisor Status"
    },
    statusSignedOff: {
      en: "Signed Off & Locked",
      yo: "Ti Fọwọ́ Sí & Ti Tì Pa",
      ig: "A Kwadoro ma Kpọchie",
      ha: "An Sa Hannu kuma An Kulle",
      pcm: "Signed Off and Locked"
    },
    statusUnderReview: {
      en: "Under Review",
      yo: "Lábẹ́ Àyẹ̀wò",
      ig: "N'okpuru Nnyocha",
      ha: "Karkashin Bita",
      pcm: "Under Review"
    },
    statusPendingSubmission: {
      en: "Open Postings",
      yo: "Àkọsílẹ̀ Tó Ṣí Sílẹ̀",
      ig: "Ndekọ Meghere Emeghe",
      ha: "Ayyukan da ke Buɗe",
      pcm: "Open Postings"
    },
    journeyTitle: {
      en: "Pre-Audit Preparation Journey (6-Month Runway)",
      yo: "Ìrìn-Àjò Ìmúrasílẹ̀ fún Àyẹ̀wò (Oṣù Mẹ́fà)",
      ig: "Njem Nkwadebe Tupu Nnyocha (Ọnwa 6)",
      ha: "Tafiyar Shirye-shiryen Bincike (Watanni 6)",
      pcm: "Pre-Audit Preparation Journey (6-Month Runway)"
    },
    stepRunway: {
      en: "6-Month Countdown",
      yo: "Kíkà Oṣù Mẹ́fà",
      ig: "Ọgụgụ Ọnwa 6",
      ha: "Ƙididdigar Watanni 6",
      pcm: "6-Month Countdown"
    },
    stepRunwayDesc: {
      en: "Runway initialized",
      yo: "A ti bẹ̀rẹ̀ kíkà àkókò",
      ig: "Amalitere usoro nkwadebe",
      ha: "An fara shiri",
      pcm: "Runway don start"
    },
    stepSchedules: {
      en: "Lead Schedules",
      yo: "Àwọn Àtẹ Ìṣirò Pàtàkì",
      ig: "Usoro Isi Ihe Ndekọ",
      ha: "Babban Jadawalin Ƙididdiga",
      pcm: "Lead Schedules"
    },
    stepSchedulesDesc: {
      en: "Drafting core balances",
      yo: "Ń pèsè àwọn ìṣirò pàtàkì",
      ig: "Na-akwadebe isi nguzozi",
      ha: "Ana shirya manyan ma'auni",
      pcm: "Drafting core balances"
    },
    stepSupporting: {
      en: "Supporting Records",
      yo: "Àwọn Àkọsílẹ̀ Ìtìlẹ́yìn",
      ig: "Akwụkwọ Nkwado",
      ha: "Bayanan Tallafi",
      pcm: "Supporting Records"
    },
    stepSupportingDesc: {
      en: "Bank, FA, inventory docs",
      yo: "Ìwé bánkì, ohun ìní, àti ọjà",
      ig: "Akwụkwọ ụlọ akụ, ngwongwo, na ngwaahịa",
      ha: "Takardun banki, kaddara, da kayayyaki",
      pcm: "Bank, FA, inventory docs"
    },
    stepTax: {
      en: "Tax & Statutory",
      yo: "Owó Orí & Òfin",
      ig: "Ụtụ Isi na Iwu",
      ha: "Haraji da Ka'idojin Doka",
      pcm: "Tax and Statutory"
    },
    stepTaxDesc: {
      en: "Returns & compliance filings",
      yo: "Ìfipamọ́ ìwé owó orí & ìbámu òfin",
      ig: "Ndekọ ụtụ isi na ndekọ iwu",
      ha: "Miƙa takardun haraji da bin doka",
      pcm: "Returns and compliance filings"
    },
    stepReadiness: {
      en: "Audit Readiness",
      yo: "Ìmúrasílẹ̀ fún Àyẹ̀wò",
      ig: "Nkwadebe Nnyocha",
      ha: "Shirin Bincike",
      pcm: "Audit Readiness"
    },
    stepReadinessDesc: {
      en: "Final review & sign-off",
      yo: "Àyẹ̀wò ìkẹyìn & ìfọwọ́sí",
      ig: "Nnyocha ikpeazụ na nkwado",
      ha: "Bita ta ƙarshe da sa hannu",
      pcm: "Final review and sign-off"
    },
    auditorReadOnlyBadge: {
      en: "Auditor Read-Only Inspection",
      yo: "Wíwò Nìkan fún Olùṣàyẹ̀wò",
      ig: "Nlele Naanị Maka Onye Nnyocha",
      ha: "Duba Na Karantawa Kawai Mai Bincike",
      pcm: "Auditor Read-Only Inspection"
    },
    varianceLabel: {
      en: "Variance:",
      yo: "Ìyàtọ̀:",
      ig: "Ọdịiche:",
      ha: "Bambanci:",
      pcm: "Variance:"
    }
  },
  review: {
    respondRejection: {
      en: "Respond & Resubmit Evidence",
      yo: "Dáhùn & Tún Ẹ̀rí Fisilẹ̀",
      ig: "Za ma Nyefee Ihe Akaebe Ọzọ",
      ha: "Amsa da Sake Miƙa Shaida",
      pcm: "Respond and Resubmit Evidence"
    },
    overdueAttention: {
      en: "Submissions Overdue for Auditor Determination",
      yo: "Àwọn Ìfisílẹ̀ tí Àkókò Ìpinnu Olùṣàyẹ̀wò Ti Kọjá",
      ig: "Ntinye Oge Ha Agafeela Maka Mkpebi Onye Nnyocha",
      ha: "Ayyukan da Lokacin Hukuncin Mai Bincike Ya Wuce",
      pcm: "Submissions wey overdue for Auditor decision"
    },
    pendingAttention: {
      en: "Submissions Waiting for Auditor Determination",
      yo: "Àwọn Ìfisílẹ̀ tí ń Dúró de Ìpinnu Olùṣàyẹ̀wò",
      ig: "Ntinye Na-eche Mkpebi Onye Nnyocha",
      ha: "Ayyukan da ke Jiran Hukuncin Mai Bincike",
      pcm: "Submissions wey dey wait for Auditor decision"
    },
    attentionDesc: {
      en: "Review documentary evidence promptly to keep accounting teams unblocked.",
      yo: "Yẹ àwọn ẹ̀rí ìwé wò ní kíákíá kí ẹgbẹ́ ìṣirò owó má bàa dánilọ́wọ́ kọ́.",
      ig: "Nyochaa akwụkwọ akaebe ngwa ngwa ka ị ghara igbochi ndị otu ndekọ ego.",
      ha: "Duba hujjojin takardu cikin sauri don kada a tsayar da aikin ƙungiyar ƙididdiga.",
      pcm: "Review documentary evidence quick make accounting team continue their work."
    },
    filterPendingOnly: {
      en: "Focus on Pending",
      yo: "Fojú sori Èyí tí ń Dúró",
      ig: "Leba anya na Ndị Na-eche",
      ha: "Mayar da Hankali kan Masu Jira",
      pcm: "Focus on Pending"
    }
  },
  assets: {
    filterByStatus: {
      en: "Filter by verification status",
      yo: "Ṣe asẹ́ nípasẹ̀ ipò ìfọwọ́sí",
      ig: "Nzacha site na ọnọdụ nkwenye",
      ha: "Tace ta hanyar matsayin tabbatarwa",
      pcm: "Filter by verification status"
    }
  },
  errors: {
    unauthorizedOrMissing: {
      en: "The submission may be unavailable or you may lack permission for this engagement.",
      yo: "Ìfisílẹ̀ náà lè má sí tàbí o kò ní àṣẹ fún iṣẹ́ àyẹ̀wò yìí.",
      ig: "Ntinye ahụ nwere ike ọ gaghị adị ma ọ bụ na i nweghị ikike maka ọrụ a.",
      ha: "Wataƙila babu wannan aikin ko kuma ba ku da izini a kansa.",
      pcm: "The submission fit no dey or you no get permission for this engagement."
    },
    somethingWentWrong: {
      en: "Something went wrong",
      yo: "Nǹkan kan bàjẹ́",
      ig: "Ihe mebiri",
      ha: "Wani abu ya sami matsala",
      pcm: "Something went wrong"
    },
    reloadApplication: {
      en: "Reload Application",
      yo: "Tún Ìṣàfilọ́lẹ̀ Ṣí",
      ig: "Mepee Ngwa Ahụ Ọzọ",
      ha: "Sake Bude Manhaja",
      pcm: "Reload Application"
    },
    returnToHome: {
      en: "Return to Home",
      yo: "Padà sí Ilé",
      ig: "Laghachi n'Ụlọ",
      ha: "Koma Shafin Farko",
      pcm: "Return to Home"
    }
  },
  legal: {
    authoritativeNoticeBody: {
      en: "Sabi Africa Innovations Limited provides software workflow technology only and does not provide accounting, audit, tax, legal, or investment advice. The English version of these Terms is the authoritative legal document under Nigerian law. In the event of any discrepancies or differences in translation, the English text shall prevail.",
      yo: "Sabi Africa Innovations Limited ń pèsè ìmọ̀-ẹ̀rọ iṣẹ́ sọfitiwia nìkan, kì í ṣe ìmọ̀ràn ìṣirò owó, àyẹ̀wò, owó orí, òfin, tàbí ìdókòwò. Èdè Gẹ̀ẹ́sì ti Àwọn Ìlànà wọ̀nyí ni ìwé òfin tó lágbára lábẹ́ òfin orílẹ̀-èdè Nàìjíríà. Bí ìyàtọ̀ kankan bá wà nínú ìtumọ̀, ọ̀rọ̀ èdè Gẹ̀ẹ́sì ni yóò borí.",
      ig: "Sabi Africa Innovations Limited na-enye naanị teknụzụ usoro ọrụ sọftụwia ma anaghị enye ndụmọdụ gbasara ndekọ ego, nyocha, ụtụ isi, iwu, ma ọ bụ itinye ego. Ụdị Bekee nke Usoro Ndị a bụ akwụkwọ iwu nwere ikike n'okpuru iwu Naijiria. Ọ bụrụ na enwere esemokwu ma ọ bụ ọdịiche na ntụgharị asụsụ, ederede Bekee ga-aka.",
      ha: "Sabi Africa Innovations Limited tana samar da fasahar aiki ta manhaja kawai kuma ba ta ba da shawarar ƙididdiga, binciken kuɗi, haraji, doka, ko saka hannun jari ba. Sigar Ingilishi ta waɗannan Sharuɗɗa ita ce halaltacciyar takardar doka a ƙarƙashin dokar Najeriya. Idan aka sami wani bambanci a cikin fassarar, rubutun Ingilishi ne zai yi aiki.",
      pcm: "Sabi Africa Innovations Limited dey provide software workflow technology only and no dey give accounting, audit, tax, legal, or investment advice. The English version of these Terms na the main legal document under Nigerian law. If any difference dey for translation, the English text go carry the day."
    },
    searchTerms: {
      en: "Search sections...",
      yo: "Wá àwọn apá...",
      ig: "Chọọ ngalaba...",
      ha: "Bincika sassa...",
      pcm: "Search sections..."
    },
    officialDocument: {
      en: "Official Corporate Document",
      yo: "Ìwé Ìṣe Ilé-iṣẹ́ Pàtàkì",
      ig: "Akwụkwọ Ụlọ Ọrụ Gọọmentị Kwadoro",
      ha: "Takardar Kamfani ta Doka",
      pcm: "Official Corporate Document"
    },
    jurisdiction: {
      en: "Federal Republic of Nigeria",
      yo: "Orílẹ̀-èdè Olómìnira Àpapọ̀ Nàìjíríà",
      ig: "Federal Republic of Nigeria",
      ha: "Jamhuriyar Tarayyar Najeriya",
      pcm: "Federal Republic of Nigeria"
    },
    registeredOffice: {
      en: "Registered Office:",
      yo: "Ọ́fíìsì tí a Forúkọsílẹ̀:",
      ig: "Ụlọ Ọrụ Edebanyere Aha:",
      ha: "Ofishin da aka Yi wa Rajista:",
      pcm: "Registered Office:"
    },
    generalEmail: {
      en: "General Email:",
      yo: "Ímeèlì Gbbogbogbò:",
      ig: "Ozi Ịntanetị Izugbe:",
      ha: "Babban Imel:",
      pcm: "General Email:"
    },
    securityEmail: {
      en: "Security Email:",
      yo: "Ímeèlì Àbò:",
      ig: "Ozi Ịntanetị Nchekwa:",
      ha: "Imel ɗin Tsaro:",
      pcm: "Security Email:"
    }
  },
  landing: {
    storyProblem: {
      bridgeText: {
        en: "Bridging the gap between corporate accounting and external audit fieldwork.",
        yo: "Pípèsè afárá láàárín ìṣirò owó ilé-iṣẹ́ àti iṣẹ́ àyẹ̀wò owó lóde.",
        ig: "Ijikọ ọdịiche dị n'etiti ndekọ ego ụlọ ọrụ na nyocha ego nke mpụga.",
        ha: "Haɗa gibi tsakanin ƙididdigar kamfani da aikin binciken kuɗi na waje.",
        pcm: "Connecting company accounting work and external audit fieldwork."
      }
    },
    hero: {
      pill: {
        en: "SECURE AUDIT WORKSPACE",
        yo: "GBỌ̀NGÀN ÀYẸ̀WÒ OWÓ TÓ LÁBÒ",
        ig: "EBE ỌRỤ NNYOCHA EGO NWEREREN CHEKWA",
        ha: "WURIN AIKIN BINCIKEN KUƊI MAI TSARO",
        pcm: "SECURE AUDIT WORKSPACE"
      }
    },
    continuousRunway: {
      en: "Continuous Preparation Runway",
      yo: "Ọ̀nà Ìmúrasílẹ̀ fún Ìgbà Gbogbo",
      ig: "Usoro Nkwadebe Na-aga N'ihu",
      ha: "Hanyar Shirye-shiryen Ci gaba",
      pcm: "Continuous Preparation Runway"
    },
    weeklyToPreAudit: {
      en: "Weekly to Pre-Audit",
      yo: "Ọ̀sọ̀ọ̀sẹ̀ dé Ìmúrasílẹ̀ Àyẹ̀wò",
      ig: "Kwa Izu ruo Tupu Nnyocha",
      ha: "Daga Mako zuwa Shirin Bincike",
      pcm: "Weekly to Pre-Audit"
    },
    weeklyCheckpoints: {
      en: "Weekly Checkpoints",
      yo: "Àwọn Àyẹ̀wò Ọ̀sọ̀ọ̀sẹ̀",
      ig: "Nlele Nyocha Kwa Izu",
      ha: "Binciken Mako-mako",
      pcm: "Weekly Checkpoints"
    },
    monthEndClosing: {
      en: "Month-End Closing",
      yo: "Ìparí Oṣù Ìṣirò",
      ig: "Mmechi Ọgwụgwụ Ọnwa",
      ha: "Rufe Ƙarshen Wata",
      pcm: "Month-End Closing"
    },
    preAuditPrep: {
      en: "Pre-Audit Preparation",
      yo: "Ìmúrasílẹ̀ fún Àyẹ̀wò",
      ig: "Nkwadebe Tupu Nnyocha",
      ha: "Shirin Kafin Bincike",
      pcm: "Pre-Audit Preparation"
    },
    dueInDays: {
      en: "Due in {{days}} days",
      yo: "Yóò tó ní ọjọ́ {{days}}",
      ig: "Ga-agafe n'ime ụbọchị {{days}}",
      ha: "Zai cika nan da kwanaki {{days}}",
      pcm: "Due in {{days}} days"
    },
    statutoryAuditReady: {
      en: "Statutory Audit Ready",
      yo: "Múra Sílẹ̀ fún Àyẹ̀wò ti Òfin",
      ig: "Dị Njikere Maka Nnyocha Iwu",
      ha: "A Shirye don Binciken Doka",
      pcm: "Statutory Audit Ready"
    },
    builtForNdpa: {
      en: "Built for NDPA Privacy Standards",
      yo: "A kọ́ ọ fún Àwọn Ìlànà Àṣírí NDPA",
      ig: "E wuru ya maka Usoro Nzuzo NDPA",
      ha: "An gina shi don Ƙa'idojin Tsaron Bayanai na NDPA",
      pcm: "Built for NDPA Privacy Standards"
    },
    multiYearRecord: {
      en: "Multi-Year Record Preserved",
      yo: "Àkọsílẹ̀ Ọ̀pọ̀ Ọdún tí a Pa Mọ́",
      ig: "Echekwara Ndekọ Ọtụtụ Afọ",
      ha: "An Adana Bayanan Shekaru Masu Yawa",
      pcm: "Multi-Year Record Preserved"
    },
    seeWorkflowInAction: {
      en: "See workflow in action",
      yo: "Wo bí iṣẹ́ ṣe ń lọ",
      ig: "Hụ ka usoro ọrụ si arụ ọrụ",
      ha: "Duba yadda tsarin aiki ke gudana",
      pcm: "See workflow in action"
    },
    docProgression: {
      en: "Document Workflow Progression",
      yo: "Ìtẹ̀síwájú Iṣẹ́ Àwọn Ìwé",
      ig: "Ọganihu Usoro Akwụkwọ",
      ha: "Ci gaban Tsarin Takardu",
      pcm: "Document Workflow Progression"
    },
    supportedSchedules: {
      en: "Supported Evidentiary Schedules",
      yo: "Àwọn Àtẹ Ẹ̀rí tí a tì lẹ́yìn",
      ig: "Usoro Ihe Akaebe A Kwadoro",
      ha: "Jadawalin Hujjoji Masu Tallafi",
      pcm: "Supported Evidentiary Schedules"
    },
    docAnchoredNotice: {
      en: "Documents are permanently anchored to their audit request inquiry.",
      yo: "Àwọn ìwé wà ní sísopọ̀ pátápátá mọ́ ìbéèrè àyẹ̀wò wọn.",
      ig: "A na-ejikọta akwụkwọ kpamkpam na ajụjụ nyocha ha.",
      ha: "Ana haɗa takardu har abada da buƙatar binciken da ta dace.",
      pcm: "Documents dey permanently connected to their audit request."
    },
    nextStage: {
      en: "Next Stage",
      yo: "Ipele Tó Kàn",
      ig: "Ọkwa Na-esonụ",
      ha: "Mataki na Gaba",
      pcm: "Next Stage"
    },
    refTemplateAttached: {
      en: "Reference Schedule Template Attached",
      yo: "A so àtẹ àkọsílẹ̀ ìtọ́kasí pọ̀",
      ig: "Agakwunyere Usoro Ntụaka",
      ha: "An Haɗa Samfurin Jadawalin Magana",
      pcm: "Reference Schedule Template Attached"
    },
    statusProgression: {
      en: "Status Progression",
      yo: "Ìtẹ̀síwájú Ipò",
      ig: "Ọganihu Ọnọdụ",
      ha: "Ci gaban Matsayi",
      pcm: "Status Progression"
    },
    activeReviewBoundary: {
      en: "Active Review Boundary",
      yo: "Ààlà Àyẹ̀wò tí ń Lọ Lọ́wọ́",
      ig: "Oke Nnyocha Na-arụ Ọrụ",
      ha: "Yankin Bita Mai Aiki",
      pcm: "Active Review Boundary"
    },
    returnedForResponse: {
      en: "Returned for Response",
      yo: "Dá padà fún Ìdáhùn",
      ig: "Laghachiri maka Nzaghachi",
      ha: "An Dawo da Shi don Amsa",
      pcm: "Returned for Response"
    },
    keyResponsibilities: {
      en: "Key Operational Responsibilities",
      yo: "Àwọn Ojúṣe Iṣẹ́ Pàtàkì",
      ig: "Isi Ọrụ Ịrụ Ọrụ",
      ha: "Manyan Nauyin Aiki",
      pcm: "Key Operational Responsibilities"
    },
    privacyByDesign: {
      en: "Privacy by Design",
      yo: "Àṣírí láti Ìpìlẹ̀",
      ig: "Nzuzo site na Nhazi",
      ha: "Tsaron Bayanai tun daga Farko",
      pcm: "Privacy by Design"
    }
  },
  documents: {
    currentSubmission: {
      en: "Current Submission",
      yo: "Ìfisílẹ̀ Lọ́wọ́lọ́wọ́",
      ig: "Ntinye Ugbu a",
      ha: "Miƙa na Yanzu",
      pcm: "Current Submission"
    },
    statusRejected: {
      en: "Rejected",
      yo: "Ti Kọ̀",
      ig: "Ajụrụ",
      ha: "An Ƙi",
      pcm: "Rejected"
    },
    statusApproved: {
      en: "Approved",
      yo: "Ti Fọwọ́ Sí",
      ig: "Kwadoro",
      ha: "An Amince",
      pcm: "Approved"
    },
    fileLabel: {
      en: "File:",
      yo: "Fáìlì:",
      ig: "Faịlụ:",
      ha: "Fayil:",
      pcm: "File:"
    },
    sizeLabel: {
      en: "Size:",
      yo: "Ìwọ̀n:",
      ig: "Size:",
      ha: "Girma:",
      pcm: "Size:"
    },
    uploadedByLabel: {
      en: "Uploaded By:",
      yo: "Ẹni tó gbé e wọlé:",
      ig: "Onye bulitere:",
      ha: "Wanda ya loda:",
      pcm: "Uploaded By:"
    },
    dateLabel: {
      en: "Date:",
      yo: "Ọjọ́:",
      ig: "Ụbọchị:",
      ha: "Kwanan Wata:",
      pcm: "Date:"
    },
    rejectionReasonLabel: {
      en: "Auditor Rejection Reason:",
      yo: "Ìdí tí Olùṣàyẹ̀wò fi Kọ̀:",
      ig: "Ihe Mere Onye Nnyocha Ji Jụ:",
      ha: "Dalilin Ƙin Amincewa na Mai Bincike:",
      pcm: "Auditor Rejection Reason:"
    },
    sha256Checksum: {
      en: "SHA-256 Checksum",
      yo: "Àmì Àbò SHA-256",
      ig: "Nlele Nchekwa SHA-256",
      ha: "Lambar Tsaro ta SHA-256",
      pcm: "SHA-256 Checksum"
    },
    permanentNotice: {
      en: "Uploaded documents remain part of the permanent engagement audit history.",
      yo: "Àwọn ìwé tí a gbé wọlé yóò wà gẹ́gẹ́ bí apá kan àkọsílẹ̀ àyẹ̀wò títí láé.",
      ig: "Akwụkwọ ndị e bulitere na-anọgide dị ka akụkụ nke akụkọ nyocha na-adịgide adịgide.",
      ha: "Takardun da aka loda suna ci gaba da kasancewa cikin tarihin binciken har abada.",
      pcm: "Uploaded documents go remain part of permanent audit history."
    }
  },
  signOut: {
    bulletSessionInvalidated: {
      en: "Server-side HTTP session invalidated",
      yo: "A ti fòpin sí àkókò ìgbéwọlé ní orí ẹ̀rọ",
      ig: "A kagbuola oge nchọgharị na sava",
      ha: "An soke zaman shiga a uwar garken",
      pcm: "Server-side HTTP session don invalidate"
    },
    bulletCacheWiped: {
      en: "React Query and workpaper state wiped",
      yo: "A ti pa gbogbo àkọsílẹ̀ àti ìrántí sọfitiwia rẹ́",
      ig: "Ehichapụrụ data nchekwa na akwụkwọ ọrụ",
      ha: "An goge bayanan aiki da na ƙwaƙwalwa",
      pcm: "React Query and workpaper state don wipe"
    },
    bulletZeroCached: {
      en: "Zero sensitive evidentiary files remain cached",
      yo: "Kò sí fáìlì ẹ̀rí kankan tí ó kù ní ìrántí ẹ̀rọ",
      ig: "Enweghị faịlụ ihe akaebe dị nro fọdụrụ na ebe nchekwa",
      ha: "Babu wani fayil na shaida da ya rage a ma'ajiyar",
      pcm: "Zero sensitive evidence files remain for cache"
    }
  },
  pwa: {
    installTitle: {
      en: "Install FinAuditEase",
      yo: "Fi FinAuditEase sí Ẹ̀rọ Rẹ",
      ig: "Wụnye FinAuditEase",
      ha: "Sanya FinAuditEase",
      pcm: "Install FinAuditEase"
    },
    installSubtitle: {
      en: "Install on your device for faster access and offline readiness.",
      yo: "Fi sí ẹ̀rọ rẹ fún wíwọlé kíákíá àti ìmúrasílẹ̀ láìsí intanẹ́ẹ̀tì.",
      ig: "Wụnye na ngwaọrụ gị maka ohere ngwa ngwa na nkwadebe n'anọghị n'ịntanetị.",
      ha: "Sanya a kan na'urarka don samun shiga cikin sauri da aiki ba tare da intanet ba.",
      pcm: "Install for your device for faster access and offline readiness."
    },
    installBtn: {
      en: "Install App",
      yo: "Fi Ìṣàfilọ́lẹ̀ Sí",
      ig: "Wụnye Ngwa",
      ha: "Sanya Manhaja",
      pcm: "Install App"
    },
    dismiss: {
      en: "Not Now",
      yo: "Kì í ṣe Nísinsìnyí",
      ig: "Ọ Bụghị Ugbu a",
      ha: "Ba Yanzu ba",
      pcm: "Not Now"
    },
    installed: {
      en: "FinAuditEase is installed",
      yo: "A ti fi FinAuditEase sí ẹ̀rọ rẹ",
      ig: "Awụnyela FinAuditEase",
      ha: "An riga an sanya FinAuditEase",
      pcm: "FinAuditEase don install"
    },
    iosInstructionsTitle: {
      en: "Install on iOS",
      yo: "Fi sí ẹ̀rọ iOS (iPhone/iPad)",
      ig: "Wụnye na iOS",
      ha: "Sanya a kan iOS",
      pcm: "Install for iOS"
    },
    iosInstructions: {
      en: "Tap the Share button in Safari, then choose 'Add to Home Screen'.",
      yo: "Tẹ bọ́tìnì Pín (Share) ní Safari, lẹ́yìn náà yan 'Add to Home Screen'.",
      ig: "Pịa bọtịnụ Share na Safari, wee họrọ 'Add to Home Screen'.",
      ha: "Danna maballin Share a Safari, sannan ka zaɓi 'Add to Home Screen'.",
      pcm: "Tap the Share button for Safari, then select 'Add to Home Screen'."
    },
    offlineTitle: {
      en: "You are currently offline",
      yo: "O kò sí lórí intanẹ́ẹ̀tì báyìí",
      ig: "Ị nọghị n'ịntanetị ugbu a",
      ha: "Ba ku da intanet a yanzu",
      pcm: "You dey offline currently"
    },
    offlineDesc: {
      en: "Live audit and financial records require an active network connection. Uploads and mutations are disabled until connection is restored.",
      yo: "Àkọsílẹ̀ àyẹ̀wò àti ìṣirò owó ojúlówó nílò intanẹ́ẹ̀tì. A ti dẹ́kun ìgbéwọlé títí tí intanẹ́ẹ̀tì yóò fi padà bọ̀.",
      ig: "Ndekọ nyocha na ego chọrọ njikọ ịntanetị na-arụ ọrụ. Agbanyụrụ nbudata na mgbanwe ruo mgbe njikọ laghachiri.",
      ha: "Bayanan bincike da na kuɗi na buƙatar intanet mai aiki. An kashe loda da sauye-sauye har sai an sake haɗa intanet.",
      pcm: "Live audit and financial records need active network connection. Upload and edits dey disabled until connection dey back."
    },
    backOnline: {
      en: "Connection restored. You are back online.",
      yo: "Intanẹ́ẹ̀tì ti padà bọ̀. O ti wà lórí ayélujára báyìí.",
      ig: "Njikọ adịghachila. Ị nọghachila n'ịntanetị.",
      ha: "An dawo da intanet. Yanzu kuna kan layi.",
      pcm: "Network don come back. You dey online now."
    }
  }
};

function deepMerge(target, source, lang) {
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !('en' in source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key], lang);
    } else if (source[key] && typeof source[key] === 'object' && ('en' in source[key])) {
      target[key] = source[key][lang] || source[key]['en'];
    }
  }
}

for (const lang of languages) {
  deepMerge(data[lang], translations, lang);
  const filePath = path.join(localesDir, `${lang}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data[lang], null, 2) + '\n', 'utf8');
  console.log(`Updated ${lang}.json`);
}

console.log('Successfully synced all translation keys across all 5 languages!');
